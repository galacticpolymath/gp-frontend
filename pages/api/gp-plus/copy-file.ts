import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { copyFile, copyFiles, GoogleServiceAccountAuthCreds } from "../../../backend/services/googleDriveServices";
import { createGoogleDriveFolderForUser, getGDriveItem } from "./copy-unit";
import axios from "axios";
import { nanoid } from "nanoid";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

type TReqBody = {
    fileIds: string[],
}

export default async function handler(request: NextApiRequest, response: NextApiResponse){
  try {
    // Handle the request
    const reqBody = request.body as TReqBody;
    const fileIds = reqBody.fileIds as string[] | undefined;
    const gdriveAccessToken = request.headers["gdrive-token"];
    const gdriveRefreshToken = request.headers["gdrive-token-refresh"];

    console.log("fileIds: ", fileIds);

    console.log("gdriveAccessToken: ", gdriveAccessToken);
    
    if(!fileIds?.length || !gdriveAccessToken || Array.isArray(gdriveAccessToken)) {
        return response.status(400).json({ error: "Invalid request. Please provide a valid file to copy and a valid access token" });
    }

    // const res = await getGDriveItem(filesToCopy[0], gdriveAccessToken as string);
    
    const folderCreationResult = await createGoogleDriveFolderForUser("TESTING FOLDER 2", gdriveAccessToken, [])

    console.log('folderCreationResult.folderId: ', folderCreationResult.folderId);

    for (const fileId of fileIds){
      const copyFileResult = await copyFile(gdriveAccessToken, [folderCreationResult.folderId], fileId);

      console.log('copyFileResult: ', copyFileResult);
    }


    response.status(200).json({ message: "File copied successfully" });
  } catch (error: any) {
    // Send an error response back to the client
    console.error('Error: ');
    console.dir(error)
    console.log("error?.response?.data: ", error?.response?.data)

    response.status(500).json({ error: "An error occurred" });
  }
};

