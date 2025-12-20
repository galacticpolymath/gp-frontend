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

interface IQueryParams {
  unitId: string;
  lessonNumIds: string[];
  grades?: string;
}

type TGetUserChildItemsOfFolderParams = Parameters<typeof getUserChildItemsOfFolder>

/**The key will be the original id of the lesson item found in GP's Google Drive*/
type TUserLessonItemsLatestVersion = Map<string, { userGDriveItemCopyId: string, createdTimeMs: number }>

const getAllUserItemsOfLessons = async (
  lessonFolderIds: string[],
  gdriveAccessToken: TGetUserChildItemsOfFolderParams[1],
  gdriveRefreshToken: TGetUserChildItemsOfFolderParams[2],
  clientOrigin: TGetUserChildItemsOfFolderParams[3],
) => {
  //TODO: this fn will get all of the items for each lesson and will get the latest version of each item
  try {

    const userLessonItemsLatestVersion = new Map();
    let lessonItems: drive_v3.Schema$File[] = [];
    const retrieveLessonItems = await Promise.all(lessonFolderIds.flatMap(async lessonFolderId => {
      const childItems = await getAllChildItemsOfFolder(lessonFolderId, gdriveAccessToken, gdriveRefreshToken, clientOrigin, 3)

      return childItems?.files ?? null;
    }));

    if (retrieveLessonItems.includes(null)) {

      return null;
    }
  } catch (error) {
    console.error('Error in getAllUserItemsOfLessons: ', error);
  }
}

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

  const { lessonNumIds, unitId, grades } =
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

    if (!lessonIds.every((id) => typeof id === 'string')) {
      console.log('Error: All lessonNumIds must be strings');

      return response
        .status(400)
        .json({ error: 'All lessonNumIds must be strings' });
    }

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

    const queriedGDriveItemResults = await Promise.all(
      targetUnitGDriveLessonObj.lessonDriveIds.map(
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
    );
    const existingLessonFolderGDriveIds =
      queriedGDriveItemResults.filter(Boolean);

    console.log(
      'existingLessonFolderGDriveIds: ',
      existingLessonFolderGDriveIds
    );

    return response.json(existingLessonFolderGDriveIds);
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
