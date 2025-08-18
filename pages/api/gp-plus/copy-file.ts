import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { copyFile, copyFiles, GoogleServiceAccountAuthCreds } from "../../../backend/services/googleDriveServices";
import { getGDriveItem } from "./copy-unit";
import axios from "axios";
import { nanoid } from "nanoid";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

type TReqBody = {
    files: string[],
    copyFolderJobId: string
}

export default async function handler(request: NextApiRequest, response: NextApiResponse){
  try {
    // Handle the request
    const reqBody = request.body as TReqBody;
    const filesToCopy = reqBody.files as string[] | undefined;
    const gdriveAccessToken = request.headers["gdrive-token"];
    const gdriveRefreshToken = request.headers["gdrive-token-refresh"];
    
    // if(!filesToCopy?.length || !gdriveAccessToken || !gdriveRefreshToken) {
    //     return response.status(400).json({ error: "Invalid request. Please provide a valid file to copy and a valid access token" });
    // }

    const creds = new GoogleServiceAccountAuthCreds();
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: "drive-io-server@drive-io-app.iam.gserviceaccount.com",
        client_id: "100624470333829044448",
        private_key: process.env.TEST_PRIVATE_KEY
          ?.replace(/\\n/g, "\n")
          .replace(/"/g, ""),
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
      clientOptions: {
        subject: "gtorion@driveio.io"
      }
    });
    const gdrive = google.drive({ version: 'v3', auth })
    const driveCreationRes = await gdrive.drives.create({
      requestId: nanoid(),
      prettyPrint: true,
      requestBody: {
        name: "User's drive 2"
      }
    });
    
    console.log('driveCreationRes: ', driveCreationRes.data.id)

    response.status(200).json({ message: "File copied successfully" });
  } catch (error) {
    // Send an error response back to the client
    console.error('Error: ', error);

    response.status(500).json({ error: "An error occurred" });
  }
};

