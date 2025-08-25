import { NextApiRequest, NextApiResponse } from "next";
import { getJwtPayloadPromise } from "../../../nondependencyFns";
import { getUserByEmail } from "../../../backend/services/userServices";
import { getGDriveItem, getUserChildItemsOfFolder } from "../../../backend/services/gdriveServices";

interface IQueryParams {
  unitId: string;
  lessonNumIds: string[];
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    console.log("request.query: ", request.query);
    const { lessonNumIds, unitId } = request.query as unknown as IQueryParams;

    if (!lessonNumIds) {
      console.log("lessonNumIds query parameter is required");
      return response
        .status(400)
        .json({ error: "'lessonNumIds' query parameter is required" });
    }

    if (!unitId || typeof unitId !== "string") {
      console.log("unitId must be a string");
      return response
        .status(400)
        .json({ error: "'unitId' query parameter is required" });
    }

    const lessonIds = Array.isArray(lessonNumIds)
      ? lessonNumIds
      : [lessonNumIds];

    if (!lessonIds.every((id) => typeof id === "string")) {
      console.log("Error: All lessonNumIds must be strings");
      
      return response
        .status(400)
        .json({ error: "All lessonNumIds must be strings" });
    }

    const authorization = request.headers.authorization;
    const gdriveAccessToken = request.headers["gdrive-token"]
    const gdriveRefreshToken = request.headers["gdrive-token-refresh"]
    const clientOrigin = (new URL(request.headers.referer ?? '')).href;

    if (!clientOrigin) {
      console.log("clientOrigin is required");

      return response
        .status(400)
        .json({ error: "clientOrigin is required" });
    }

    if (typeof gdriveAccessToken !== "string" || typeof gdriveRefreshToken !== "string") {
      console.log("gdriveAccessToken or gdriveRefreshToken is required");

      return response
        .status(401)
        .json({ error: "gdriveAccessToken and gdriveRefreshToken are BOTH required" });
    }

    if (!authorization) {
      console.log("Authorization header is required");

      return response
        .status(401)
        .json({ error: "Authorization header is required" });
    }

    const { email } =
      (await getJwtPayloadPromise(authorization))?.payload ?? {};

    if (!email) {
      return response.status(401).json({ error: "User is not authenticated" });
    }

    const targetUser = await getUserByEmail(email, { unitGDriveLessons: 1 });

    console.log("targetUser: ", targetUser);

    if (!targetUser) {
      return response.status(404).json({ error: "User is not found" });
    }

    if (!targetUser.unitGDriveLessons?.length) {
      return response.status(404).json({ error: "There are not lesson google drive folder ids for this user." });
    }

    const targetUnitGDriveLessonObj = targetUser.unitGDriveLessons.find(unitGDriveLessonObj => {
      return unitGDriveLessonObj.unitId === unitId
    }) 

    console.log("targetUnitGDriveLessonObj: ", targetUnitGDriveLessonObj);

    if (!targetUnitGDriveLessonObj?.lessonDriveIds?.length) {
      return response.status(404).json({ error: "There are not lesson google drive folder ids for this unit." });
    }

    console.log("gdriveAccessToken: ", gdriveAccessToken);
    

    const existingLessonFolderGDriveIds = await Promise.all(targetUnitGDriveLessonObj.lessonDriveIds.filter(async (lessonDriveFolder) => {
      const gdriveItem = await getGDriveItem(lessonDriveFolder.lessonDriveId, gdriveAccessToken, gdriveRefreshToken, clientOrigin)

      return "id" in gdriveItem ? gdriveItem.id : false; 
    }));

    console.log("existingLessonFolderGDriveIds: ", existingLessonFolderGDriveIds);

    return response.json(existingLessonFolderGDriveIds);
  } catch (error: any) {
    console.error("Error in get-gdrive-lesson-ids:", error);

    return response.status(500).json({ error: "Internal server error" });
  }
}
