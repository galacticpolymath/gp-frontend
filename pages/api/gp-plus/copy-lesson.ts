import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import {
  copyFile,
  GDriveItem,
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
  createGDriveFolder,
  getFolderChildItems,
  getUserChildItemsOfFolder,
  getGoogleDriveItem,
  getTargetUserPermission,
  ORIGINAL_ITEM_ID_FIELD_NAME,
} from "../../../backend/services/gdriveServices";
import { waitWithExponentialBackOff } from "../../../globalFns";
import { drive_v3 } from "googleapis";
import {
  ILessonGDriveId,
  IUnitGDriveLesson,
} from "../../../backend/models/User/types";
import { INewUnitLesson } from "../../../backend/models/Unit/types/teachingMaterials";

export const maxDuration = 240;

export type TCopyLessonReqBody = {
  fileIds: string[];
  lesson: Partial<{
    id: string;
    sharedGDriveLessonFolderId: string;
    lessonSharedDriveFolderName: string;
    name: string;
  }>;
  unit: Partial<{
    id: string;
    name: string;
    sharedGDriveId: string;
  }>;
} & Required<Pick<INewUnitLesson, "allUnitLessons" | "lessonsFolder">>;

// TODO: use allUntLessonIds to get all of the lesson folder ids that were created

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
  unit: { id: string; name: string; sharedGDriveId: string },
  lesson: {
    id: string;
    sharedGDriveId: string;
  },
  gDriveAccessToken: string,
  gpPlusFolderId: string,
  gDriveRefreshToken: string,
  clientOrigin: string,
  email: string,
  allUnitLessons: NonNullable<
    Pick<INewUnitLesson, "allUnitLessons">["allUnitLessons"]
  >
) => {
  const targetUnitFolderCreation = await createGDriveFolder(
    unit.name,
    gDriveAccessToken,
    [gpPlusFolderId],
    3,
    clientOrigin,
    gDriveRefreshToken
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
    {
      $push: {
        unitGDriveLessons: {
          unitDriveId: targetUnitFolderCreation.folderId,
          unitId: unit.id,
        } as IUnitGDriveLesson,
      },
    }
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

  console.log(`reqBody.unit.id: ${unit.sharedGDriveId}`);

  const drive = await createDrive();
  const gdriveResponse = await drive.files.list({
    corpora: "drive",
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    driveId: process.env.GOOGLE_DRIVE_ID,
    q: `'${unit.sharedGDriveId}' in parents`,
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
    clientOrigin
  );

  console.log("lesson.sharedGDriveId: ", lesson.sharedGDriveId);
  console.log("targetFolderStructureArr: ", targetFolderStructureArr);

  const targetLessonFolder = targetFolderStructureArr.find((folder) => {
    return folder.originalFileId === lesson.sharedGDriveId;
  });

  console.log("targetLessonFolder, java: ", targetLessonFolder);

  if (!targetLessonFolder?.id) {
    throw new CustomError(
      `The lesson named ${selectedClientLessonName} does not exist in the unit ${unit.name}.`,
      400
    );
  }

  const allUnitLessonFolders: ILessonGDriveId[] = [];

  for (const folderSubItem of targetFolderStructureArr) {
    const targetUnitLesson = allUnitLessons.find(
      (unitLesson) => unitLesson.sharedGDriveId === folderSubItem.originalFileId
    );

    if (targetUnitLesson && folderSubItem.id) {
      allUnitLessonFolders.push({
        lessonDriveId: folderSubItem.id,
        lessonNum: targetUnitLesson.id,
      });
    }
  }

  const lessonDriveIdUpdatedResult = await updateUserCustom(
    { email },
    {
      $push: {
        "unitGDriveLessons.$[elem].lessonDriveIds": {
          $each: allUnitLessonFolders,
        },
      },
    },
    {
      upsert: true,
      arrayFilters: [{ "elem.unitDriveId": targetUnitFolderCreation.folderId }],
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
    // console.log("fileCopyResult: ", fileCopyResult.status);
  }
};

const addNewGDriveLessonToTargetUser = async (
  email: string,
  lessonGDriveIds: ILessonGDriveId[],
  unit: Omit<IUnitGDriveLesson, "lessonDriveIds">
) => {
  console.log(`Adding new gdrive lessons to target user: ${email}`);

  try {
    const dbUser = await getUserByEmail(email);
    const isUnitPresent = !dbUser?.unitGDriveLessons?.some(
      (unitGDriveLessonsObj) => unitGDriveLessonsObj.unitId === unit.unitId
    );
    const lessonDriveIdUpdatedResult = await updateUserCustom(
      { email },
      addNewGDriveLessons(lessonGDriveIds, isUnitPresent),
      isUnitPresent
        ? {
            arrayFilters: [
              createDbArrFilter("elem.unitDriveId", unit.unitDriveId),
            ],
            upsert: true,
          }
        : {
            upsert: true,
          }
    );

    return lessonDriveIdUpdatedResult;
  } catch (error) {
    console.error("Error in addNewGDriveLessonToTargetUser: ", error);

    return {
      wasSuccessful: false,
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

    if (!request.headers.referer) {
      throw new CustomError(
        "The referer is not present in the request. This is a security feature to prevent unauthorized access.",
        403
      );
    }

    if (
      !reqBody?.unit?.id ||
      !reqBody?.unit?.name ||
      !reqBody?.unit?.sharedGDriveId ||
      !reqBody?.fileIds?.length ||
      !reqBody?.lesson?.id ||
      !reqBody?.lesson?.lessonSharedDriveFolderName ||
      !reqBody?.lesson?.sharedGDriveLessonFolderId ||
      !reqBody?.allUnitLessons ||
      !reqBody?.lessonsFolder ||
      !reqBody?.lessonsFolder?.sharedGDriveId ||
      !reqBody?.lessonsFolder?.name ||
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

    console.log("User, software: ", user);

    let gpPlusFolderId = gpPlusDriveFolderId;

    // checking if the 'My GP+ Units' folder exist in user's google drive
    if (gpPlusFolderId) {
      console.log(
        "will check if the target gp plus folder exist: ",
        gpPlusFolderId
      );
      const targetGDriveFolder = await getGoogleDriveItem(
        gpPlusFolderId,
        gDriveAccessToken
      );
      console.log("targetGDriveFolder: ", targetGDriveFolder);
      gpPlusFolderId =
        "id" in targetGDriveFolder && targetGDriveFolder.id
          ? gpPlusFolderId
          : undefined;

      // the gp plus folder doesn't exist, will reset all values pertaining to it in the db
      if (!gpPlusFolderId) {
        console.log(
          "The 'My GP+ Units' folder doesn't exist, will reset all values pertaining to it in the db"
        );
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

    console.log("Will check if the target unit and lesson exist...");

    console.log("gpPlusFolderId, hi there: ", gpPlusFolderId);

    console.log(
      `unitGDriveLessonsObjs?.length: ${unitGDriveLessonsObjs?.length}`
    );

    // throw new Error("hi");

    // the gp plus folder exist, will check if the target unit folder and the target lesson exist
    if (gpPlusFolderId && unitGDriveLessonsObjs?.length) {
      console.log(`reqBody.lesson!.id: ${reqBody.lesson!.id}`);
      console.log("unitGDriveLessonsObjs: ", unitGDriveLessonsObjs);
      const { unitDriveId, lessonDriveIds } =
        unitGDriveLessonsObjs.find((unitGDriveLessonsObj) => {
          return unitGDriveLessonsObj.unitId === reqBody.unit!.id;
        }) ?? {};
      const targetLessonFolderInUserDrive = lessonDriveIds?.find(
        (lessonDrive) => {
          return lessonDrive.lessonNum === reqBody.lesson!.id;
        }
      );
      console.log("lessonDriveIds: ", lessonDriveIds);
      console.log("unitDriveId: ", unitDriveId);
      console.log(
        "targetLessonFolderInUserDrive: ",
        targetLessonFolderInUserDrive
      );
      const doesTargetGDriveUnitFolderExist = unitDriveId
        ? "id" in (await getGDriveItem(unitDriveId, gDriveAccessToken))
        : false;
      const doesTargetGDriveLessonFolderExist =
        targetLessonFolderInUserDrive?.lessonDriveId
          ? "id" in
            (await getGDriveItem(
              targetLessonFolderInUserDrive?.lessonDriveId,
              gDriveAccessToken
            ))
          : false;

      if (unitDriveId && !doesTargetGDriveUnitFolderExist) {
        console.log(
          "The target unit folder does not exist, will delete from db"
        );
        const targetUnitDeletionResult = await updateUserCustom(
          {
            email,
          },
          {
            $pull: {
              unitGDriveLessons: { unitDriveId } as Pick<
                IUnitGDriveLesson,
                "unitDriveId"
              >,
            },
          }
        );

        console.log("targetUnitDeletionResult: ", targetUnitDeletionResult);
      } else if (
        targetLessonFolderInUserDrive?.lessonDriveId &&
        unitDriveId &&
        !doesTargetGDriveLessonFolderExist
      ) {
        const targetLessonDeletionResult = await updateUserCustom(
          {
            email,
          },
          {
            $pull: {
              "unitGDriveLessons.$[unitGDriveLessonsObj].lessonDriveIds": {
                lessonDriveId: targetLessonFolderInUserDrive.lessonDriveId,
              },
            },
          },
          {
            arrayFilters: [
              {
                "unitGDriveLessonsObj.unitDriveId": unitDriveId,
              },
            ],
          }
        );

        console.log("targetLessonDeletionResult: ", targetLessonDeletionResult);
      }

      console.log(
        `doesTargetGDriveLessonFolderExist: ${doesTargetGDriveLessonFolderExist}`
      );
      console.log(
        `doesTargetGDriveUnitFolderExist: ${doesTargetGDriveUnitFolderExist}`
      );

      console.log(`unitDriveId, python: ${unitDriveId}`);

      // create the structure of the target unit folder and copy the file items into the
      // corresponding lesson folder
      if (
        !doesTargetGDriveUnitFolderExist &&
        !doesTargetGDriveLessonFolderExist
      ) {
        console.log(
          `The target unit folder and its corresponding lesson folder do not exist, creating them...`
        );
        const drive = await createDrive();
        const clientOrigin = new URL(request.headers.referer ?? "").origin;
        const lessonFolderId = await createUnitFolder(
          {
            sharedGDriveId: reqBody.unit.sharedGDriveId,
            name: reqBody.unit.name,
            id: reqBody.unit.id,
          },
          {
            id: reqBody.lesson.id,
            sharedGDriveId: reqBody.lesson.sharedGDriveLessonFolderId,
          },
          gDriveAccessToken,
          gpPlusFolderId,
          gDriveRefreshToken,
          clientOrigin,
          email,
          reqBody.allUnitLessons
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

        const lessonDriveIdUpdatedResult = await updateUserCustom(
          { email },
          {
            $push: {
              "unitGDriveLessons.$[unitGDriveLessonsObj].lessonDriveIds": {
                lessonDriveId: lessonFolderId,
                lessonNum: reqBody.lesson.id,
              } as ILessonGDriveId,
            },
          },
          {
            arrayFilters: [
              {
                "unitGDriveLessonsObj.unitDriveId": unitDriveId,
              },
            ],
          }
        );

        console.log("lessonDriveIdUpdatedResult: ", lessonDriveIdUpdatedResult);

        return response.json({
          msg: "Lesson copied.",
          lessonGdriveFolderId: lessonFolderId,
        });
      }

      console.log("unitDriveId, hey there: ", unitDriveId);

      // The lessons folder doesn't exist. Create the target lesson folder and copy the items into it.
      if (
        doesTargetGDriveUnitFolderExist &&
        !doesTargetGDriveLessonFolderExist
      ) {
        console.log(
          "The target unit folder already exists, so we will create a new lesson folder and copy the items into it."
        );
        const clientOrigin = new URL(request.headers.referer ?? "").origin;
        const unitFolderChildItems = await getUserChildItemsOfFolder(
          unitDriveId!,
          gDriveAccessToken,
          gDriveRefreshToken,
          clientOrigin
        );
        let lessonsFolderId: string | null = null;
        const lessonsFolder =
          unitFolderChildItems &&
          unitFolderChildItems?.files?.find((file) => {
            if (
              file.appProperties &&
              ORIGINAL_ITEM_ID_FIELD_NAME in file.appProperties &&
              typeof file.appProperties[ORIGINAL_ITEM_ID_FIELD_NAME] ===
                "string"
            ) {
              return (
                file.appProperties[ORIGINAL_ITEM_ID_FIELD_NAME] ===
                reqBody.lessonsFolder!.sharedGDriveId
              );
            }

            return false;
          });

        console.log("unitFolderChildItems: ", unitFolderChildItems);
        console.log("lessonsFolder, yo there: ", lessonsFolder);

        if (lessonsFolder) {
          console.log(
            `The child items of the target folder with id ${unitDriveId} exist.`
          );

          console.log("lessonsFolder: ", lessonsFolder);
          lessonsFolderId = lessonsFolder?.id ?? null;
        } else {
          console.log(`The lessons folder doesn't exist. Will create it.`);
          const folderCreationResult = await createGDriveFolder(
            reqBody.lessonsFolder.name,
            gDriveAccessToken,
            [unitDriveId!],
            3,
            gDriveRefreshToken,
            clientOrigin,
            {
              [ORIGINAL_ITEM_ID_FIELD_NAME]:
                reqBody.lessonsFolder.sharedGDriveId ?? null,
            }
          );
          console.log("folderCreationResult: ", folderCreationResult);
          lessonsFolderId = folderCreationResult.folderId ?? null;
        }

        console.log(`The id of the lessons folder is: ${lessonsFolderId}`);

        if (!lessonsFolderId) {
          throw new Error(
            `Failed to create the lessons folder with the name ${reqBody.lessonsFolder.name} in the unit folder with id ${unitDriveId}.`
          );
        }

        const targetLessonFolderCreationResult = await createGDriveFolder(
          reqBody.lesson.lessonSharedDriveFolderName,
          gDriveAccessToken,
          [lessonsFolderId],
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

        console.log("The target lesson folder was created successfully.");

        // TODO: add the lesson folder to the lessonDriveIds array
        const userUpdateResults = await updateUserCustom(
          { email },
          {
            $push: {
              "unitGDriveLessons.$[elem].lessonDriveIds": {
                lessonDriveId: targetLessonFolderCreationResult.folderId,
                lessonNum: reqBody.lesson.id,
              } as ILessonGDriveId,
            },
          },
          {
            upsert: true,
            arrayFilters: [{ "elem.unitDriveId": unitDriveId }],
          }
        );

        if (userUpdateResults.wasSuccessful) {
          console.log(
            `The lesson folder ${reqBody.lesson.lessonSharedDriveFolderName} was successfully added to the unit folder with id ${unitDriveId}.`
          );
        } else {
          console.error(
            `Failed to add the lesson folder ${reqBody.lesson.lessonSharedDriveFolderName} to the unit folder with id ${unitDriveId}.`
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
        console.log(
          `The target lesson folder with id ${
            targetLessonFolderInUserDrive!.lessonDriveId
          } already exists, so we will just copy the items into it.`
        );
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
          targetLessonFolderInUserDrive!.lessonDriveId,
          gDriveRefreshToken,
          clientOrigin
        );

        return response.json({
          msg: "Lesson copied.",
          lessonGdriveFolderId: targetLessonFolderInUserDrive!.lessonDriveId,
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

    let unitGDriveLesson = {
      unitDriveId: targetUnitFolderCreation.folderId,
      unitId: reqBody.unit.id,
    } as IUnitGDriveLesson;

    console.log("unitGDriveLesson: ", unitGDriveLesson);

    const userUpdatedWithNewUnitObjResult = await updateUserCustom(
      { email },
      {
        $push: {
          unitGDriveLessons: unitGDriveLesson,
        },
      },
      {
        upsert: true,
      }
    );

    console.log(
      "userUpdatedWithNewUnitObjResult: ",
      userUpdatedWithNewUnitObjResult
    );

    console.log(
      "Updated user with new unit lessons object. Proceeding to copy lessons..."
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

    console.log(`reqBody.unit.id: ${reqBody.unit.sharedGDriveId}`);

    const drive = await createDrive();
    const gdriveResponse = await drive.files.list({
      corpora: "drive",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      driveId: process.env.GOOGLE_DRIVE_ID,
      q: `'${reqBody.unit.sharedGDriveId}' in parents`,
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
    console.log("selectedClientLessonName: ", selectedClientLessonName);
    const targetFolderStructureArr = await createFolderStructure(
      allChildFiles,
      gDriveAccessToken,
      targetUnitFolderCreation.folderId,
      gDriveRefreshToken,
      clientOrigin
    );
    console.log(
      "targetFolderStructureArr, yo there: ",
      targetFolderStructureArr
    );
    const targetLessonFolder = targetFolderStructureArr.find((folder) => {
      const lessonName = folder.name?.split("_").at(-1);

      console.log("lessonName: ", lessonName);

      return (
        lessonName && lessonName.toLowerCase() === selectedClientLessonName
      );
    });

    console.log("targetLessonFolder, hey there: ", targetLessonFolder);

    if (!targetLessonFolder?.id) {
      throw new CustomError(
        `The lesson named ${selectedClientLessonName} does not exist in the unit ${reqBody.unit.name}.`,
        400
      );
    }

    console.log(
      `The target lesson folder with the name ${selectedClientLessonName} was found with the id ${targetLessonFolder.id}`
    );

    const allUnitLessonFolders: ILessonGDriveId[] = [];

    for (const folderSubItem of targetFolderStructureArr) {
      const targetUnitLesson = reqBody.allUnitLessons.find(
        (unitLesson) =>
          unitLesson.sharedGDriveId === folderSubItem.originalFileId
      );

      if (targetUnitLesson && folderSubItem.id) {
        allUnitLessonFolders.push({
          lessonDriveId: folderSubItem.id,
          lessonNum: targetUnitLesson.id,
        });
      }
    }

    console.log("allUnitLessonFolders: ", allUnitLessonFolders);

    const lessonDriveIdsPushSuccessfulResult = await updateUserCustom(
      { email },
      {
        $push: {
          "unitGDriveLessons.$[elem].lessonDriveIds": {
            $each: allUnitLessonFolders,
          },
        },
      },
      {
        upsert: true,
        arrayFilters: [
          { "elem.unitDriveId": targetUnitFolderCreation.folderId },
        ],
      }
    );

    console.log(
      "lessonDriveIdsPushSuccessfulResult: ",
      lessonDriveIdsPushSuccessfulResult
    );

    const { wasSuccessful: wasLessonDriveIdsPushSuccessful } =
      lessonDriveIdsPushSuccessfulResult;

    if (wasLessonDriveIdsPushSuccessful) {
      console.log(
        "Successfully added the new lesson to the target user's object."
      );
    } else {
      console.error(
        "Failed to add the new lesson to the target user's object. Reason: "
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
        clientOrigin
      );
      console.log("fileCopyResult: ", fileCopyResult);
    }

    console.log("targetLessonFolder.id, java: ", targetLessonFolder.id);

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

    return response.status(code ?? 500).json({
      error:
        message ??
        `An error occurred. Error on server: ${error?.response?.data}`,
      errorObj: error,
    });
  } finally {
    if (parentFolder) {
      const drive = await createDrive();
      const filePermissionsUpdated = await drive.permissions.update({
        permissionId: parentFolder.permissionId,
        fileId: parentFolder.id,
        supportsAllDrives: true,
        requestBody: {
          role: "reader",
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
