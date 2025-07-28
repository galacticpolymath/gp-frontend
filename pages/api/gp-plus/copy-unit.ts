/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */

import { google, drive_v3 } from "googleapis";
import { CustomError } from "../../../backend/utils/errors";
import axios from "axios";
import {
  copyFiles,
  deleteGoogleDriveItem,
  FileMetaData,
  getGoogleDriveFolders,
  GoogleServiceAccountAuthCreds,
  refreshAuthToken,
  shareFilesWithRetries,
} from "../../../backend/services/googleDriveServices";
import { NextApiRequest, NextApiResponse } from "next";
import { getJwtPayloadPromise } from "../../../nondependencyFns";
import { waitWithExponentialBackOff } from "../../../globalFns";
import {
  getUserById,
  updateUser,
} from "../../../backend/services/userServices";
import { connectToMongodb } from "../../../backend/utils/connection";
import { OAuth2Client } from "google-auth-library";

export const maxDuration = 300;
const USER_GP_PLUS_PARENT_FOLDER_NAME = "My GP+ Units";

const getGDriveItem = async (
  fileId: string,
  accessToken: string,
  tries = 3
) => {
  try {
    return await axios.get<{ id: string; [key: string]: unknown }>(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params: {
          supportsAllDrives: true,
        },
      }
    );
  } catch (error: any) {
    if (error?.response?.data?.error?.code === 404) {
      return {
        errType: "notFound",
      };
    }

    if (error?.code === "ECONNABORTED" && tries > 0) {
      await waitWithExponentialBackOff(tries, [2_000, 5_000]);

      return await getGDriveItem(fileId, accessToken, tries - 1);
    }

    return {
      errType: "generalErr",
    };
  }
};

const createGoogleDriveFolderForUser = async (
  folderName: string,
  accessToken: string,
  parentFolderIds: string[] = [],
  tries: number,
  refreshToken: string,
  reqOriginForRefreshingToken: string
) => {
  try {
    const folderMetadata = new FileMetaData(folderName, parentFolderIds);
    const response = await axios.post(
      "https://www.googleapis.com/drive/v3/files?fields=id",
      folderMetadata,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      throw new CustomError(
        response.data ?? "Failed to create a lesson folder.",
        response.status
      );
    }

    return { wasSuccessful: true, folderId: response.data.id };
  } catch (error: any) {
    console.error("Error object: ", error?.response?.data?.error);
    const errMsg = `Failed to create folder for the user. Reason: ${error?.response?.data?.error?.message}`;
    console.log("errMsg: ", errMsg);
    console.log("refreshToken: ", refreshToken);

    if (error?.response?.data?.error?.status === "UNAUTHENTICATED") {
      console.log("Will refresh the auth token...");

      tries -= 1;

      console.log("the user is not authenticated: ", refreshToken);

      const { data } =
        (await refreshAuthToken(refreshToken, reqOriginForRefreshingToken)) ??
        {};

      console.log("Refresh token response data: ", data);

      if (!data?.access_token) {
        throw new Error("Failed to refresh access token");
      }

      return await createGoogleDriveFolderForUser(
        folderName,
        data?.access_token,
        parentFolderIds,
        tries,
        refreshToken,
        origin
      );
    }

    return {
      wasSuccessful: false,
      errMsg: errMsg,
      status: error?.response?.data?.error?.status,
    };
  }
};

export type TCopyFilesMsg = Partial<{
  msg: string;
  msgs: string[];
  isJobDone: boolean;
  didJobStart: boolean;
  wasSuccessful: boolean;
  showSupportTxt: boolean;
  foldersToCopy: number;
  folderCreated: string;
  fileCopied: string;
  folderCopyId: string;
  filesToCopy: number;
  didRetrieveAllItems: boolean;
  refreshToken: string;
  errStatus: string;
}>;

export interface IGdriveItem {
  id: string;
  name: string;
  pathToFile: string;
  mimeType: string;
  parentFolderId?: string;
  wasCreated?: boolean;
  alternativeName?: string;
}

type TUnitFolder = {
  name: string;
  id: string;
  mimeType: string;
  pathToFile: string;
  parentFolderId?: string;
};
export type TCopyUnitJobResult = "success" | "failure" | "ongoing" | "canceled";

const sendMessage = <TMsg extends object = TCopyFilesMsg>(
  response: NextApiResponse,
  data: TMsg,
  willEndStream?: boolean,
  delayMs?: number
) => {
  const _data = JSON.stringify(data);

  if (willEndStream && delayMs) {
    setTimeout(() => {
      response.end(`data: ${_data}\n\n`);
    }, delayMs);
    return;
  }

  if (willEndStream) {
    response.end(`data: ${_data}\n\n`);
    return;
  }

  if (delayMs) {
    setTimeout(() => {
      response.write(`data: ${_data}\n\n`);
    }, delayMs);
    return;
  }

  response.write(`data: ${_data}\n\n`);
};

/**
 * @swagger
 * /api/copy-files:
 *   post:
 *     summary: Copy user files to a specified folder.
 *
 *     description: The user must authenticate with their Google account to copy files.
 *
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unitDriveId:
 *                 type: string
 *                 description: The id of the drive to copy the files to.
 *               unitName:
 *                 type: string
 *                 description: The name of the unit to copy the files to.
 *     responses:
 *       200:
 *         description: The result of the copy operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wasSuccessful:
 *                   type: boolean
 *                   description: Whether the copy operation was successful.
 *                 errMsg:
 *                   type: string
 *                   description: The error message if the copy operation was not successful.
 *     externalDocs:
 *       url: https://accounts.google.com/o/oauth2/auth?client_id=1095510414161-7v7mlrakupjs18n2ml9brjoqs0rjkg4v.apps.googleusercontent.com&redirect_uri=http://localhost:3000/google-drive-auth-result&scope=https://www.googleapis.com/auth/drive&response_type=code
 *       redirect_uri: Possible values: http://localhost:3000/google-drive-auth-result, https://teach.galacticpolymath.com/google-drive-auth-result, https://dev.galacticpolymath.com/google-drive-auth-result
 *       description: The google authentication url. CHANGE the `client_id` to the official Galactic Polymath client id.
 */
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  let copyDestinationFolderId = "";
  let gdriveAccessToken = "";

  try {
    const origin = new URL(request.headers.referer ?? "").origin;

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "kee-alive");
    response.setHeader("Content-Encoding", "none");

    let isStreamOpen = true;

    response.on("close", () => {
      console.log("The user closed the stream.");
      isStreamOpen = false;
    });

    if (!origin) {
      sendMessage(response, {
        msg: "Origin is not present",
        isJobDone: true,
        wasSuccessful: false,
      });
      return;
    }

    // all keys of the headers will lowercase by default
    const _gdriveAccessToken = request.headers["gdrive-token"];
    const gdriveRefreshToken = request.headers["gdrive-token-refresh"];
    const userId = request.headers["user-id"];
    const jwtPayload = await getJwtPayloadPromise(
      request.headers.authorization
    );

    if (!userId || Array.isArray(userId)) {
      sendMessage(response, {
        msg: "The 'userId' header is not present.",
        isJobDone: true,
        wasSuccessful: false,
      });
      return;
    }

    if (!jwtPayload || !jwtPayload?.payload?.email) {
      sendMessage(response, {
        msg: "The access token is not valid.",
        isJobDone: true,
        wasSuccessful: false,
      });
      return;
    }

    if (
      !_gdriveAccessToken ||
      Array.isArray(_gdriveAccessToken) ||
      _gdriveAccessToken === "undefined"
    ) {
      console.error(
        "The gdrive access token was not provided. Please provide the `gdrive-token` header."
      );

      sendMessage(response, {
        msg: "The gdrive access token was not provided.",
        isJobDone: true,
        wasSuccessful: false,
      });
      return;
    }

    console.log("yo there refresh token: ", gdriveRefreshToken);
    console.log("yo there refresh token, typeof: ", typeof gdriveRefreshToken);

    if (
      !gdriveRefreshToken ||
      Array.isArray(gdriveRefreshToken) ||
      gdriveRefreshToken === "undefined"
    ) {
      console.error(
        "The gdrive refresh token was not provided. Please provide the `gdrive-token-refresh` header."
      );

      sendMessage(response, {
        msg: "The gdrive refresh token was not provided.",
        isJobDone: true,
        wasSuccessful: false,
      });
      return;
    }

    const email = jwtPayload.payload.email;
    gdriveAccessToken = _gdriveAccessToken;

    if (
      !request.query.unitDriveId ||
      Array.isArray(request.query.unitDriveId)
    ) {
      sendMessage(response, {
        msg: "The id of the drive was not provided.",
        isJobDone: true,
        wasSuccessful: false,
      });
      return;
    }

    if (!request.query.unitName) {
      sendMessage(response, {
        msg: "The name of the unit was not provided.",
        isJobDone: true,
        wasSuccessful: false,
      });
      return;
    }

    sendMessage(response, { msg: "Copying unit..." });

    const drive = google.drive("v3");
    const creds = new GoogleServiceAccountAuthCreds();
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: creds.client_email,
        client_id: creds.client_id,
        private_key: creds?.private_key
          ?.replace(/\\n/g, "\n")
          .replace(/"/g, ""),
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const authClient = (await auth.getClient()) as OAuth2Client;

    google.options({ auth: authClient });

    console.log("Will retrieve files...");

    const gdriveResponse = await drive.files.list({
      corpora: "drive",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      driveId: process.env.GOOGLE_DRIVE_ID,
      q: `'${request.query.unitDriveId}' in parents`,
    });
    console.log("gdriveResponse.data?.files: ", gdriveResponse.data?.files);

    const rootDriveFolders = gdriveResponse.data?.files;

    console.log("rootDriveFolders: ", rootDriveFolders?.length);

    if (!rootDriveFolders?.length) {
      console.error("The root of the drive folder is empty.");
      sendMessage(response, {
        msg: "An error has occurred on the server.",
        isJobDone: true,
        wasSuccessful: false,
        showSupportTxt: true,
      });
      return;
    }

    let unitFolders: TUnitFolder[] = rootDriveFolders.map((folder) => ({
      name: folder.name,
      id: folder.id,
      mimeType: folder.mimeType,
      pathToFile: "",
    }));

    // get all of the folders of the target unit folder
    for (const unitFolder of unitFolders) {
      const parentFolderAlternativeName =
        "alternativeName" in unitFolder ? unitFolder.alternativeName : "";

      if (
        unitFolder.mimeType.includes("folder") &&
        unitFolder.pathToFile &&
        unitFolder.pathToFile !== ""
      ) {
        const { data } = await drive.files.list({
          corpora: "drive",
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
          driveId: process.env.GOOGLE_DRIVE_ID,
          q: `'${unitFolder.id}' in parents`,
        });

        if (!data.files) {
          continue;
        }

        const folders = data?.files.filter((file) =>
          file?.mimeType?.includes("folder")
        );
        const filesToCopy = data?.files.length - folders.length;

        let foldersOccurrenceObj:
          | (drive_v3.Schema$File & { [key: string]: any })
          | null = null;

        if (folders.length) {
          foldersOccurrenceObj = folders.reduce(
            (allFoldersObj, folderA, _, self) => {
              const foldersWithTheSameName = self.filter(
                (folderB) => folderA.name === folderB.name
              );

              if (!folderA.name) {
                return allFoldersObj;
              }

              const _allFoldersObj = {
                ...allFoldersObj,
                [folderA.name]: foldersWithTheSameName,
              };

              return _allFoldersObj;
            },
            {} as drive_v3.Schema$File & { [key: string]: string }
          );
        }

        const childFolderAndFilesOfFolder = data.files.map((file) => {
          if (
            !file?.mimeType?.includes("folder") ||
            !foldersOccurrenceObj ||
            (file.name &&
              (!foldersOccurrenceObj?.[file.name] ||
                foldersOccurrenceObj?.[file.name]?.length === 1))
          ) {
            console.log("The file retrieved from the server: ", file);

            return {
              ...file,
              name: file.name,
              id: file.id,
              // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive
              mimeType: file.mimeType,
              parentFolderId: unitFolder.id,
              pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`,
              parentFolderAlternativeName,
            };
          }

          if (!file.name) {
            return null;
          }

          const targetFolderOccurrences = foldersOccurrenceObj[file.name];
          const targetFolder = targetFolderOccurrences.find(
            (folder: { id: string }) => folder.id === file.id
          );

          return {
            ...file,
            name: file.name,
            id: file.id,
            mimeType: file.mimeType,
            folderAlternativeName: targetFolder.alternativeName,
            parentFolderId: unitFolder.id,
            pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`,
            parentFolderAlternativeName,
          };
        });

        const _childFolderAndFilesOfFolder = childFolderAndFilesOfFolder.filter(
          Boolean
        ) as typeof unitFolders;

        unitFolders.push(..._childFolderAndFilesOfFolder);
        continue;
      }

      if (unitFolder.mimeType.includes("folder")) {
        const folderDataResponse = await drive.files.list({
          corpora: "drive",
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
          driveId: process.env.GOOGLE_DRIVE_ID,
          q: `'${unitFolder.id}' in parents`,
        });

        const folders = folderDataResponse.data.files.filter((file) =>
          file.mimeType.includes("folder")
        );
        /** @type {{ [key: string]: any[] } | null} */
        let foldersOccurrenceObj = null;

        if (folders.length) {
          foldersOccurrenceObj = folders.reduce(
            (allFoldersObj, folderA, _, self) => {
              const foldersWithTheSameName = self.filter(
                (folderB) => folderA.name === folderB.name
              );
              allFoldersObj[folderA.name] = foldersWithTheSameName;

              return allFoldersObj;
            },
            {}
          );

          // if a folder has duplicate names, give it a alternative name in order to differentiate it from the rest of the folders
          for (const folderNameAndOccurrences of Object.entries(
            foldersOccurrenceObj
          )) {
            let [folderName, occurrences] = folderNameAndOccurrences;

            if (occurrences.length === 1) {
              continue;
            }

            foldersOccurrenceObj[folderName] = occurrences.map(
              (folderOccurrence, index) => ({
                ...folderOccurrence,
                alternativeName: `${folderOccurrence.name} ${index + 1}`,
              })
            );
          }
        }

        const folderData = folderDataResponse.data.files.map((file) => {
          const targetFolderOccurrences = foldersOccurrenceObj?.[file.name];
          const targetFolder = targetFolderOccurrences
            ? targetFolderOccurrences.find((folder) => folder.id === file.id)
            : null;

          if (targetFolder) {
            return {
              ...file,
              name: file.name,
              id: file.id,
              folderAlternativeName: targetFolder.name,
              mimeType: file.mimeType,
              pathToFile: unitFolder.name,
              parentFolderId: unitFolder.id,
              parentFolderAlternativeName,
            };
          }

          return {
            ...file,
            name: file.name,
            id: file.id,
            mimeType: file.mimeType,
            parentFolderId: unitFolder.id,
            pathToFile: unitFolder.name,
            parentFolderAlternativeName,
          };
        });
        unitFolders.push(...folderData);
        continue;
      }

      const isFilePresent = unitFolders.some(
        (folder) => folder.name === unitFolder.name
      );

      if (!isFilePresent) {
        const file = {
          ...unitFolder,
          name: unitFolder.name,
          id: unitFolder.id,
          // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive
          mimeType: unitFolder.mimeType,
          parentFolderId: unitFolder.id,
          pathToFile: unitFolder.pathToFile
            ? `${unitFolder.pathToFile}/${unitFolder.name}`
            : unitFolder.name,
          parentFolderAlternativeName,
        };

        unitFolders.push(file);
      }
    }

    const totalFoldersToCreate = unitFolders.filter((unit) => {
      return unit.mimeType.includes("folder");
    }).length;
    const totalFilesToCopy = unitFolders.filter((unit) => {
      return !unit.mimeType.includes("folder");
    }).length;

    sendMessage(response, { foldersToCopy: totalFoldersToCreate + 1 });

    await connectToMongodb(15_000, 0, true);

    const targetUser = await getUserById(userId, {
      unitCopiesFolderId: 1,
      _id: 1,
    });

    if (!targetUser) {
      sendMessage(
        response,
        {
          isJobDone: true,
          msg: "The target user doesn't exist.",
          wasSuccessful: false,
        },
        true
      );
      return;
    }

    let wasCopyUnitsFolderCreated = false;

    if (!targetUser.unitCopiesFolderId) {
      console.log(
        "The 'unitCopiesFolderId' was not set. Will create the folder."
      );

      const folderCreationResult = await createGoogleDriveFolderForUser(
        USER_GP_PLUS_PARENT_FOLDER_NAME,
        gdriveAccessToken as string,
        undefined,
        3,
        gdriveRefreshToken as string,
        origin
      );

      console.log("folderCreationResult: ", folderCreationResult);

      const { folderId: userGpPlusParentFolderId, errMsg } =
        folderCreationResult;

      if (errMsg) {
        console.error(
          "Failed to create the parent folder for the unit copies. Reason: ",
          errMsg
        );

        sendMessage(
          response,
          {
            isJobDone: true,
            msg: "Failed to create the parent folder for the unit copies.",
            wasSuccessful: false,
          },
          true
        );
        return;
      }

      wasCopyUnitsFolderCreated = true;
      targetUser.unitCopiesFolderId = userGpPlusParentFolderId;

      const updatedUserResult = await updateUser(
        { _id: userId },
        { unitCopiesFolderId: userGpPlusParentFolderId },
        []
      );

      if (!updatedUserResult.wasSuccessful || updatedUserResult.errMsg) {
        console.error(
          "Failed to update the parent folder for the unit copies. Reason: ",
          updatedUserResult.errMsg
        );
      } else {
        console.log("The parent folder for the unit copies was created.");
      }
    }

    // check if the folder with 'targetUser.unitCopiesFolderId' exist

    if (!wasCopyUnitsFolderCreated) {
      console.log(
        "'My GP units' folder creation logic was not executed. Will check if the folder was created already."
      );
      const gdriveItemRetrievedRes = await getGDriveItem(
        targetUser.unitCopiesFolderId,
        gdriveAccessToken as string
      );

      console.log(
        "gdriveItemRetrievedRes, sup there: ",
        gdriveItemRetrievedRes
      );

      if (
        "errType" in gdriveItemRetrievedRes &&
        gdriveItemRetrievedRes.errType === "notFound"
      ) {
        const folderCreationResult = await createGoogleDriveFolderForUser(
          USER_GP_PLUS_PARENT_FOLDER_NAME,
          gdriveAccessToken as string,
          undefined,
          3,
          gdriveRefreshToken as string,
          origin
        );

        console.log(
          "folder id was set, but the folder was not found. Attempted to create the folder. Result: ",
          folderCreationResult
        );

        const { folderId: userGpPlusParentFolderId, errMsg } =
          folderCreationResult;

        if (errMsg) {
          console.error(
            "Failed to create the parent folder for the unit copies. Reason: ",
            errMsg
          );

          sendMessage(
            response,
            {
              isJobDone: true,
              msg: "Failed to create the parent folder for the unit copies.",
              wasSuccessful: false,
            },
            true
          );
          return;
        }

        targetUser.unitCopiesFolderId = userGpPlusParentFolderId;

        console.log("The 'My GP Plus' folder was created.");

        const updatedUserResult = await updateUser(
          { _id: userId as string },
          { unitCopiesFolderId: userGpPlusParentFolderId },
          []
        );

        if (!updatedUserResult.wasSuccessful || updatedUserResult.errMsg) {
          console.error(
            "Failed to update the parent folder for the unit copies. Reason: ",
            updatedUserResult.errMsg
          );
        }
      } else if ("errType" in response) {
        sendMessage(
          response,
          {
            isJobDone: true,
            msg: "Failed to check if the 'My GP+ units' folder exist.",
            wasSuccessful: false,
          },
          true
        );
        return;
      } else {
        console.log(
        "The 'My GP Plus' folder exist. Will proceed with unit copy implementation."
      );
      }
    }

    const { folderId: unitFolderId, errMsg } =
      await createGoogleDriveFolderForUser(
        request.query.unitName as string,
        gdriveAccessToken as string,
        [targetUser.unitCopiesFolderId],
        3,
        gdriveRefreshToken as string,
        origin
      );

    sendMessage(response, { filesToCopy: totalFilesToCopy });

    if (errMsg) {
      console.error("Failed to create the target folder. Error message: ");
      console.error(errMsg);

      throw new CustomError(errMsg, 500);
    }

    copyDestinationFolderId = unitFolderId;

    sendMessage(response, {
      didRetrieveAllItems: true,
      folderCreated: request.query.unitName,
      folderCopyId: unitFolderId,
    });

    console.log("The target folder was created.");

    let foldersFailedToCreate = [];
    /** @type {{ id: string, name: string, pathToFile: string, parentFolderId: string, gpFolderId: string }[]} */
    let createdFolders = [];
    /** @type {{ fileId: string, pathToFile: string, parentFolderId: string, name: string }[]} */
    // get only the chlid folders of the target unit folder
    const folderPaths = unitFolders
      .filter((folder) => folder.mimeType.includes("folder"))
      .map((folder) => {
        return {
          name: folder.name,
          mimeType: folder.mimeType,
          fileId: folder.id,
          pathToFile: folder.pathToFile,
          parentFolderId: folder.parentFolderId,
        };
      });

    // create the google sub folders
    for (const folderToCreate of folderPaths) {
      // if the folder is at the root of the parent folder
      if (folderToCreate.pathToFile === "") {
        const { folderId, wasSuccessful } =
          await createGoogleDriveFolderForUser(
            folderToCreate.name,
            gdriveAccessToken,
            [unitFolderId],
            3,
            gdriveRefreshToken as string,
            origin
          );

        if (!wasSuccessful) {
          foldersFailedToCreate.push(folderToCreate.name);
        } else {
          sendMessage(response, { folderCreated: folderToCreate.name });

          createdFolders.push({
            id: folderId,
            gpFolderId: folderToCreate.fileId,
            name: folderToCreate.name,
            pathToFile: "",
            parentFolderId: folderToCreate.parentFolderId,
          });
        }

        continue;
      }

      // the id of the parent folder that was just created in the previous iteration
      const parentFolderId = createdFolders.find(
        (folder) => folder.gpFolderId === folderToCreate.parentFolderId
      )?.id;

      if (!parentFolderId) {
        foldersFailedToCreate.push(folderToCreate.name);
        continue;
      }

      const { folderId, wasSuccessful } = await createGoogleDriveFolderForUser(
        folderToCreate.name,
        gdriveAccessToken,
        [parentFolderId],
        3,
        gdriveRefreshToken as string,
        origin
      );

      if (!wasSuccessful) {
        foldersFailedToCreate.push(folderToCreate.name);
        continue;
      }

      createdFolders.push({
        id: folderId,
        gpFolderId: folderToCreate.fileId,
        name: folderToCreate.name,
        pathToFile: folderToCreate.pathToFile,
        parentFolderId: folderToCreate.parentFolderId,
      });

      sendMessage(response, { folderCreated: folderToCreate.name });
    }

    const files = unitFolders.filter(
      (folder) => !folder.mimeType.includes("folder")
    );
    console.log("Will share target files...");
    const { wasSuccessful: wasSharesSuccessful } = await shareFilesWithRetries(
      files,
      email,
      drive,
      4
    );

    console.log("Was files share successful: ", wasSharesSuccessful);

    if (!wasSharesSuccessful) {
      console.error("Failed to share at least one file.");
      sendMessage(
        response,
        {
          isJobDone: true,
          msg: "Failed to share files.",
          wasSuccessful: false,
        },
        true
      );
      return;
    }

    console.log("Will copy files...");

    const { wasSuccessful: wasCopiesSuccessful } = await copyFiles(
      files,
      createdFolders,
      gdriveAccessToken,
      4,
      (data: TCopyFilesMsg) => {
        sendMessage(response, data);
      }
    );

    if (!isStreamOpen) {
      const result = await deleteGoogleDriveItem(
        unitFolderId,
        gdriveAccessToken
      );
      console.log(
        "A failure has occurred. Delete google  drive item result: ",
        result
      );
      response.end();
      return;
    }

    console.log("Attempted to copy files. Result: ", wasCopiesSuccessful);

    if (!wasCopiesSuccessful) {
      console.error("Failed to copy at least one file.");
      sendMessage(
        response,
        { isJobDone: true, msg: "Failed to copy files.", wasSuccessful: false },
        true
      );
      response.end();

      const result = await deleteGoogleDriveItem(
        unitFolderId,
        gdriveAccessToken
      );

      console.log(
        "A failure has occurred. Delete google  drive item result: ",
        result
      );
      return;
    }

    // todo: GOAL: rename the files here
    sendMessage(
      response,
      {
        msg: "Renaming files.",
      }
    );




    sendMessage(
      response,
      {
        isJobDone: true,
        msg: "Successful copied files and created folders.",
        wasSuccessful: true,
      },
      true
    );

    response.end();
  } catch (error) {
    console.error("An error has occurred. Error: ", error);
    sendMessage(
      response,
      { isJobDone: true, msg: "Failed to copy files.", wasSuccessful: false },
      true
    );

    if (copyDestinationFolderId) {
      const result = await deleteGoogleDriveItem(
        copyDestinationFolderId,
        gdriveAccessToken
      );

      console.log("Google drive item deletion result: ", result);
    }
  }
}
