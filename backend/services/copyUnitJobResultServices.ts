import { getGDriveItem } from "../../pages/api/gp-plus/copy-unit";
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

type TGetGDriveItemSuccessfullyRetrieved = Exclude<
  Awaited<ReturnType<typeof getGDriveItem>>,
  { errType: string }
>;

const getGDriveFolderMetaDataFromCopyJob = async (
  copyJob: ICopyUnitResult,
  gdriveAccessToken: string
): Promise<{
    errType: null | string;
    gdriveFolderMetaData: TGetGDriveItemSuccessfullyRetrieved | null;
    copyJob: ICopyUnitResult;
}> => {
  try {
    const gdriveFolderMetaData = await getGDriveItem(
      copyJob.gdriveFolderId as string,
      gdriveAccessToken
    );

    if (gdriveFolderMetaData.errType === "unauthenticated" || gdriveFolderMetaData.errType === "timeout") {
      return {
        errType: gdriveFolderMetaData.errType,
        copyJob,
        gdriveFolderMetaData: null,
      };
    }

    if (gdriveFolderMetaData.errType) {
      throw new Error("The folder doesn't exist.");
    }

    return {
      errType: null,
      gdriveFolderMetaData:
        gdriveFolderMetaData as TGetGDriveItemSuccessfullyRetrieved,
      copyJob,
    };
  } catch (error: any) {
    console.error("Failed to get Google Drive folder metadata. Error: ", error);

    return {
      gdriveFolderMetaData: null,
      copyJob,
      errType: "notFound",
    };
  }
};

type TGetGDriveFolderMetaData = Awaited<ReturnType<typeof getGDriveFolderMetaDataFromCopyJob>>

const SORT: Record<keyof Pick<ICopyUnitResult, "datetime">, 1 | -1> = {
  datetime: -1,
};

export const getLatestValidCopyUnitJob = async (
  unitId: string,
  gdriveAccessToken: string,
  refreshToken: string,
  origin: string,
  invalidJobIds?: string[],
  failedRetrievedCopyUnitJobIdsDueToTimeout?: string[]
) => {
  try {
    let query: Partial<Record<keyof ICopyUnitResult, unknown>> = {
      unitId,
      result: "success",
      doesCopyExistInUserGDrive: true,
      gdriveFolderId: {
        $ne: null,
      },
      errMsg: {
        $eq: null,
      },
    };
    const nonQueryableFolderCopyJobIds: string[] = [];

    if(invalidJobIds?.length){
        nonQueryableFolderCopyJobIds.concat(invalidJobIds)
        query = {
            ...query,
            _id: {
                $nin: invalidJobIds
            }
        }
    }
    if(failedRetrievedCopyUnitJobIdsDueToTimeout?.length){
        nonQueryableFolderCopyJobIds.concat(failedRetrievedCopyUnitJobIdsDueToTimeout)
        query = {
            ...query,
            _id: {
                $nin: failedRetrievedCopyUnitJobIdsDueToTimeout
            }
        }
    }

    const copyUnitJobResults = await CopyUnitResults.find<ICopyUnitResult>(
      query
    ).sort(SORT);
    const copyUnitJobResultsWithFolderMetaData = await Promise.all(
      copyUnitJobResults.map(async (copyUnitJobResult) => {
        return await getGDriveFolderMetaDataFromCopyJob(
          copyUnitJobResult,
          gdriveAccessToken
        );
      })
    );
    const didTokenExpire = copyUnitJobResultsWithFolderMetaData.find(copyUnitJobResult => {
        return copyUnitJobResult.errType === "unauthenticated"
    });
    let notFoundFolderJobIds = copyUnitJobResultsWithFolderMetaData.filter(copyUnitJobResult => {
        copyUnitJobResult.errType === "notFound"
    }).map(notFoundFolder => {
        return notFoundFolder.copyJob._id
    })
    const retrievedCopyUnitJobs: TGetGDriveFolderMetaData[] = [];

    for (const copyUnitJobResultWithFolderMetaData of copyUnitJobResultsWithFolderMetaData){
        if(copyUnitJobResultWithFolderMetaData.gdriveFolderMetaData){
            retrievedCopyUnitJobs.push(copyUnitJobResultWithFolderMetaData)
        }
    }

    if(didTokenExpire){
        const { accessToken: newAccessToken } = await refreshAuthToken(refreshToken, origin);

        if(!newAccessToken){
            return { wasSuccessful: false, errType: "refreshTokenFailure" };
        }

        gdriveAccessToken = newAccessToken;
    }

    const latestValidCopyUnitJob = copyUnitJobResultsWithFolderMetaData?.length
      ? copyUnitJobResultsWithFolderMetaData.find((copyFolderJobResult) => {
          return !!copyFolderJobResult.gdriveFolderMetaData;
        })
      : undefined;
    notFoundFolderJobIds = notFoundFolderJobIds.length ? Array.from(new Set([...notFoundFolderJobIds, ...invalidJobIds])) : Array.from(new Set(invalidJobIds))

    return {
      wasSuccessful: true,
      latestValidCopyUnitJob,
      notFoundFolderJobIds,
      gdriveAccessToken
    };
  } catch (error) {
    console.error("Failed to insert copy unit job result. Error: ", error);

    return { wasSuccessful: false, errorObj: error, errType: "generalErr" };
  }
};
