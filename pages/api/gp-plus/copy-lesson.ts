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
  copyGDriveItem,
  createDrive,
  createFolderStructure,
  getFolderChildItems,
  getGoogleDriveItem,
  getTargetUserPermission,
} from "../../../backend/services/gdriveServices";
import { waitWithExponentialBackOff } from "../../../globalFns";
import { drive_v3 } from "googleapis";

export const maxDuration = 240;

export type TCopyLessonReqBody = {
  fileIds: string[];
  lesson: Partial<{
    id: string;
    sharedGDriveLessonFolderId: string;
    lessonSharedDriveFolderName: string;
    name: string;
  }>;
  unit: {
    id: string;
    name: string;
  };
};

const createGDriveFolder = async (
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

      return await createGDriveFolder(
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

const getCanRetry = async (
  error: any,
  refreshToken: string,
  reqOriginForRefreshingToken: string
) => {
  if (error?.response?.data?.error?.status === "UNAUTHENTICATED") {
    console.log("Will refresh the auth token...");

    const refreshTokenRes =
      (await refreshAuthToken(refreshToken, reqOriginForRefreshingToken)) ?? {};
    const { accessToken } = refreshTokenRes;

    if (!accessToken) {
      throw new Error("Failed to refresh access token");
    }

    return {
      canRetry: true,
      accessToken,
    };
  }

  if (error?.code === "ECONNABORTED") {
    return {
      canRetry: true,
    };
  }

  return {
    canRetry: false,
  };
};

const createUnitFolder = async (
  unit: { id: string; name: string },
  lessonId: string,
  gDriveAccessToken: string,
  gpPlusFolderId: string,
  gDriveRefreshToken: string,
  origin: string,
  email: string
) => {
  const targetUnitFolderCreation = await createGDriveFolder(
    unit.name,
    gDriveAccessToken,
    [gpPlusFolderId],
    3,
    gDriveRefreshToken,
    origin
  );

  console.log("targetUnitFolderCreation: ", targetUnitFolderCreation);

  if (!targetUnitFolderCreation.folderId) {
    throw new CustomError(
      `Error creating the folder for unit ${unit.name}. Reason: ${targetUnitFolderCreation.errMsg}`,
      500
    );
  }

  const userUpdatedWithNewUnitObjResult = await updateUserCustom(
    { email },
    addNewGDriveUnits([
      {
        unitDriveId: targetUnitFolderCreation.folderId,
        unitId: unit.id,
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

  console.log(`reqBody.unit.id: ${unit.id}`);

  const drive = await createDrive();
  const gdriveResponse = await drive.files.list({
    corpora: "drive",
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    driveId: process.env.GOOGLE_DRIVE_ID,
    q: `'${unit.id}' in parents`,
    fields: "*",
  });

  if (!gdriveResponse.data?.files) {
    throw new CustomError(
      "Failed to get the root items of the target unit folder.",
      500
    );
  }

  const allChildFiles = await getFolderChildItems(gdriveResponse.data.files);

  console.log("allChildFiles: ", allChildFiles);

  const selectedClientLessonName = unit.name.toLowerCase();
  const targetFolderStructureArr = await createFolderStructure(
    allChildFiles,
    gDriveAccessToken,
    targetUnitFolderCreation.folderId,
    gDriveRefreshToken,
    origin
  );
  console.log("targetFolderStructureArr: ", targetFolderStructureArr);
  const targetLessonFolder = targetFolderStructureArr.find((folder) => {
    const lessonName = folder.name?.split("_").at(-1);

    return lessonName && lessonName.toLowerCase() === selectedClientLessonName.toLowerCase();
  });

  console.log("targetLessonFolder: ", targetLessonFolder);

  if (!targetLessonFolder?.id) {
    throw new CustomError(
      `The lesson named ${selectedClientLessonName} does not exist in the unit ${unit.name}.`,
      400
    );
  }

  const lessonDriveIdUpdatedResult = await updateUserCustom(
    { email },
    addNewGDriveLessons([
      {
        lessonDriveId: targetLessonFolder.id,
        lessonNum: lessonId,
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

  return targetLessonFolder.id;
};

const updatePermissionsForSharedFileItems = async (
  drive: drive_v3.Drive,
  email: string,
  fileIds: string[]
) => {
  // get the parent folder id of the files to copy
  const parentFolderId = (
    await drive.files.get({
      fileId: fileIds[0],
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
    email,
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
  for (const fileId of fileIds) {
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

  return { id: parentFolderId, permissionId: targetPermission.id };
};

const copyFiles = async (
  fileIds: string[],
  email: string,
  drive: drive_v3.Drive,
  gDriveAccessToken: string,
  lessonFolderId: string,
  refreshAuthToken: string,
  clientOrigin: string
) => {
  // check if the permission were propagated to all of the files to copy
  for (const fileId of fileIds) {
    const permission = await getTargetUserPermission(fileId, email, drive);

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

      const permission = await getTargetUserPermission(fileId, email, drive);

      userUpdatedRole = permission?.role;
      tries -= 1;
    }

    console.log(`The role of the user is: ${userUpdatedRole}`);

    console.log("The user's role was updated.");

    console.log(`Will copy file: ${fileId}`);

    const fileCopyResult = await copyGDriveItem(
      gDriveAccessToken,
      [lessonFolderId],
      fileId,
      refreshAuthToken,
      clientOrigin
    );
    console.log("fileCopyResult: ", fileCopyResult);
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

    if (!request.headers.referer) {
      throw new CustomError(
        "The referer is not present in the request. This is a security feature to prevent unauthorized access.",
        403
      );
    }

    if (
      !reqBody?.unit?.id ||
      !reqBody?.unit?.name ||
      !reqBody?.fileIds?.length ||
      !reqBody?.lesson?.id ||
      !reqBody?.lesson?.lessonSharedDriveFolderName ||
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

    const { gpPlusDriveFolderId, unitGDriveLessons: unitGDriveLessonsObjs } =
      user;
    let gpPlusFolderId = gpPlusDriveFolderId;

    // checking if the 'My GP+ Units' folder exist in user's google drive
    if (user.gpPlusDriveFolderId) {
      const targetGDriveFolder = await getGoogleDriveItem(
        user.gpPlusDriveFolderId,
        gDriveAccessToken
      );
      gpPlusFolderId =
        "id" in targetGDriveFolder && targetGDriveFolder.id
          ? gpPlusFolderId
          : undefined;

      if (!gpPlusFolderId) {
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

    // the gp plus folder exist, will check if the target unit folder and the target lesson exist
    if (gpPlusFolderId && unitGDriveLessonsObjs?.length) {
      const { unitDriveId, lessonDriveIds } =
        unitGDriveLessonsObjs.find((unitGDriveLessonsObj) => {
          return unitGDriveLessonsObj.unitId === reqBody.unit!.id;
        }) ?? {};
      console.log(`reqBody.lesson!.id: ${reqBody.lesson!.id}`);
      const targetLessonDrive = lessonDriveIds?.find((lessonDrive) => {
        return lessonDrive.lessonNum === reqBody.lesson!.id;
      });
      const doesTargetGDriveUnitFolderExist = unitDriveId
        ? "id" in (await getGDriveItem(unitDriveId, gDriveAccessToken))
        : false;
      const doesTargetGDriveLessonFolderExist = targetLessonDrive?.lessonDriveId
        ? "id" in
          (await getGDriveItem(
            targetLessonDrive?.lessonDriveId,
            gDriveAccessToken
          ))
        : false;

      console.log(`unitDriveId: ${unitDriveId}`);

      // create the structure of the target unit folder and the copy the file items into the
      // corresponding lesson folder
      if (
        !doesTargetGDriveUnitFolderExist &&
        !doesTargetGDriveLessonFolderExist
      ) {
        const drive = await createDrive();
        const clientOrigin = new URL(request.headers.referer ?? "").origin;
        const lessonFolderId = await createUnitFolder(
          {
            id: reqBody.unit.id,
            name: reqBody.unit.name,
          },
          reqBody.lesson.id,
          gDriveAccessToken,
          gpPlusFolderId,
          gDriveRefreshToken,
          clientOrigin,
          email
        );
        const copyItemsParentFolder = await updatePermissionsForSharedFileItems(
          drive,
          email,
          reqBody.fileIds
        );
        parentFolder = {
          id: copyItemsParentFolder.id,
          permissionId: copyItemsParentFolder.permissionId,
        };

        await copyFiles(
          reqBody.fileIds,
          email,
          drive,
          gDriveAccessToken,
          lessonFolderId,
          gDriveRefreshToken,
          clientOrigin
        );

        return response.json({
          msg: "Lesson copied.",
          lessonGdriveFolderId: lessonFolderId,
        });
      }

      console.log("unitDriveId, hey there: ", unitDriveId);

      // create the target lesson folder and copy the items into it
      if (
        doesTargetGDriveUnitFolderExist &&
        !doesTargetGDriveLessonFolderExist
      ) {
        const clientOrigin = new URL(request.headers.referer ?? "").origin;
        const targetLessonFolderCreationResult = await createGDriveFolder(
          reqBody.lesson.lessonSharedDriveFolderName,
          gDriveAccessToken,
          [unitDriveId!],
          3,
          gDriveRefreshToken,
          clientOrigin
        );

        if (
          !targetLessonFolderCreationResult.wasSuccessful ||
          !targetLessonFolderCreationResult.folderId
        ) {
          throw new Error(
            `Failed to create the lesson folder ${reqBody.lesson.lessonSharedDriveFolderName} into the target unit folder with id ${unitDriveId}.`
          );
        }

        const drive = await createDrive();
        // make the target shared drive files read only to prevent writes during the copy operation
        const copyItemsParentFolder = await updatePermissionsForSharedFileItems(
          drive,
          email,
          reqBody.fileIds
        );
        parentFolder = {
          id: copyItemsParentFolder.id,
          permissionId: copyItemsParentFolder.permissionId,
        };

        await copyFiles(
          reqBody.fileIds,
          email,
          drive,
          gDriveAccessToken,
          targetLessonFolderCreationResult.folderId,
          gDriveRefreshToken,
          clientOrigin
        );

        return response.json({
          msg: "Lesson copied.",
          lessonGdriveFolderId: targetLessonFolderCreationResult.folderId,
        });
      }

      if (doesTargetGDriveLessonFolderExist) {
        const clientOrigin = new URL(request.headers.referer ?? "").origin;
        const drive = await createDrive();
        // make the target shared drive files read only to prevent writes during the copy operation
        const copyItemsParentFolder = await updatePermissionsForSharedFileItems(
          drive,
          email,
          reqBody.fileIds
        );
        parentFolder = {
          id: copyItemsParentFolder.id,
          permissionId: copyItemsParentFolder.permissionId,
        };

        await copyFiles(
          reqBody.fileIds,
          email,
          drive,
          gDriveAccessToken,
          targetLessonDrive!.lessonDriveId,
          gDriveRefreshToken,
          clientOrigin
        );

        return response.json({
          msg: "Lesson copied.",
          lessonGdriveFolderId: targetLessonDrive!.lessonDriveId,
        });
      }
    }

    // TODO: if the unit folder doesn't exist, then delete the target unit from the user's unitGDriveLessons by its drive id

    // TODO: if the unit lesson doesn't exist, then get the child items for the target unit using the service account, in order to get the name of the lesson
    // -find it by using the lessonSharedDriveId from the client to get the target lesson

    // TODO: if the target lesson folder is there, then copy all items into the lesson folder

    // will create the gp plus folder and the target unit

    if (!gpPlusFolderId) {
      const clientOrigin = new URL(request.headers.referer ?? "").origin;
      console.log("will create the gp plus unit folder");
      console.log("gDriveAccessToken: ", gDriveAccessToken);
      const gpPlusFolderCreationResult = await createGDriveFolder(
        "My GP+ Units",
        gDriveAccessToken,
        [],
        3,
        gDriveRefreshToken,
        clientOrigin
      );

      if (!gpPlusFolderCreationResult.folderId) {
        throw new CustomError(
          "Error creating the My GP+ Units folder. Reason: " +
            gpPlusFolderCreationResult.errMsg,
          500
        );
      }

      gpPlusFolderId = gpPlusFolderCreationResult.folderId;

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
    }

    console.log("Will create the target unit folder...");

    const clientOrigin = new URL(request.headers.referer).origin;
    const targetUnitFolderCreation = await createGDriveFolder(
      reqBody.unit.name,
      gDriveAccessToken,
      [gpPlusFolderId],
      3,
      gDriveRefreshToken,
      clientOrigin
    );

    console.log("targetUnitFolderCreation: ", targetUnitFolderCreation);

    if (!targetUnitFolderCreation.folderId) {
      throw new CustomError(
        `Error creating the folder for unit ${reqBody.unit.name}. Reason: ${targetUnitFolderCreation.errMsg}`,
        500
      );
    }

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

    const allChildFiles = await getFolderChildItems(gdriveResponse.data.files);

    console.log("allChildFiles: ", allChildFiles);

    const selectedClientLessonName = reqBody.lesson.name.toLowerCase();
    // create the folder structure in the user's google drive
    const targetFolderStructureArr = await createFolderStructure(
      allChildFiles,
      gDriveAccessToken,
      targetUnitFolderCreation.folderId,
      gDriveRefreshToken,
      clientOrigin
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

    // allow the user to programmatically copy the files by changing to the target role below
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

      const fileCopyResult = await copyGDriveItem(
        gDriveAccessToken,
        [targetLessonFolder.id],
        fileId,
        gDriveRefreshToken,
        origin
      );
      console.log("fileCopyResult: ", fileCopyResult);
    }

    console.log("targetLessonFolder.id: ", targetLessonFolder.id);

    return response.json({
      msg: "Lesson copied.",
      lessonGdriveFolderId: targetLessonFolder.id,
    });
    // TODO: if user.gpPlusDriveFolderId does not exist in the drive, then delete gpPlusDriveFolderId and the unitGDriveLessons
  } catch (error: any) {
    const { message, code } = error ?? {};

    console.error("Error: ");
    console.dir(error);
    console.log("error?.response?.data: ", error?.response?.data);

    return response
      .status(code ?? 500)
      .json({ error: message ?? `An error occurred. Error on server: ${error?.response?.data}`, errorObj: error });
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
  }
}
