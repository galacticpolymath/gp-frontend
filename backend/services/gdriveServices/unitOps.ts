import { CustomError } from '../../utils/errors';
import { ILessonGDriveId, IUnitGDriveLesson } from '../../models/User/types';
import { INewUnitLesson } from '../../models/Unit/types/teachingMaterials';
import {
  addNewGDriveLessons,
  createDbArrFilter,
  getUserByEmail,
  updateUserCustom,
} from '../userServices';
import { createDrive } from './driveClients';
import { getDriveListScopeParams } from './shared';
import { createFolderStructure, createGDriveFolder, getFolderChildItems } from './folderOps';

export const createUnitFolder = async (
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
  allUnitLessons: NonNullable<Pick<INewUnitLesson, 'allUnitLessons'>['allUnitLessons']>,
  gradesRange: string,
  userGmail: string
) => {
  const targetUnitFolderCreation = await createGDriveFolder(
    unit.name,
    gDriveAccessToken,
    [gpPlusFolderId],
    3,
    clientOrigin,
    gDriveRefreshToken
  );

  console.log('targetUnitFolderCreation: ', targetUnitFolderCreation);

  if (!targetUnitFolderCreation.folderId) {
    throw new CustomError(
      `Error creating the folder for unit ${unit.name}. Reason: ${targetUnitFolderCreation.errMsg}`,
      500
    );
  }

  const unitGDriveLesson: IUnitGDriveLesson = {
    unitDriveId: targetUnitFolderCreation.folderId,
    unitId: unit.id,
    gmail: userGmail,
  };
  const userUpdatedWithNewUnitObjResult = await updateUserCustom(
    { email },
    {
      $push: {
        unitGDriveLessons: unitGDriveLesson,
      },
    }
  );

  if (!userUpdatedWithNewUnitObjResult.wasSuccessful) {
    console.error(
      'Failed to update user with new unit lessons object. Error message: ',
      userUpdatedWithNewUnitObjResult.errMsg
    );
  } else {
    console.log('User was updated with new unit lessons object. New unit lessons object: ');
  }

  console.log('Will get the target folder structure.');
  console.log(`reqQueryParams.unit.id: ${unit.sharedGDriveId}`);

  const drive = await createDrive();
  const gdriveResponse = await drive.files.list({
    ...getDriveListScopeParams(),
    q: `'${unit.sharedGDriveId}' in parents`,
    fields: '*',
  });

  if (!gdriveResponse.data?.files) {
    throw new CustomError('Failed to get the root items of the target unit folder.', 500);
  }

  let allChildItems = await getFolderChildItems(gdriveResponse.data.files);
  const targetLessonFolderInSharedDrive = allChildItems.find((item) => {
    return item.id === lesson.sharedGDriveId;
  });

  console.log('targetLessonFolderInSharedDrive: ', targetLessonFolderInSharedDrive);

  if (!targetLessonFolderInSharedDrive) {
    throw new CustomError(
      `The lesson folder with ID ${lesson.sharedGDriveId} was not found in the unit ${unit.name}.`,
      404
    );
  }

  console.log(
    'allChildItems, will get the all of the lesson folder ids before filter: ',
    allChildItems.length
  );

  allChildItems = allChildItems.filter((item) => {
    if (item.id && item.parentFolderId === targetLessonFolderInSharedDrive.parentFolderId) {
      return targetLessonFolderInSharedDrive.id === item.id;
    }

    return item.id === targetLessonFolderInSharedDrive.parentFolderId;
  });

  console.log(
    'allChildItems, will get the all of the lesson folder ids after filter: ',
    allChildItems.length
  );

  console.log('allChildItems: ', allChildItems);

  const selectedClientLessonName = unit.name.toLowerCase();
  const targetFolderStructureArr = await createFolderStructure(
    allChildItems,
    gDriveAccessToken,
    targetUnitFolderCreation.folderId,
    gDriveRefreshToken,
    clientOrigin
  );

  console.log('lesson.sharedGDriveId: ', lesson.sharedGDriveId);
  console.log('targetFolderStructureArr: ', targetFolderStructureArr);

  const targetLessonFolder = targetFolderStructureArr.find((folder) => {
    return folder.originalFileId === lesson.sharedGDriveId;
  });

  console.log('targetLessonFolder, java: ', targetLessonFolder);

  if (!targetLessonFolder?.id) {
    throw new CustomError(
      `The lesson named ${selectedClientLessonName} does not exist in the unit ${unit.name}.`,
      400
    );
  }

  const allUnitLessonFolders: ILessonGDriveId[] = [];

  console.log('allUnitLessonFolders length: ', allUnitLessonFolders.length);

  for (const folderSubItem of targetFolderStructureArr) {
    const targetUnitLesson = allUnitLessons.find(
      (unitLesson) => unitLesson.sharedGDriveId === folderSubItem.originalFileId
    );

    if (
      targetUnitLesson &&
      folderSubItem.id &&
      folderSubItem.originalFileId === targetLessonFolder.originalFileId
    ) {
      console.log('Found the target lesson folder. Will update the user with the new lesson drive id.');
      allUnitLessonFolders.push({
        lessonDriveId: folderSubItem.id,
        lessonNum: targetUnitLesson.id,
        lessonSharedGDriveFolderId: targetUnitLesson.sharedGDriveId,
        gradesRange: gradesRange,
      });
      break;
    }
  }

  console.log('allUnitLessonFolders after updates: ', allUnitLessonFolders.length);

  const lessonDriveIdUpdatedResult = await updateUserCustom(
    { email },
    {
      $push: {
        'unitGDriveLessons.$[elem].lessonDriveIds': {
          $each: allUnitLessonFolders,
        },
      },
    },
    {
      upsert: true,
      arrayFilters: [{ 'elem.unitDriveId': targetUnitFolderCreation.folderId }],
    }
  );

  if (!lessonDriveIdUpdatedResult.wasSuccessful) {
    console.log(
      'Failed to update the target user with the new lesson drive id. Reason: ',
      lessonDriveIdUpdatedResult.errMsg
    );
  } else {
    console.log('Successfully updated the target user with the new lesson drive id.');
  }

  return targetLessonFolder.id;
};

export const addNewGDriveLessonToTargetUser = async (
  email: string,
  lessonGDriveIds: ILessonGDriveId[],
  unit: Omit<IUnitGDriveLesson, 'lessonDriveIds'>
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
            arrayFilters: [createDbArrFilter('elem.unitDriveId', unit.unitDriveId)],
            upsert: true,
          }
        : {
            upsert: true,
          }
    );

    return lessonDriveIdUpdatedResult;
  } catch (error) {
    console.error('Error in addNewGDriveLessonToTargetUser: ', error);

    return {
      wasSuccessful: false,
    };
  }
};
