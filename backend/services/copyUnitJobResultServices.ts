import { waitWithExponentialBackOff } from "../../globalFns";
import {
  getGDriveItem,
  TCopyUnitJobResult,
} from "../../pages/api/gp-plus/copy-unit";
import CopyUnitResults from "../models/copyUnitResults";
import { ICopyUnitResult } from "../models/copyUnitResults/types";
import { refreshAuthToken } from "./googleDriveServices";

export const insertCopyUnitJobResult = async (
  copyUnitResult: Omit<ICopyUnitResult, "_id">
) => {
  try {
    const insertionResult = await CopyUnitResults.insertOne(copyUnitResult, {
      validateBeforeSave: true,
    });

    console.log("insertionResult: ", insertionResult);

    return { wasSuccessful: true, insertionResult };
  } catch (error) {
    console.error("Failed to insert copy unit job result. Error: ", error);

    return { wasSuccessful: false, errorObj: error };
  }
};

export const updateCopyUnitJobs = async (
  filter: Partial<Record<keyof ICopyUnitResult, unknown>>,
  update: Partial<ICopyUnitResult>
) => {
  try {
    console.log(
      "Attempting to update copy unit jobs with filter: ",
      filter,
      " and update: ",
      update
    );

    return await CopyUnitResults.updateMany(filter, update);
  } catch (error) {
    console.error("Failed to update copy unit jobs. Error: ", error);

    return null;
  }
};

const getDoesGDriveItemExist = async (
  copyJob: ICopyUnitResult,
  gDriveAccessToken: string
): Promise<{
  errType: null | string;
  doesExist: boolean;
  copyJob: ICopyUnitResult;
}> => {
  try {
    const gdriveFolderMetaData = await getGDriveItem(
      copyJob.gdriveFolderId as string,
      gDriveAccessToken
    );

    if (
      gdriveFolderMetaData.errType === "unauthenticated" ||
      gdriveFolderMetaData.errType === "timeout"
    ) {
      return {
        errType: gdriveFolderMetaData.errType,
        copyJob,
        doesExist: false,
      };
    }

    if (gdriveFolderMetaData.errType) {
      throw new Error("The folder doesn't exist.");
    }

    return {
      errType: null,
      doesExist: true,
      copyJob,
    };
  } catch (error: any) {
    console.error("Failed to get Google Drive folder metadata. Error: ", error);

    return {
      doesExist: false,
      copyJob,
      errType: "notFound",
    };
  }
};

export const getCopyUnitFolderJobs = async (
  filter:
    | Partial<Record<keyof ICopyUnitResult, unknown>>
    | { $or: Partial<Record<keyof ICopyUnitResult, unknown>>[] },
  tries = 5
): Promise<Partial<{ jobs: ICopyUnitResult[]; errType: string }>> => {
  try {
    const jobs = await CopyUnitResults.find<ICopyUnitResult>(filter);

    return { jobs };
  } catch (error: any) {
    console.error("Failed to insert copy unit job result. Error: ", error);

    const didTimeoutOccur = error?.error?.codeName === "MaxTimeMSExpired";

    if (tries > 0 && didTimeoutOccur) {
      console.log("Will try again.");
      tries -= 1;
      const randomNumMs = Math.floor(Math.random() * (5_500 - 1000 + 1)) + 1000;
      const waitTime = randomNumMs + tries * 1_000;

      await waitWithExponentialBackOff(waitTime, [2_000, 5_000]);

      return await getCopyUnitFolderJobs(filter, tries);
    }

    if (didTimeoutOccur) {
      return {
        errType: "timeout",
      };
    }

    return {
      errType: "generalErr",
    };
  }
};

type TFoldersRetrieved = Record<
  "existingFolders" | "nonexistingFolders",
  ICopyUnitResult[]
>;

export const getAllExistingGDriveFolders = async (
  folderCopyJobs: ICopyUnitResult[],
  existingFolders: ICopyUnitResult[],
  nonexistingFolders: ICopyUnitResult[],
  gDriveAccessToken: string,
  refreshToken: string,
  origin: string,
  tries = 4
): Promise<Partial<TFoldersRetrieved & { errType: string }>> => {
  try {
    const getDoGDriveItemsExistPromises = folderCopyJobs.map(
      (folderCopyJob) => {
        return getDoesGDriveItemExist(folderCopyJob, gDriveAccessToken);
      }
    );
    const doGDriveItemsExistArr = await Promise.all(
      getDoGDriveItemsExistPromises
    );
    let didRefreshAccessToken = false;
    const foldersToQueryAgain: ICopyUnitResult[] = [];

    for (const doesFolderExistResult of doGDriveItemsExistArr) {
      const { copyJob, doesExist, errType } = doesFolderExistResult;

      if (errType === "notFound") {
        nonexistingFolders.push(copyJob);
        continue;
      }

      if (errType === "unauthenticated" && !didRefreshAccessToken) {
        foldersToQueryAgain.push(copyJob);
        const { accessToken, wasSuccessful } = await refreshAuthToken(
          refreshToken,
          origin
        );

        if (!wasSuccessful) {
          return {
            errType: "refreshGDriveTokenFailed",
          };
        }

        gDriveAccessToken = accessToken;
        didRefreshAccessToken = true;
        continue;
      }

      if (
        (errType === "unauthenticated" && didRefreshAccessToken) ||
        errType === "timeout"
      ) {
        foldersToQueryAgain.push(copyJob);
        continue;
      }

      if (doesExist) {
        existingFolders.push(copyJob);
      }
    }

    if (foldersToQueryAgain.length && tries > 0) {
      await waitWithExponentialBackOff(2);

      return await getAllExistingGDriveFolders(
        foldersToQueryAgain,
        existingFolders,
        nonexistingFolders,
        gDriveAccessToken,
        refreshToken,
        origin,
        tries - 1
      );
    }
    if (foldersToQueryAgain.length) {
      await waitWithExponentialBackOff(2);

      return {
        errType: "maxRetriesReached",
      };
    }

    return {
      existingFolders,
      nonexistingFolders,
    };
  } catch (error) {
    return {
      errType: "retrievalErr",
    };
  }
};

export const getLatestValidUnitCopyFolderJob = async (
  unitId: string,
  gDriveAccessToken: string,
  refreshGDriveToken: string,
  clientOrigin: string,
  userId: string,
  gdriveEmail: string,
) => {
  try {
    console.log(`getLatestValidUnitCopyFolderJob unitId: ${unitId}`);
    
    const filter: Partial<Record<keyof ICopyUnitResult, unknown>> = {
      unitId,
      errMsg: {
        $exists: false,
      },
      gdriveEmail,
      doesFolderCopyExistInUserGDrive: true,
      result: "success",
      userId: userId,
    };
    const targetCopyUnitFolderJobs = await getCopyUnitFolderJobs(filter, 3);

    console.log("targetCopyUnitFolderJobs: ", targetCopyUnitFolderJobs);

    if (!targetCopyUnitFolderJobs?.jobs?.length) {
      console.error("No jobs are present for this unit.");

      return {
        latestUnitFolderCopy: null,
        nonexistingFolders: null,
      };
    }

    if (targetCopyUnitFolderJobs.errType) {
      console.error(
        "Failed to retrieve copy unit folder jobs. Error type: ",
        targetCopyUnitFolderJobs.errType
      );

      throw new Error("copyUnitJobsRetrievalErr");
    }

    const { errType, existingFolders, nonexistingFolders } =
      await getAllExistingGDriveFolders(
        targetCopyUnitFolderJobs.jobs,
        [],
        [],
        gDriveAccessToken,
        refreshGDriveToken,
        clientOrigin
      );

    if (errType) {
      console.error(
        "Failed to check if copy unit folders exist. Error type: ",
        errType
      );
      throw new Error("copyUnitFoldersExistenceCheckErr");
    }

    if (!existingFolders?.length) {
      console.error("No existing copy unit folders found.");
      return {
        latestUnitFolderCopy: null,
        nonexistingFolders,
      };
    }

    const latestUnitFolderCopy = existingFolders.sort((folderA, folderB) => {
      return folderB.datetime.getTime() - folderA.datetime.getTime();
    })[0];

    return {
      latestUnitFolderCopy,
      nonexistingFolders,
    };
  } catch (error) {
    console.error("Failed to get latest copy unit folder job. Error: ", error);

    return {
      errType: "latestUnitCopyFolderJobRetrievalErr",
    };
  }
};
