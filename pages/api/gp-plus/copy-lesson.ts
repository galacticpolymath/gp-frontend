import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import {
  copyFile,
  GDriveItem,
  refreshAuthToken,
} from "../../../backend/services/googleDriveServices";
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
import {
  copyGDriveItem,
  createDrive,
  createFolderStructure,
  createGDriveFolder,
  getFolderChildItems,
  getUserChildItemsOfFolder,
  getTargetUserPermission,
  ORIGINAL_ITEM_ID_FIELD_NAME,
  getGDriveItem,
  createUnitFolder,
  copyFiles,
  shareFilesWithUser,
  shareFileWithUser,
} from "../../../backend/services/gdriveServices";
import { sleep, waitWithExponentialBackOff } from "../../../globalFns";
import { drive_v3 } from "googleapis";
import {
  ILessonGDriveId,
  IUnitGDriveLesson,
} from "../../../backend/models/User/types";
import { INewUnitLesson } from "../../../backend/models/Unit/types/teachingMaterials";
import { connectToMongodb } from "../../../backend/utils/connection";
import {
  updatePermissionsForSharedFileItems,
  logFailedFileCopyToExcel,
  IFailedFileCopy,
} from "../../../backend/services/gdriveServices";

export const maxDuration = 240;
export const VALID_WRITABLE_ROLES = new Set(["fileOrganizer", "organizer"]);

export type TCopyFilesMsg = Partial<{
  msg: string;
  targetFolderId: string;
  msgs: string[];
  isJobDone: boolean;
  didJobStart: boolean;
  wasSuccessful: boolean;
  showSupportTxt: boolean;
  foldersToCopy: number;
  failedCopiedFile: string;
  folderCreated: string;
  fileCopied: string;
  folderCopyId: string;
  filesToCopy: number;
  didRetrieveAllItems: boolean;
  refreshToken: string;
  errStatus: string;
}>;
export type TCopyLessonReqQueryParams = {
  lessonId: string | undefined;
  lessonSharedGDriveFolderId: string | undefined;
  lessonSharedDriveFolderName: string | undefined;
  lessonName: string | undefined;
  unitId: string | undefined;
  unitName: string | undefined;
  unitSharedGDriveId: string | undefined;
  // allUnitLessons: Pick<INewUnitLesson, "allUnitLessons">["allUnitLessons"] | undefined
  // lessonsFolder: Pick<INewUnitLesson, "lessonsFolder">["lessonsFolder"] | undefined
  // fileIds: string[];
  fileIds: string[];
  fileNames: string[];
  allUnitLessons: string | undefined;
  lessonsFolder: string | undefined;
};

export const sendMessage = <TMsg extends object = TCopyFilesMsg>(
  response: NextApiResponse,
  data: TMsg,
  willEndStream?: boolean,
  delayMs?: number
) => {
  const _data = JSON.stringify(data);

  if (willEndStream && delayMs) {
    setTimeout(() => {
      response.end(`data: ${_data}\n\n`);
    }, delayMs);
    return;
  }

  if (willEndStream) {
    response.end(`data: ${_data}\n\n`);
    return;
  }

  if (delayMs) {
    setTimeout(() => {
      response.write(`data: ${_data}\n\n`);
    }, delayMs);
    return;
  }

  response.write(`data: ${_data}\n\n`);

  if (
    "isJobDone" in data &&
    typeof data.isJobDone === "boolean" &&
    data.isJobDone
  ) {
    response.end();
  }
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "kee-alive");
  response.setHeader("Content-Encoding", "none");

  let isStreamOpen = true;

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
  const reqQueryParams = request.query as unknown as TCopyLessonReqQueryParams;
  let parentFolder: { id: string; permissionId: string } | null = null;

  let wasUserRolesAndFileMetaDataReseted = false;

  response.on("close", async () => {
    console.log("The user closed the stream.");
    isStreamOpen = false;

    if (!wasUserRolesAndFileMetaDataReseted && parentFolder) {
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

    if (!wasUserRolesAndFileMetaDataReseted && reqQueryParams.fileIds) {
      console.log("Making all file readable...");
      for (const fileId of reqQueryParams.fileIds) {
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
  });

  try {
    console.log("reqQueryParams: ", reqQueryParams);

    console.log("request.headers: ", request.headers);

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

    console.log("reqQueryParams?.fileIds: ", reqQueryParams?.fileIds);

    if (
      !reqQueryParams.unitId ||
      !reqQueryParams.unitName ||
      !reqQueryParams.unitSharedGDriveId ||
      !reqQueryParams?.fileIds?.length ||
      !reqQueryParams?.lessonId ||
      !reqQueryParams?.lessonSharedDriveFolderName ||
      !reqQueryParams?.lessonSharedGDriveFolderId ||
      !reqQueryParams?.allUnitLessons ||
      !reqQueryParams?.lessonsFolder ||
      !reqQueryParams?.lessonName
    ) {
      throw new CustomError(
        "Request body is invalid. Check the body of the request.",
        400
      );
    }

    const _lessonsFolder = JSON.parse(
      decodeURIComponent(reqQueryParams.lessonsFolder)
    ) as NonNullable<Pick<INewUnitLesson, "lessonsFolder">["lessonsFolder"]>;
    const _allUnitLessons = JSON.parse(
      decodeURIComponent(reqQueryParams.allUnitLessons)
    ) as NonNullable<Pick<INewUnitLesson, "allUnitLessons">["allUnitLessons"]>;
    const jwtPayload = await getJwtPayloadPromise(
      request.headers.authorization
    );

    if (!jwtPayload) {
      throw new CustomError("Unauthorized. Please try logging in again.", 401);
    }

    const { wasSuccessful: wasDbConnectionSuccessful } = await connectToMongodb(
      15_000,
      0,
      true
    );

    if (!wasDbConnectionSuccessful) {
      throw new CustomError(
        "Failed to connect to the database. Please try again later.",
        500
      );
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

    // checking if the 'My GP+ Units' folder exist in user's google drive and is not trashed
    if (gpPlusFolderId) {
      console.log(
        "will check if the target gp plus folder exist: ",
        gpPlusFolderId
      );
      const clientOrigin = new URL(request.headers.referer ?? "").origin;
      const targetGDriveFolder = await getGDriveItem(
        gpPlusFolderId,
        gDriveAccessToken,
        gDriveRefreshToken,
        clientOrigin
      );
      console.log("targetGDriveFolder: ", targetGDriveFolder);

      if (
        "id" in targetGDriveFolder &&
        (!targetGDriveFolder.id || targetGDriveFolder.labels.trashed)
      ) {
        gpPlusFolderId = undefined;
      }

      // the gp plus folder doesn't exist or has been trashed, will reset all values pertaining to it in the db
      if (!gpPlusFolderId) {
        console.log(
          "The 'My GP+ Units' folder doesn't exist, will reset all values pertaining to it in the db"
        );

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

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

    // the gp plus folder exist, will check if the target unit folder and the target lesson exist
    if (gpPlusFolderId && unitGDriveLessonsObjs?.length) {
      console.log(`reqQueryParams.lesson!.id: ${reqQueryParams.lessonId}`);
      console.log("unitGDriveLessonsObjs: ", unitGDriveLessonsObjs);
      const clientOrigin = new URL(request.headers.referer ?? "").origin;
      const { unitDriveId, lessonDriveIds } =
        unitGDriveLessonsObjs.find((unitGDriveLessonsObj) => {
          return unitGDriveLessonsObj.unitId === reqQueryParams.unitId;
        }) ?? {};
      const targetLessonFolderInUserDrive = lessonDriveIds?.find(
        (lessonDrive) => {
          return (
            lessonDrive.lessonSharedGDriveFolderId ===
            reqQueryParams.lessonSharedGDriveFolderId
          );
        }
      );
      console.log("lessonDriveIds: ", lessonDriveIds);
      console.log("unitDriveId: ", unitDriveId);
      console.log(
        "targetLessonFolderInUserDrive: ",
        targetLessonFolderInUserDrive
      );

      let doesTargetGDriveUnitFolderExist = !!unitDriveId;

      if (unitDriveId) {
        const targetUnitFolder = await getGDriveItem(
          unitDriveId,
          gDriveAccessToken,
          gDriveRefreshToken,
          clientOrigin
        );
        doesTargetGDriveUnitFolderExist =
          "id" in targetUnitFolder &&
          !!targetUnitFolder.id &&
          !targetUnitFolder.labels.trashed;
      }

      if (targetLessonFolderInUserDrive?.lessonDriveId) {
        const targetLessonsFolder = await getGDriveItem(
          targetLessonFolderInUserDrive?.lessonDriveId,
          gDriveAccessToken,
          gDriveRefreshToken,
          clientOrigin
        );
        doesTargetGDriveUnitFolderExist =
          "id" in targetLessonsFolder &&
          !!targetLessonsFolder.id &&
          !targetLessonsFolder.labels.trashed;
      }

      let doesTargetGDriveLessonFolderExist = false;

      if (targetLessonFolderInUserDrive?.lessonDriveId) {
        const gdriveItem = await getGDriveItem(
          targetLessonFolderInUserDrive?.lessonDriveId,
          gDriveAccessToken,
          gDriveRefreshToken,
          clientOrigin
        );
        doesTargetGDriveLessonFolderExist = "id" in gdriveItem && !!gdriveItem.id && gdriveItem.labels.trashed
      }

      //TODO: will check if the target unit folder was trashed. If it is, then recreate it
      

      if (unitDriveId && !doesTargetGDriveUnitFolderExist) {
        console.log(
          "The target unit folder does not exist, will delete from db"
        );

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

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
        console.log(
          "The target lesson folder does not exist, will delete from db"
        );
        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }
        
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

      // if the unit folder doesn't exist, then create the structure of the target unit folder and copy the file items into the
      // corresponding lesson folder
      if (
        !doesTargetGDriveUnitFolderExist &&
        !doesTargetGDriveLessonFolderExist
      ) {
        console.log(
          `The target unit folder and its corresponding lesson folder do not exist, creating them...`
        );
        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }
        const drive = await createDrive();

        sendMessage(response, {
          msg: `Creating the '${reqQueryParams.unitName}' unit folder...`,
        });

        const lessonFolderId = await createUnitFolder(
          {
            sharedGDriveId: reqQueryParams.unitSharedGDriveId,
            name: reqQueryParams.unitName,
            id: reqQueryParams.unitId,
          },
          {
            id: reqQueryParams.lessonId,
            sharedGDriveId: reqQueryParams.lessonSharedGDriveFolderId,
          },
          gDriveAccessToken,
          gpPlusFolderId,
          gDriveRefreshToken,
          clientOrigin,
          email,
          _allUnitLessons
        );

        sendMessage(response, {
          msg: `'${reqQueryParams.unitName}' unit folder created.`,
        });

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }
        const copyItemsParentFolder = await updatePermissionsForSharedFileItems(
          drive,
          email,
          reqQueryParams.fileIds
        );
        parentFolder = {
          id: copyItemsParentFolder.id,
          permissionId: copyItemsParentFolder.permissionId,
        };

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

        sendMessage(response, {
          filesToCopy: reqQueryParams.fileIds.length,
        });

        sendMessage(response, {
          didRetrieveAllItems: true,
        });

        const wasSuccessful = await copyFiles(
          reqQueryParams.fileIds,
          email,
          drive,
          gDriveAccessToken,
          lessonFolderId,
          gDriveRefreshToken,
          clientOrigin,
          reqQueryParams.fileNames,
          (data, willEndStream, delayMsg) => {
            sendMessage(response, data, willEndStream, delayMsg);
          },
          _lessonsFolder.name!,
          reqQueryParams.unitName!
        );

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

        const lessonDriveIdUpdatedResult = await updateUserCustom(
          { email },
          {
            $push: {
              "unitGDriveLessons.$[unitGDriveLessonsObj].lessonDriveIds": {
                lessonDriveId: lessonFolderId,
                lessonNum: reqQueryParams.lessonId,
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

        sendMessage(response, {
          isJobDone: true,
          wasSuccessful,
          targetFolderId: lessonFolderId,
        });
        return;
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

        // todo: BUG OCCURING
        const clientOrigin = new URL(request.headers.referer ?? "").origin;
        const unitFolderChildItems = await getUserChildItemsOfFolder(
          unitDriveId!,
          gDriveAccessToken,
          gDriveRefreshToken,
          clientOrigin
        );

        if (!unitFolderChildItems || !unitFolderChildItems.files?.length) {
          throw new CustomError("Lessons folder data is missing.", 500);
        }

        let lessonsFolderId: string | null = null;
        const lessonsFolder = unitFolderChildItems.files.find((file) => {
            if (
              file.appProperties &&
              ORIGINAL_ITEM_ID_FIELD_NAME in file.appProperties &&
              typeof file.appProperties[ORIGINAL_ITEM_ID_FIELD_NAME] ===
                "string"
            ) {
              return (
                file.appProperties[ORIGINAL_ITEM_ID_FIELD_NAME] ===
                _lessonsFolder!.sharedGDriveId
              );
            }

            return false;
          });

        console.log("unitFolderChildItems: ", unitFolderChildItems);
        console.log("lessonsFolder, yo there: ", lessonsFolder);

        if (lessonsFolder && lessonsFolder.id && !lessonsFolder.trashed) {
          console.log(
            `The child items of the target folder with id ${unitDriveId} exist.`
          );

          console.log("lessonsFolder: ", lessonsFolder);
          lessonsFolderId = lessonsFolder.id;
        } else {
          console.log(`The lessons folder doesn't exist. Will create it.`);

          if (!isStreamOpen) {
            throw new CustomError("The stream has ended.", 500);
          }

          const folderCreationResult = await createGDriveFolder(
            _lessonsFolder.name!,
            gDriveAccessToken,
            [unitDriveId!],
            3,
            gDriveRefreshToken,
            clientOrigin,
            {
              [ORIGINAL_ITEM_ID_FIELD_NAME]:
                _lessonsFolder.sharedGDriveId ?? null,
            }
          );
          console.log("folderCreationResult: ", folderCreationResult);
          lessonsFolderId = folderCreationResult.folderId ?? null;
        }

        console.log(`The id of the lessons folder is: ${lessonsFolderId}`);

        if (!lessonsFolderId) {
          throw new Error(
            `Failed to create the lessons folder with the name ${_lessonsFolder.name} in the unit folder with id ${unitDriveId}.`
          );
        }

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

        sendMessage(response, {
          msg: `Creating '${reqQueryParams.lessonSharedDriveFolderName}' folder...`,
        });

        const targetLessonFolderCreationResult = await createGDriveFolder(
          reqQueryParams.lessonSharedDriveFolderName,
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
            `Failed to create the lesson folder ${reqQueryParams.lessonSharedDriveFolderName} into the target unit folder with id ${unitDriveId}.`
          );
        }

        sendMessage(response, {
          msg: `The '${reqQueryParams.lessonSharedDriveFolderName}' folder was created.`,
        });

        console.log("The target lesson folder was created successfully.");

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

        const userUpdateResults = await updateUserCustom(
          { email },
          {
            $push: {
              "unitGDriveLessons.$[elem].lessonDriveIds": {
                lessonDriveId: targetLessonFolderCreationResult.folderId,
                lessonNum: reqQueryParams.lessonId,
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
            `The lesson folder ${reqQueryParams.lessonSharedDriveFolderName} was successfully added to the unit folder with id ${unitDriveId}.`
          );
        } else {
          console.error(
            `Failed to add the lesson folder ${reqQueryParams.lessonSharedDriveFolderName} to the unit folder with id ${unitDriveId}.`
          );
        }

        const drive = await createDrive();
        // make the target shared drive files read only to prevent writes during the copy operation

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

        const copyItemsParentFolder = await updatePermissionsForSharedFileItems(
          drive,
          email,
          reqQueryParams.fileIds
        );
        parentFolder = {
          id: copyItemsParentFolder.id,
          permissionId: copyItemsParentFolder.permissionId,
        };

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

        sendMessage(response, {
          filesToCopy: reqQueryParams.fileIds.length,
        });

        sendMessage(response, {
          didRetrieveAllItems: true,
        });

        sendMessage(response, {
          msg: "Copying lesson files...",
        });

        const wasSuccessful = await copyFiles(
          reqQueryParams.fileIds,
          email,
          drive,
          gDriveAccessToken,
          targetLessonFolderCreationResult.folderId,
          gDriveRefreshToken,
          clientOrigin,
          reqQueryParams.fileNames,
          (data, willEndStream, delayMsg) => {
            sendMessage(response, data, willEndStream, delayMsg);
          },
          _lessonsFolder.name!,
          reqQueryParams.unitName!
        );

        sendMessage(response, {
          isJobDone: true,
          wasSuccessful,
          targetFolderId: targetLessonFolderCreationResult.folderId,
        });

        return;
      }

      if (doesTargetGDriveLessonFolderExist) {
        console.log(
          `The target lesson folder with id ${
            targetLessonFolderInUserDrive!.lessonDriveId
          } already exists, so we will just copy the items into it.`
        );
        const clientOrigin = new URL(request.headers.referer ?? "").origin;
        const drive = await createDrive();

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

        sendMessage(response, {
          msg: "Copying lesson files...",
        });

        // make the target shared drive files read only to prevent writes during the copy operation
        const copyItemsParentFolder = await updatePermissionsForSharedFileItems(
          drive,
          email,
          reqQueryParams.fileIds
        );
        parentFolder = {
          id: copyItemsParentFolder.id,
          permissionId: copyItemsParentFolder.permissionId,
        };

        if (!isStreamOpen) {
          throw new CustomError("The stream has ended.", 500);
        }

        sendMessage(response, {
          filesToCopy: reqQueryParams.fileIds.length,
        });

        sendMessage(response, {
          didRetrieveAllItems: true,
        });

        sendMessage(response, {
          msg: "Copying lesson files...",
        });

        const wasSuccessful = await copyFiles(
          reqQueryParams.fileIds,
          email,
          drive,
          gDriveAccessToken,
          targetLessonFolderInUserDrive!.lessonDriveId,
          gDriveRefreshToken,
          clientOrigin,
          reqQueryParams.fileNames,
          (data, willEndStream, delayMsg) => {
            sendMessage(response, data, willEndStream, delayMsg);
          },
          _lessonsFolder.name!,
          reqQueryParams.unitName!
        );

        sendMessage(response, {
          isJobDone: true,
          wasSuccessful,
          targetFolderId: targetLessonFolderInUserDrive!.lessonDriveId,
        });

        return;
      }
    }

    if (!gpPlusFolderId) {
      const clientOrigin = new URL(request.headers.referer ?? "").origin;
      console.log("will create the gp plus unit folder");
      console.log("gDriveAccessToken: ", gDriveAccessToken);

      if (!isStreamOpen) {
        throw new CustomError("The stream has ended.", 500);
      }

      sendMessage(response, {
        msg: "Creating the 'My GP+ Units' folder...",
      });

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

      sendMessage(response, {
        msg: "The 'My GP+ Units' folder was successfully created.",
      });

      gpPlusFolderId = gpPlusFolderCreationResult.folderId;

      if (!isStreamOpen) {
        throw new CustomError("The stream has ended.", 500);
      }

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

    if (!isStreamOpen) {
      throw new CustomError("The stream has ended.", 500);
    }

    sendMessage(response, {
      msg: `Creating '${reqQueryParams.unitName}' folder...`,
    });

    const targetUnitFolderCreation = await createGDriveFolder(
      reqQueryParams.unitName,
      gDriveAccessToken,
      [gpPlusFolderId],
      3,
      gDriveRefreshToken,
      clientOrigin
    );

    console.log("targetUnitFolderCreation: ", targetUnitFolderCreation);

    if (!targetUnitFolderCreation.folderId) {
      throw new CustomError(
        `Error creating the folder for unit ${reqQueryParams.unitName}. Reason: ${targetUnitFolderCreation.errMsg}`,
        500
      );
    }

    sendMessage(response, {
      msg: `'${reqQueryParams.unitName}' folder was created.`,
    });

    let unitGDriveLesson = {
      unitDriveId: targetUnitFolderCreation.folderId,
      unitId: reqQueryParams.unitId,
    } as IUnitGDriveLesson;

    console.log("unitGDriveLesson: ", unitGDriveLesson);

    if (!isStreamOpen) {
      throw new CustomError("The stream has ended.", 500);
    }

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

    console.log(`reqQueryParams.unit.id: ${reqQueryParams.unitSharedGDriveId}`);

    const drive = await createDrive();
    const gdriveResponse = await drive.files.list({
      corpora: "drive",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      driveId: process.env.GOOGLE_DRIVE_ID,
      q: `'${reqQueryParams.unitSharedGDriveId}' in parents`,
      fields: "*",
    });

    if (!gdriveResponse.data?.files) {
      throw new CustomError(
        "Failed to get the root items of the target unit folder.",
        500
      );
    }

    let allChildItems = await getFolderChildItems(gdriveResponse.data.files);
    const targetLessonFolderInSharedDrive = allChildItems.find((folder) => {
      return folder.id === reqQueryParams.lessonSharedGDriveFolderId;
    });

    console.log(
      "targetLessonFolderInSharedDrive, java: ",
      targetLessonFolderInSharedDrive
    );

    if (!targetLessonFolderInSharedDrive?.id) {
      throw new CustomError(
        "The target lesson folder was not found in the target unit folder.",
        400
      );
    }

    console.log("allChildItems: ", allChildItems);

    allChildItems = allChildItems.filter((item) => {
      if (
        targetLessonFolderInSharedDrive.id &&
        item.id &&
        item.parentFolderId === targetLessonFolderInSharedDrive.parentFolderId
      ) {
        return targetLessonFolderInSharedDrive.id === item.id;
      }

      return item.id;
    });

    const selectedClientLessonName = reqQueryParams.lessonName.toLowerCase();
    // create the folder structure in the user's google drive
    console.log("selectedClientLessonName: ", selectedClientLessonName);

    if (!isStreamOpen) {
      throw new CustomError("The stream has ended.", 500);
    }

    sendMessage(response, {
      msg: "Creating the unit folder...",
    });

    const targetFolderStructureArrInUserDrive = await createFolderStructure(
      allChildItems,
      gDriveAccessToken,
      targetUnitFolderCreation.folderId,
      gDriveRefreshToken,
      clientOrigin
    );
    console.log(
      "targetFolderStructureArrInUserDrive, yo there: ",
      targetFolderStructureArrInUserDrive
    );
    const targetLessonFolderInUserDrive =
      targetFolderStructureArrInUserDrive.find((folder) => {
        return (
          folder.originalFileId &&
          reqQueryParams.lessonSharedGDriveFolderId &&
          folder.originalFileId === reqQueryParams.lessonSharedGDriveFolderId
        );
      });

    console.log(
      "targetLessonFolderInUserDrive, hey there: ",
      targetLessonFolderInUserDrive
    );

    if (!targetLessonFolderInUserDrive?.id || !targetLessonFolderInUserDrive) {
      throw new CustomError(
        `The lesson named ${selectedClientLessonName} does not exist in the unit ${reqQueryParams.unitName}.`,
        400
      );
    }

    const totalFoldersToCreate = targetFolderStructureArrInUserDrive.filter(
      (item) => {
        return item.mimeType?.includes("folder");
      }
    );

    sendMessage(response, {
      msg: `${totalFoldersToCreate.length} folders were created.`,
    });

    console.log(
      `The target lesson folder with the name ${selectedClientLessonName} was found with the id ${targetLessonFolderInUserDrive.id}`
    );

    const allUnitLessonFolders: ILessonGDriveId[] = [];

    for (const folderSubItemInUserDrive of targetFolderStructureArrInUserDrive) {
      if (
        targetLessonFolderInUserDrive.id &&
        folderSubItemInUserDrive.originalFileId ===
          targetLessonFolderInUserDrive.originalFileId
      ) {
        console.log(
          `The lesson named ${selectedClientLessonName} was found in the unit ${reqQueryParams.unitName}.`
        );
        allUnitLessonFolders.push({
          lessonDriveId: targetLessonFolderInUserDrive.id,
          lessonNum: reqQueryParams.lessonId,
          lessonSharedGDriveFolderId: reqQueryParams.lessonSharedGDriveFolderId,
        });
        break;
      }
    }

    console.log("allUnitLessonFolders after find loop: ", allUnitLessonFolders);

    if (!isStreamOpen) {
      throw new CustomError("The stream has ended.", 500);
    }

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

    console.log(
      "targetFolderStructureArrInUserDrive, yo there: ",
      targetFolderStructureArrInUserDrive
    );
    // get the parent folder id of the files to copy
    const parentFolderId = (
      await drive.files.get({
        fileId: reqQueryParams.fileIds[0],
        fields: "*",
        supportsAllDrives: true,
      })
    ).data?.parents?.[0];

    console.log("parentFolderId: ", parentFolderId);

    if (!parentFolderId) {
      throw new CustomError("The file does not have a parent folder.", 500);
    }

    console.log("Will share the parent folder with the target user.");

    const result = await shareFileWithUser(parentFolderId, email);

    console.log("share result: ", result);

    if (!isStreamOpen) {
      throw new CustomError("The stream has ended.", 500);
    }

    console.log("shared target folder with user, will wait...");

    await sleep(1_500);

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

    parentFolder = { id: parentFolderId, permissionId: targetPermission.id };

    console.log("Will update the permission of the target file.");

    // allow the user to programmatically copy the files by changing to the target role below

    if (!isStreamOpen) {
      throw new CustomError("The stream has ended.", 500);
    }

    // make the target files read only
    for (const fileId of reqQueryParams.fileIds) {
      console.log("Copying file: ", fileId);
      // @ts-ignore
      const fileUpdated = await drive.files.update({
        fileId,
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

    sendMessage(response, {
      filesToCopy: reqQueryParams.fileIds.length,
    });
    sendMessage(response, {
      didRetrieveAllItems: true,
    });
    sendMessage(response, {
      msg: "Will copy all files...",
    });

    let wasJobSuccessful = true;

    console.log(
      "Made the target file read only and changed the target user's permission to writer. Will copy files."
    );

    // check if the permission were propagated to all of the files to copy
    for (const fileIdIndex in reqQueryParams.fileIds) {
      const fileId = reqQueryParams.fileIds[fileIdIndex];
      const permission = await getTargetUserPermission(fileId, email, drive);

      console.log("permission, sup there: ", permission);

      if (!permission?.role) {
        continue;
      }

      let userUpdatedRole = permission?.role;
      let tries = 7;

      console.log(`userUpdatedRole: ${userUpdatedRole}`);

      console.log(
        "Made the target file read only and changed the target user's permission to writer."
      );

      while (!VALID_WRITABLE_ROLES.has(userUpdatedRole)) {
        console.log(`tries: ${tries}`);
        console.log(`userUpdatedRole: ${userUpdatedRole}`);

        if (tries <= 0) {
          console.error(
            "Reached max tries. Failed to update the target user's permission."
          );

          continue;
        }

        await waitWithExponentialBackOff(tries);

        const permission = await getTargetUserPermission(fileId, email, drive);

        if (permission?.role) {
          userUpdatedRole = permission?.role;
        }

        tries -= 1;
      }

      console.log(`The role of the user is: ${userUpdatedRole}`);

      console.log("The user's role was updated.");

      console.log(`Will copy file: ${fileId}`);

      if (!isStreamOpen) {
        throw new CustomError("The stream has ended.", 500);
      }

      const fileCopyResult = await copyGDriveItem(
        gDriveAccessToken,
        [targetLessonFolderInUserDrive.id],
        fileId,
        gDriveRefreshToken,
        clientOrigin
      );

      console.log("fileCopyResult: ", fileCopyResult);

      if (
        "id" in fileCopyResult &&
        fileCopyResult.id &&
        reqQueryParams.fileNames[fileIdIndex]
      ) {
        console.log(
          `Successfully copied file ${reqQueryParams.fileNames[fileIdIndex]}`
        );
        sendMessage(response, {
          fileCopied: reqQueryParams.fileNames[fileIdIndex],
        });
      } else if (
        reqQueryParams.fileNames[fileIdIndex] &&
        fileCopyResult?.errType
      ) {
        wasJobSuccessful = false;
        console.error(
          `Failed to copy file '${reqQueryParams.fileNames[fileIdIndex]}' for user with email ${email}. Reason: `,
          fileCopyResult
        );
        sendMessage(response, {
          failedCopiedFile: reqQueryParams.fileNames[fileIdIndex],
        });

        // Log failed copy to Excel
        const lessonFolderLink = `https://drive.google.com/drive/folders/${targetLessonFolderInUserDrive.id}`;
        const fileLink = `https://drive.google.com/file/d/${fileId}/view`;

        const errorType =
          "errType" in fileCopyResult &&
          typeof fileCopyResult.errType === "string"
            ? fileCopyResult.errType
            : "unknown";
        const errorMessage =
          "errMsg" in fileCopyResult &&
          typeof fileCopyResult.errMsg === "string"
            ? fileCopyResult.errMsg
            : JSON.stringify(fileCopyResult);

        await logFailedFileCopyToExcel({
          lessonName: reqQueryParams.lessonName || "Unknown",
          unitName: reqQueryParams.unitName || "Unknown",
          lessonFolderLink,
          fileName: reqQueryParams.fileNames[fileIdIndex],
          fileLink,
          errorType,
          errorMessage,
          timestamp: new Date().toISOString(),
          userEmail: email,
        });
      }
    }
    console.log("targetLessonFolder.id, java: ", targetLessonFolderInUserDrive);

    sendMessage(response, {
      isJobDone: true,
      wasSuccessful: wasJobSuccessful,
      targetFolderId: targetLessonFolderInUserDrive.id,
    });
    // TODO: if user.gpPlusDriveFolderId does not exist in the drive, then delete gpPlusDriveFolderId and the unitGDriveLessons
  } catch (error: any) {
    const { message, code } = error ?? {};

    console.error(`Error message: ${message}`);
    console.error(`Error code: ${code}`);
    console.error("Error: ");
    console.dir(error);
    console.log("error?.response?.data: ", error?.response?.data);

    sendMessage(response, {
      isJobDone: true,
      wasSuccessful: false,
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
    }

    if (reqQueryParams.fileIds) {
      console.log("Making all file readable...");
      for (const fileId of reqQueryParams.fileIds) {
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
      }
    }

    wasUserRolesAndFileMetaDataReseted = true;
  }
}
