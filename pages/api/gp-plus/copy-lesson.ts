import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import {
  copyFile,
  FileMetaData,
  refreshAuthToken,
} from "../../../backend/services/googleDriveServices";
import { getGDriveItem } from "./copy-unit";
import { getJwtPayloadPromise } from "../../../nondependencyFns";
import {
  addNewGDriveLessons,
  addNewGDriveUnits,
  createDbArrFilter,
  getUserByEmail,
  updateUser,
  updateUserCustom,
} from "../../../backend/services/userServices";
import { CustomError } from "../../../backend/utils/errors";
import axios from "axios";
import {
  createDrive,
  createFolderStructure,
  getFolderChildItems,
  getGoogleDriveItem,
  getTargetUserPermission,
} from "../../../backend/services/gdriveServices";
import { waitWithExponentialBackOff } from "../../../globalFns";

export const maxDuration = 240;

export type TCopyLessonReqBody = Partial<{
  fileIds: string[];
  lesson: {
    id: string;
    lessonSharedDriveId: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
  };
}>;

const createGoogleDriveFolderForUser = async (
  folderName: string,
  accessToken: string,
  parentFolderIds: string[] = [],
  tries: number = 3,
  refreshToken?: string,
  reqOriginForRefreshingToken?: string
): Promise<{
  wasSuccessful: boolean;
  folderId?: string;
  [key: string]: unknown;
}> => {
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

      const refreshTokenRes =
        (await refreshAuthToken(refreshToken, reqOriginForRefreshingToken)) ??
        {};
      const { accessToken } = refreshTokenRes;

      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }

      return await createGoogleDriveFolderForUser(
        folderName,
        accessToken,
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

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const gDriveAccessToken = (
    Array.isArray(request.headers?.["gdrive-token"])
      ? request.headers["gdrive-token"][0]
      : request.headers["gdrive-token"]
  ) as string | undefined;
  const gDriveRefreshToken = (
    Array.isArray(request.headers?.["gdrive-token-refresh"])
      ? request.headers["gdrive-token-refresh"][0]
      : request.headers["gdrive-token-refresh"]
  ) as string | undefined;
  const reqBody = request.body as TCopyLessonReqBody;
  let parentFolder: { id: string; permissionId: string } | null = null;

  try {
    if (!gDriveAccessToken) {
      response.status(401).json({
        message:
          "Unauthorized. Have client log in again into their google drive.",
      });
      return;
    }

    if (!gDriveRefreshToken) {
      throw new CustomError(
        "Unauthorized. The refresh token is not present in the headers.",
        401
      );
    }

    if (
      !reqBody?.unit?.id ||
      !reqBody?.unit?.name ||
      !reqBody?.fileIds?.length ||
      !reqBody?.lesson?.id ||
      !reqBody?.lesson?.name
    ) {
      throw new CustomError(
        "Request body is invalid. Check the body of the request.",
        400
      );
    }

    const jwtPayload = await getJwtPayloadPromise(
      request.headers.authorization
    );

    if (!jwtPayload) {
      throw new CustomError("Unauthorized. Please try logging in again.", 401);
    }

    const { email } = jwtPayload.payload;
    const user = await getUserByEmail(jwtPayload.payload.email, {
      unitGDriveLessons: 1,
      gpPlusDriveFolderId: 1,
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    let doesGpPlusFolderExist = !!user.gpPlusDriveFolderId;

    if (user.gpPlusDriveFolderId) {
      const targetGDriveFolder = await getGoogleDriveItem(
        user.gpPlusDriveFolderId,
        gDriveAccessToken
      );
      doesGpPlusFolderExist =
        "id" in targetGDriveFolder && !!targetGDriveFolder.id;

      if (!doesGpPlusFolderExist) {
        const updatedUserResult = await updateUser(
          { email },
          {
            gpPlusDriveFolderId: undefined,
            unitGDriveLessons: undefined,
          }
        );

        console.log({ updatedUserResult });
      }
    }

    if(doesGpPlusFolderExist){
      // TODO: the GP+ folder exist, check if the target unit exist
    }

    // TODO: if the unit folder doesn't exist, then delete the target unit from the user's unitGDriveLessons by its drive id

    // TODO: if the unit lesson doesn't exist, then get the child items for the target unit using the service account, in order to get the name of the lesson
    // -find it by using the lessonSharedDriveId from the client to get the target lesson

    // TODO: if the target lesson folder is there, then copy all items into the lesson folder

    // will create the gp plus folder and the target unit
    if (!doesGpPlusFolderExist) {
      const origin = new URL(request.headers.referer ?? "").origin;
      console.log("will create the gp plus unit folder");
      console.log("gDriveAccessToken: ", gDriveAccessToken);
      const gpPlusFolderCreationResult = await createGoogleDriveFolderForUser(
        "My GP+ Units",
        gDriveAccessToken,
        [],
        3,
        gDriveRefreshToken,
        origin
      );

      if (!gpPlusFolderCreationResult.folderId) {
        throw new CustomError(
          "Error creating the My GP+ Units folder. Reason: " +
            gpPlusFolderCreationResult.errMsg,
          500
        );
      }

      const userUpdatedResult = await updateUser(
        { email },
        { gpPlusDriveFolderId: gpPlusFolderCreationResult.folderId }
      );

      if (!userUpdatedResult.wasSuccessful) {
        console.error(
          "Failed to update user. Error message: ",
          userUpdatedResult.errMsg
        );
      } else {
        console.log("'gpPlusDriveFolderId' was updated for target user.");
      }

      const targetUnitFolderCreation = await createGoogleDriveFolderForUser(
        reqBody.unit.name,
        gDriveAccessToken,
        [gpPlusFolderCreationResult.folderId],
        3,
        gDriveRefreshToken,
        origin
      );

      console.log("targetUnitFolderCreation: ", targetUnitFolderCreation);

      if (!targetUnitFolderCreation.folderId) {
        throw new CustomError(
          `Error creating the folder for unit ${reqBody.unit.name}. Reason: ${targetUnitFolderCreation.errMsg}`,
          500
        );
      }

      // find the unit within the unitGDriveLessons by the unitDriveId, and push the new lesson into lessonDriveIds

      const userUpdatedWithNewUnitObjResult = await updateUserCustom(
        { email },
        addNewGDriveUnits([
          {
            unitDriveId: targetUnitFolderCreation.folderId,
            unitId: reqBody.unit.id,
          },
        ])
      );

      if (!userUpdatedWithNewUnitObjResult.wasSuccessful) {
        console.error(
          "Failed to update user with new unit lessons object. Error message: ",
          userUpdatedWithNewUnitObjResult.errMsg
        );
      } else {
        console.log(
          "User was updated with new unit lessons object. New unit lessons object: "
        );
      }

      console.log("Will get the target folder structure.");

      console.log(`reqBody.unit.id: ${reqBody.unit?.id}`);

      const drive = await createDrive();
      const gdriveResponse = await drive.files.list({
        corpora: "drive",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        driveId: process.env.GOOGLE_DRIVE_ID,
        q: `'${reqBody.unit?.id}' in parents`,
        fields: "*",
      });

      if (!gdriveResponse.data?.files) {
        throw new CustomError(
          "Failed to get the root items of the target unit folder.",
          500
        );
      }

      const allChildFiles = await getFolderChildItems(
        gdriveResponse.data.files
      );

      console.log("allChildFiles: ", allChildFiles);

      const selectedClientLessonName = reqBody.lesson.name.toLowerCase();
      const targetFolderStructureArr = await createFolderStructure(
        allChildFiles,
        gDriveAccessToken,
        targetUnitFolderCreation.folderId,
        gDriveRefreshToken,
        origin
      );
      const targetLessonFolder = targetFolderStructureArr.find((folder) => {
        const lessonName = folder.name?.split("_").at(-1);

        return (
          lessonName && lessonName.toLowerCase() === selectedClientLessonName
        );
      });

      console.log("targetLessonFolder: ", targetLessonFolder);

      if (!targetLessonFolder?.id) {
        throw new CustomError(
          `The lesson named ${selectedClientLessonName} does not exist in the unit ${reqBody.unit.name}.`,
          400
        );
      }

      const lessonDriveIdUpdatedResult = await updateUserCustom(
        { email },
        addNewGDriveLessons([
          {
            lessonDriveId: targetLessonFolder.id,
            lessonNum: reqBody.lesson.id,
          },
        ]),
        {
          arrayFilters: [
            createDbArrFilter(
              "elem.unitDriveId",
              targetUnitFolderCreation.folderId
            ),
          ],
        }
      );

      if (!lessonDriveIdUpdatedResult.wasSuccessful) {
        console.log(
          "Failed to update the target user with the new lesson drive id. Reason: ",
          lessonDriveIdUpdatedResult.errMsg
        );
      } else {
        console.log(
          "Successfully updated the target user with the new lesson drive id."
        );
      }

      console.log("targetFolderStructureArr: ", targetFolderStructureArr);

      // get the parent folder id of the files to copy
      const parentFolderId = (
        await drive.files.get({
          fileId: reqBody.fileIds[0],
          fields: "*",
          supportsAllDrives: true,
        })
      ).data?.parents?.[0];

      console.log("parentFolderId: ", parentFolderId);

      if (!parentFolderId) {
        throw new CustomError("The file does not have a parent folder.", 500);
      }

      const targetPermission = await getTargetUserPermission(
        parentFolderId,
        jwtPayload.payload.email,
        drive
      );

      console.log("targetPermission: ", targetPermission);

      if (!targetPermission?.id) {
        throw new CustomError(
          "The target permission for the gp plus user was not found.",
          500
        );
      }

      console.log("Will update the permission of the target file.");

      // change the target user's permission to writer
      const filePermissionsUpdated = await drive.permissions.update({
        permissionId: targetPermission.id,
        fileId: parentFolderId,
        supportsAllDrives: true,
        requestBody: {
          role: "fileOrganizer",
        },
      });
      parentFolder = { id: parentFolderId, permissionId: targetPermission.id };

      console.log("filePermissionsUpdated: ", filePermissionsUpdated);

      // make the target files read only
      for (const fileId of reqBody.fileIds) {
        // @ts-ignore
        const fileUpdated = await drive.files.update({
          fileId: fileId,
          supportsAllDrives: true,
          requestBody: {
            contentRestrictions: {
              readOnly: true,
              reason: "Making a copy for GP plus user.",
            },
          },
        });

        console.log("fileUpdated: ", fileUpdated);
      }

      // check if the permission were propagated to all of the files to copy
      for (const fileId of reqBody.fileIds) {
        const permission = await getTargetUserPermission(
          fileId,
          jwtPayload.payload.email,
          drive
        );

        console.log("permission: ", permission);

        let userUpdatedRole = permission?.role;
        let tries = 7;

        console.log(
          "Made the target file read only and changed the target user's permission to writer."
        );

        while (userUpdatedRole !== "fileOrganizer") {
          console.log(`tries: ${tries}`);
          console.log(`userUpdatedRole: ${userUpdatedRole}`);

          if (tries <= 0) {
            console.error(
              "Reached max tries. Failed to update the target user's permission."
            );

            throw new CustomError(
              "Failed to update the target user's permission after reaching max tries.",
              500
            );
          }

          await waitWithExponentialBackOff(tries);

          const permission = await getTargetUserPermission(
            fileId,
            jwtPayload.payload.email,
            drive
          );

          userUpdatedRole = permission?.role;
        }

        console.log(`The role of the user is: ${userUpdatedRole}`);

        console.log("The user's role was updated.");

        console.log(`Will copy file: ${fileId}`);

        const fileCopyResult = await copyFile(
          gDriveAccessToken,
          [targetLessonFolder.id],
          fileId
        );
        console.log("fileCopyResult: ", fileCopyResult);
      }

      console.log("targetLessonFolder.id: ", targetLessonFolder.id);

      return response.json({
        msg: "Lesson copied.",
        lessonGdriveFolderId: targetLessonFolder.id,
      });
    }

    // TODO: if user.gpPlusDriveFolderId does not exist in the drive, then delete gpPlusDriveFolderId and the unitGDriveLessons
  } catch (error: any) {
    // Send an error response back to the client
    console.error("Error: ");
    console.dir(error);
    console.log("error?.response?.data: ", error?.response?.data);

    response.status(500).json({ error: "An error occurred", errorObj: error });
  } finally {
    if (parentFolder) {
      const drive = await createDrive();
      const filePermissionsUpdated = await drive.permissions.update({
        permissionId: parentFolder.permissionId,
        fileId: parentFolder.id,
        supportsAllDrives: true,
        requestBody: {
          role: "viewer",
        },
      });

      console.log("filePermissionsUpdated: ", filePermissionsUpdated.data);
    }
  }

  if (reqBody.fileIds) {
    console.log("Making all file readable...");
    for (const fileId of reqBody.fileIds) {
      const drive = await createDrive();
      // @ts-ignore
      const fileUpdated = await drive.files.update({
        fileId: fileId,
        supportsAllDrives: true,
        requestBody: {
          contentRestrictions: {
            readOnly: false,
          },
        },
      });

      console.log("fileUpdated: ", fileUpdated);
    }
  }

  return response.status(200).json({ message: "Lesson copied successfully" });
}
