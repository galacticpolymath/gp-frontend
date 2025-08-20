import { NextApiRequest, NextApiResponse } from "next";
import { getChildItems } from "./copy-unit";
import { createDrive } from "./copy-file";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const childItems = await getChildItems(await createDrive(), request.body.unitDriveId as string);

    return response.status(200).json({ childItems });
  } catch (error: any) {
    console.error("An error has occurred. Failed to get child items of the target unit google drive folder: ", error);
    

    return response.status(500).json({
      childItems: null,
      error: {
        message: error.message,
        stack: error.stack, 
        error
      }
    });
  }
}
