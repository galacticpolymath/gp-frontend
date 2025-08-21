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
import { createDrive, createFolderStructure, getFolderChildItems } from "../../../backend/services/gdriveServices";

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
      response
        .status(401)
        .json({
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
      console.log("will create the gp plus unit folder")
      console.log("gDriveAccessToken: ", gDriveAccessToken);
      // const gpPlusFolderCreationResult = await createGoogleDriveFolderForUser(
      //   "My GP+ Units",
      //   gDriveAccessToken,
      //   [],
      //   3,
      //   gDriveRefreshToken,
      //   origin
      // );

      // if (
      //   !gpPlusFolderCreationResult.wasSuccessful ||
      //   !gpPlusFolderCreationResult.folderId
      // ) {
      //   throw new CustomError(
      //     "Error creating the My GP+ Units folder. Reason: " +
      //       gpPlusFolderCreationResult.errMsg,
      //     500
      //   );
      // }

      // console.log("will create the target unit folder")

      // const targetUnitFolderCreation = await createGoogleDriveFolderForUser(
      //   reqBody.unit.name,
      //   gDriveAccessToken,
      //   [gpPlusFolderCreationResult.folderId],
      //   3,
      //   gDriveRefreshToken,
      //   origin
      // );

      // if (
      //   !targetUnitFolderCreation.wasSuccessful ||
      //   !targetUnitFolderCreation.folderId
      // ) {
      //   throw new CustomError(
      //     `Error creating the folder for unit ${reqBody.unit.name}. Reason: ${targetUnitFolderCreation.errMsg}`,
      //     500
      //   );
      // }

      console.log("Will get the target folder structure.");

      console.log(`reqBody.unit.id: ${reqBody.unit?.id}`);
      

      const drive = await createDrive();
      const gdriveResponse = await drive.files.list({
        corpora: "drive",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        driveId: process.env.GOOGLE_DRIVE_ID,
        q: `'${reqBody.unit?.id}' in parents`,
        fields: "*"
      });

      if(!gdriveResponse.data?.files){
        throw new CustomError(
          "Failed to get the root items of the target unit folder.",
          500
        );
      }

      console.log(`gdriveResponse.data.files.length: `, gdriveResponse.data.files);
      const allChildFiles = await getFolderChildItems(gdriveResponse.data.files)
      console.log("allChildFiles.length: ", allChildFiles.length);
      console.log("reqBody.fileIds: ", reqBody.fileIds);
      const fileCopyResult = await copyFile(gDriveAccessToken, [], reqBody.fileIds[0]);
      console.log("fileCopyResult: ", fileCopyResult);
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
