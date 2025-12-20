import { NextApiRequest, NextApiResponse } from 'next';
import { getJwtPayloadPromise } from '../../../nondependencyFns';
import {
  getUserByEmail,
  updateUserCustom,
} from '../../../backend/services/userServices';
import {
  getAllChildItemsOfFolder,
  getGDriveItem,
  getUserChildItemsOfFolder,
} from '../../../backend/services/gdriveServices';
import { drive_v3 } from 'googleapis';
import { ILessonGDriveId } from '../../../backend/models/User/types';
import { TUserGDriveData } from '../../../components/LessonSection/TeachIt/TeachItUI';

interface IQueryParams {
  unitId: string;
  lessonNumIds: string[] | string;
  grades?: string;
  lessonItemIds: string[] | string
}

type TGetUserChildItemsOfFolderParams = Parameters<typeof getUserChildItemsOfFolder>

/**The key will be the original id of the lesson item found in GP's Google Drive*/
type TUserLessonItemsLatestVersion = Map<string, { userGDriveItemCopyId: string, createdTimeMs: number }>
export type TLatestUserGDriveItemOfLesson = NonNullable<Awaited<ReturnType<typeof getAllLatestUserItemIdsOfLessonFolders>>>[number]

const getAllLatestUserItemIdsOfLessonFolders = async (
  lessonFolderIds: string[],
  gdriveAccessToken: TGetUserChildItemsOfFolderParams[1],
  gdriveRefreshToken: TGetUserChildItemsOfFolderParams[2],
  clientOrigin: TGetUserChildItemsOfFolderParams[3],
  lessonItemIdsFromGpGoogleDrive: Set<string>,
) => {
  try {
    const userLessonItemsLatestVersion: TUserLessonItemsLatestVersion = new Map();
    let retrieveLessonItemsResults = await Promise.all(lessonFolderIds.flatMap(async lessonFolderId => {
      const childItemsRetrievedResult = await getAllChildItemsOfFolder(lessonFolderId, gdriveAccessToken, gdriveRefreshToken, clientOrigin, 3)

      if ("didErr" in childItemsRetrievedResult) {
        return childItemsRetrievedResult
      }

      return childItemsRetrievedResult;
    }));

    for (const retrieveLessonItemResult of retrieveLessonItemsResults) {
      if ("didErr" in retrieveLessonItemResult && retrieveLessonItemResult.didErr && !retrieveLessonItemResult.doesFolderExist) {
        console.log('Lesson folder does not exist.');
        continue;
      };

      if ("didErr" in retrieveLessonItemResult) {
        throw new Error("Child items retrieval error: " + (retrieveLessonItemResult.errMsg ?? "unknown error"))
      };

      if (retrieveLessonItemResult?.files?.length) {
        for (const file of retrieveLessonItemResult.files) {
          const { appProperties, id, createdTime } = file;

          if (!id || !createdTime) {
            console.error('The "id" or the "createdTime" was found in the given file.');
            continue;
          }

          const originalGpGDriveItemId = appProperties?.originalGpGDriveItemId;

          if (originalGpGDriveItemId && lessonItemIdsFromGpGoogleDrive.has(originalGpGDriveItemId) && !userLessonItemsLatestVersion.has(originalGpGDriveItemId)) {
            const createdTimeMs = new Date(createdTime).getTime();
            userLessonItemsLatestVersion.set(originalGpGDriveItemId, { userGDriveItemCopyId: id, createdTimeMs })
            continue;
          }

          if (originalGpGDriveItemId && lessonItemIdsFromGpGoogleDrive.has(originalGpGDriveItemId) && userLessonItemsLatestVersion.has(originalGpGDriveItemId)) {
            const userLessonItemLatestVersion = userLessonItemsLatestVersion.get(originalGpGDriveItemId)!
            const currentLessonItemCreatedTimeMs = new Date(createdTime).getTime();

            if (currentLessonItemCreatedTimeMs > userLessonItemLatestVersion.createdTimeMs) {
              userLessonItemsLatestVersion.set(originalGpGDriveItemId, { userGDriveItemCopyId: id, createdTimeMs: currentLessonItemCreatedTimeMs })
            }
            continue;
          }
        }
      };
    };

    const latestUserItemIdsOfLessonFolders = userLessonItemsLatestVersion.entries().map(([originalLessonItemIdInGpGoogleDrive, { userGDriveItemCopyId }]) => {
      return {
        userGDriveItemCopyId, originalLessonItemIdInGpGoogleDrive
      }
    });

    return Array.from(latestUserItemIdsOfLessonFolders);
  } catch (error) {
    console.error('Error in "getAllLatestUserItemIdsOfLessonFolders" fn call: ', error);

    return null;
  }
}

const getUserLessonDriveFolders = async (lessonDriveIds: ILessonGDriveId[], grades: string, gdriveAccessToken: string, gdriveRefreshToken: string, clientOrigin: string, nonExistingLessonFolderIds: string[]) => {
  const userLessonDriveFoldersRetrievedPromises = lessonDriveIds.map(
    async (lessonDriveFolder) => {
      if (lessonDriveFolder.gradesRange !== grades) {
        return null;
      }

      const gdriveItem = await getGDriveItem(
        lessonDriveFolder.lessonDriveId,
        gdriveAccessToken,
        gdriveRefreshToken,
        clientOrigin
      );

      console.log('gdriveItem, sup there: ', gdriveItem);

      if (
        !('id' in gdriveItem && gdriveItem.id && !gdriveItem.labels.trashed)
      ) {
        nonExistingLessonFolderIds.push(lessonDriveFolder.lessonDriveId);
        return null;
      }

      return lessonDriveFolder;
    }
  )
  return await Promise.all(userLessonDriveFoldersRetrievedPromises);
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const nonExistingLessonFolderIds: string[] = [];
  let userEmail: string | null = null;

  console.log('request.query, get-gdrive-lessons-ids: ', request.query);

  // NOTES: 
  // -able to get all of the ids of the original lesson items 
  // -get the target lesson folder in the user's drive
  // -filter in the documents of the target lesson folder, by using the meta data of the documents that contains the original document id 
  // -filter in those documents by retrieving all of the document ids of all materials for the target lesson

  const { lessonNumIds, unitId, grades, lessonItemIds } =
    request.query as unknown as IQueryParams;

  try {
    if (!grades || typeof grades !== 'string') {
      console.log('grades query parameter is required');
      return response
        .status(400)
        .json({ error: "'grades' query parameter is required" });
    }

    if (!lessonNumIds) {
      console.log('lessonNumIds query parameter is required');
      return response
        .status(400)
        .json({ error: "'lessonNumIds' query parameter is required" });
    }

    if (!unitId || typeof unitId !== 'string') {
      console.log('unitId must be a string');
      return response
        .status(400)
        .json({ error: "'unitId' query parameter is required" });
    }

    const lessonIds = Array.isArray(lessonNumIds)
      ? lessonNumIds
      : [lessonNumIds];
    const lessonItemIdsArr = Array.isArray(lessonItemIds)
      ? lessonItemIds
      : [lessonItemIds];

    if (!lessonIds.every((id) => typeof id === 'string')) {
      console.log('Error: All lessonNumIds must be strings');

      return response
        .status(400)
        .json({ error: 'All lessonNumIds must be strings' });
    }

    if (!lessonItemIdsArr.every((id) => typeof id === 'string')) {
      console.log('Error: All lessonItemIdsArr must be strings');

      return response
        .status(400)
        .json({ error: 'All lessonItemIdsArr must be strings' });
    }

    const lessonItemsIdsOfGpGoogleDriveSet = new Set(lessonItemIdsArr);
    const authorization = request.headers.authorization;
    const gdriveAccessToken = request.headers['gdrive-token'];
    const gdriveRefreshToken = request.headers['gdrive-token-refresh'];
    const clientOrigin = new URL(request.headers.referer ?? '').href;

    if (!clientOrigin) {
      console.log('clientOrigin is required');

      return response.status(400).json({ error: 'clientOrigin is required' });
    }

    if (
      typeof gdriveAccessToken !== 'string' ||
      typeof gdriveRefreshToken !== 'string'
    ) {
      console.log('gdriveAccessToken or gdriveRefreshToken is required');

      return response.status(401).json({
        error: 'gdriveAccessToken and gdriveRefreshToken are BOTH required',
      });
    }

    if (!authorization) {
      console.log('Authorization header is required');

      return response
        .status(401)
        .json({ error: 'Authorization header is required' });
    }

    const { email } =
      (await getJwtPayloadPromise(authorization))?.payload ?? {};

    if (!email) {
      return response.status(401).json({ error: 'User is not authenticated' });
    }



    userEmail = email;
    const targetUser = await getUserByEmail(email, { unitGDriveLessons: 1 });

    console.log('targetUser: ', targetUser);

    if (!targetUser) {
      return response.status(404).json({ error: 'User is not found' });
    }

    if (!targetUser.unitGDriveLessons?.length) {
      console.log('Target user does not have any GP+ unit lessons');
      return response.json([]);
    }

    const targetUnitGDriveLessonObj = targetUser.unitGDriveLessons.find(
      (unitGDriveLessonObj) => {
        return unitGDriveLessonObj.unitId === unitId;
      }
    );

    console.log('targetUnitGDriveLessonObj: ', targetUnitGDriveLessonObj);

    if (!targetUnitGDriveLessonObj?.lessonDriveIds?.length) {
      console.log(
        'Target user does not have any GP+ lessons under the given unit'
      );
      return response.json([]);
    }

    console.log('gdriveAccessToken: ', gdriveAccessToken);

    const targetLessonDriveIds = targetUnitGDriveLessonObj.lessonDriveIds.map(lessonDriveObj => lessonDriveObj.lessonDriveId)
    const [queriedGDriveItemResults, latestUserItemIdsOfLessonFolders] = await Promise.all(
      [
        getUserLessonDriveFolders(targetUnitGDriveLessonObj.lessonDriveIds, grades, gdriveAccessToken, gdriveRefreshToken, clientOrigin, nonExistingLessonFolderIds),
        getAllLatestUserItemIdsOfLessonFolders(targetLessonDriveIds, gdriveAccessToken, gdriveRefreshToken, clientOrigin, lessonItemsIdsOfGpGoogleDriveSet)
      ]
    );
    const existingLessonFolderGDriveIds =
      queriedGDriveItemResults.filter(Boolean) as ILessonGDriveId[];

    console.log(
      'existingLessonFolderGDriveIds: ',
      existingLessonFolderGDriveIds
    );

    const resBody = {
      userGDriveItemIdsOfLessonFolder: latestUserItemIdsOfLessonFolders ?? [],
      userLessonFolderGDriveIds: existingLessonFolderGDriveIds
    } satisfies TUserGDriveData;

    return response.json(resBody);
  } catch (error: any) {
    console.error('Error in get-gdrive-lesson-ids:', error);

    return response.status(500).json({ error: 'Internal server error' });
  } finally {
    console.log('nonExistingLessonFolderIds: ', nonExistingLessonFolderIds);

    if (nonExistingLessonFolderIds?.length && userEmail && unitId) {
      console.log('will delete lesson folders from the database...');

      const targetLessonDeletionResult = await updateUserCustom(
        {
          email: userEmail,
        },
        {
          $pull: {
            'unitGDriveLessons.$[unitGDriveLessonsObj].lessonDriveIds': {
              lessonDriveId: {
                $in: nonExistingLessonFolderIds,
              },
            },
          },
        },
        {
          arrayFilters: [
            {
              'unitGDriveLessonsObj.unitId': unitId,
            },
          ],
        }
      );

      console.log(
        'targetLessonDeletionResult, yo: ',
        targetLessonDeletionResult
      );
    }
  }
}
