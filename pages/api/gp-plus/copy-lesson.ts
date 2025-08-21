import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import {
  copyFile,
  FileMetaData,
  refreshAuthToken,
} from "../../../backend/services/googleDriveServices";
import { getGDriveItem } from "./copy-unit";
import { getJwtPayloadPromise } from "../../../nondependencyFns";
import { getUserByEmail } from "../../../backend/services/userServices";
import { TUserSchemaV2 } from "../../../backend/models/User/types";
import { CustomError } from "../../../backend/utils/errors";
import axios from "axios";
import {
  createDrive,
  createFolderStructure,
  getFolderChildItems,
  getTargetUserPermission,
} from "../../../backend/services/gdriveServices";
import { waitWithExponentialBackOff } from "../../../globalFns";

export type TCopyLessonReqBody = Partial<{
  fileIds: string[];
  lesson: {
    id: string;
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
  try {
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

    const user = await getUserByEmail(jwtPayload.payload.email, {
      unitGDriveLessons: 1,
      gpPlusDriveFolderId: 1,
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (!user.gpPlusDriveFolderId) {
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

      console.log("will create the target unit folder")

      console.log("reqBody.unit.name: ", reqBody.unit.name);

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

      console.log(
        `gdriveResponse.data.files.length: `,
        gdriveResponse.data.files
      );
      const allChildFiles = await getFolderChildItems(
        gdriveResponse.data.files
      );

      console.log("allChildFiles: ", allChildFiles);
      const selectedClientLessonName = reqBody.lesson.name.toLowerCase();
      const targetFolderStructureArr = await createFolderStructure(allChildFiles, gDriveAccessToken, targetUnitFolderCreation.folderId, gDriveRefreshToken, origin);
      const targetLessonFolder = targetFolderStructureArr.find(folder => {
        const lessonName = folder.name?.split('_').at(-1);

        return lessonName && (lessonName.toLowerCase() === selectedClientLessonName)
      });

      console.log("targetLessonFolder: ", targetLessonFolder);
      

      if (!targetLessonFolder) {
        throw new CustomError(
          `The lesson named ${selectedClientLessonName} does not exist in the unit ${reqBody.unit.name}.`,
          400
        );
      }

      return response.status(200).json({
        message: `The lesson named ${selectedClientLessonName} has been successfully copied to the unit ${reqBody.unit.name}.`,
      });

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
            break;
          }

          await waitWithExponentialBackOff(tries);

          const permission = await getTargetUserPermission(
            reqBody.fileIds[0],
            jwtPayload.payload.email,
            drive
          );

          userUpdatedRole = permission?.role;
        }

        console.log("The user's role was updated.");
      }

      // check if the target permission was updated for the target user

      const fileCopyResult = await copyFile(
        gDriveAccessToken,
        [],
        reqBody.fileIds[0]
      );

      console.log("fileCopyResult: ", fileCopyResult);

      // console.log("fileCopyResult: ", fileCopyResult);
      // const folderStructureCreationResult = await createFolderStructure(allChildFiles, gDriveAccessToken, targetUnitFolderCreation.folderId, gDriveRefreshToken);

      // console.log("folderStructureCreationResult: ", folderStructureCreationResult);

      response.json({ msg: "Lesson copied." });
    }
  } catch (error: any) {
    // Send an error response back to the client
    console.error("Error: ");
    console.dir(error);
    console.log("error?.response?.data: ", error?.response?.data);

    response.status(500).json({ error: "An error occurred" });
  }
}
