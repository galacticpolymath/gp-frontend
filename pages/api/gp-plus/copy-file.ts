import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { copyFile, copyFiles } from "../../../backend/services/googleDriveServices";
import { getGDriveItem } from "./copy-unit";

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
    
    if(!filesToCopy?.length || !gdriveAccessToken || !gdriveRefreshToken) {
        return response.status(400).json({ error: "Invalid request. Please provide a valid file to copy and a valid access token" });
    }

    // console.log('filesToCopy[0]: ', filesToCopy[0]);

    const getGDriveItemRes = await getGDriveItem(filesToCopy[0], gdriveAccessToken as string)

    console.log('getGDriveItemRes: ', getGDriveItemRes);

    // const copyFileRes = await copyFile(gdriveAccessToken as string, [filesToCopy[0].parentFolderId as string], filesToCopy[0].id as string)

    // console.log('copyFileRes: ', copyFileRes);

    response.status(200).json({ message: "File copied successfully" });
  } catch (error) {
    // Send an error response back to the client
    response.status(500).json({ error: "An error occurred" });
  }
};

