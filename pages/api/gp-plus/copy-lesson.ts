import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { copyFile } from "../../../backend/services/googleDriveServices";
import { createGoogleDriveFolderForUser, getGDriveItem } from "./copy-unit";
import { getJwtPayloadPromise } from "../../../nondependencyFns";
import { getUserByEmail } from "../../../backend/services/userServices";
import { TUserSchemaV2 } from "../../../backend/models/User/types";

type TReqBody = Partial<{
    fileIds: string[];
    lessonNum: string;
    unit: {
      id: string,
      name: string
    };
}>

export default async function handler(request: NextApiRequest, response: NextApiResponse){
  try {
    const gDriveAccessToken = (request.headers?.['gdrive-token']?.length ? request.headers['gdrive-token'][0] : request.headers['gdrive-token']) as string | undefined;
    const gDriveRefreshToken = (request.headers?.['gdrive-token-refresh']?.length ? request.headers['gdrive-token-refresh'][0] : request.headers['gdrive-token-refresh']) as string | undefined;
    const reqBody = request.body as TReqBody;

    if(!gDriveAccessToken){
      response.status(401).json({ message: "Unauthorized. Have client log in again into their google drive." });
      return;
    }

    if(!gDriveRefreshToken){
      response.status(401).json({ message: "Unauthorized. The refresh token is not present in the headers." });
      return;
    }

    if(!reqBody?.unit?.id || !reqBody?.unit?.name || !reqBody?.fileIds?.length || !reqBody?.lessonNum){
      response.status(400).json({ message: "Request body is invalid. Check the body of the request." });
      return;
    }

    const jwtPayload = await getJwtPayloadPromise(request.headers.authorization);

    if (!jwtPayload) {
      response.status(401).json({ message: "Unauthorized. Please try logging in again." });
      return;
    }

    const user = await getUserByEmail(jwtPayload.payload.email, { unitGDriveLessons: 1, gpPlusDriveFolderId: 1 });

    if (!user) {
      response.status(404).json({ message: "User not found" });
      return;
    }

    if(!user.gpPlusDriveFolderId){
      const origin = new URL(request.headers.referer ?? "").origin;
      const gpPlusFolderCreationResult = await createGoogleDriveFolderForUser("My GP+ Units", gDriveAccessToken, [], 3, gDriveRefreshToken, origin)

      if(!gpPlusFolderCreationResult.wasSuccessful || !gpPlusFolderCreationResult.folderId){
        response.status(500).json({ message: "Error creating the My GP+ Units folder. Reason: " + gpPlusFolderCreationResult.errMsg });
        return;
      }
      

      const targetUnitFolderCreation = await createGoogleDriveFolderForUser(reqBody.unit.name, gDriveAccessToken, [gpPlusFolderCreationResult.folderId], 3, gDriveRefreshToken, origin)
    }

    


    

    
    


  } catch (error: any) {
    // Send an error response back to the client
    console.error('Error: ');
    console.dir(error)
    console.log("error?.response?.data: ", error?.response?.data)

    response.status(500).json({ error: "An error occurred" });
  }
};

