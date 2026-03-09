import { drive_v3 } from 'googleapis';
import axios from 'axios';
import { GoogleServiceAccountAuthCreds, refreshAuthToken } from '../googleDriveServices';
import { CustomError } from '../../utils/errors';
import { waitWithExponentialBackOff } from '../../../globalFns';
import {
  GDriveItem,
  ORIGINAL_ITEM_ID_FIELD_NAME,
  TUnitFolder,
  getCanRetry,
  getDriveListScopeParams,
} from './shared';
import { createDrive } from './driveClients';

/**
 * Create a folder in the user's Google Drive account.
 */
export const createGDriveFolder = async (
  folderName: string,
  accessToken: string,
  parentFolderIds: string[] = [],
  tries: number = 3,
  refreshToken?: string,
  reqOriginForRefreshingToken?: string,
  appProperties?: ConstructorParameters<typeof GDriveItem>['3']
): Promise<{
  wasSuccessful: boolean;
  folderId?: string;
  [key: string]: unknown;
}> => {
  try {
    const folderMetadata = new GDriveItem(
      folderName,
      parentFolderIds,
      'application/vnd.google-apps.folder',
      appProperties
    );
    const response = await axios.post(
      'https://www.googleapis.com/drive/v3/files?fields=id',
      folderMetadata,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status !== 200) {
      throw new CustomError(
        response.data ?? 'Failed to create a lesson folder.',
        response.status
      );
    }

    return { wasSuccessful: true, folderId: response.data.id };
  } catch (error: any) {
    console.error('Error object: ', error?.response?.data?.error);
    const errMsg = `Failed to create folder for the user. Reason: ${error?.response?.data?.error?.message}`;
    console.log('errMsg: ', errMsg);
    console.log('refreshToken: ', refreshToken);

    if (error?.response?.data?.error?.status === 'UNAUTHENTICATED') {
      console.log('Will refresh the auth token...');

      tries -= 1;

      console.log('the user is not authenticated: ', refreshToken);

      const refreshTokenRes =
        (await refreshAuthToken(refreshToken, reqOriginForRefreshingToken)) ?? {};
      const { accessToken } = refreshTokenRes;

      if (!accessToken) {
        throw new Error('Failed to refresh access token');
      }

      return await createGDriveFolder(
        folderName,
        accessToken,
        parentFolderIds,
        tries,
        refreshToken,
        reqOriginForRefreshingToken
      );
    }

    return {
      wasSuccessful: false,
      errMsg: errMsg,
      status: error?.response?.data?.error?.status,
    };
  }
};

export const getUserChildItemsOfFolder = async (
  folderId: string,
  gdriveAccessToken: string,
  gdriveRefreshToken: string,
  clientOrigin: string,
  tries = 3
): Promise<drive_v3.Schema$FileList | null> => {
  try {
    const { status, data } = await axios.get<drive_v3.Schema$FileList>(
      'https://www.googleapis.com/drive/v3/files',
      {
        headers: {
          Authorization: `Bearer ${gdriveAccessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          orderBy: 'name',
          q: `'${folderId}' in parents`,
          supportAllDrives: true,
          fields: '*',
        },
      }
    );

    if (status !== 200) {
      throw new Error(
        `Failed to get items in user's google drive. Status: ${status}. Data: ${data}`
      );
    }

    return data;
  } catch (error: any) {
    console.error("Failed to get items in user's google drive. Reason: ", error);

    const canRetryResult = await getCanRetry(error, gdriveRefreshToken, clientOrigin);

    console.log('canRetryResult: ', canRetryResult);
    console.log(`getUserChildItemsOfFolder tries: ${tries}`);

    if (canRetryResult.canRetry && tries > 0) {
      await waitWithExponentialBackOff(tries);

      return await getUserChildItemsOfFolder(
        folderId,
        canRetryResult.accessToken ?? gdriveAccessToken,
        gdriveRefreshToken,
        clientOrigin,
        tries - 1
      );
    }

    return null;
  }
};

export const getAllChildItemsOfFolder = async (
  folderId: string,
  gdriveAccessToken: string,
  gdriveRefreshToken: string,
  clientOrigin: string,
  tries = 3,
  currentChildItems: drive_v3.Schema$File[] = [],
  pageToken?: string
): Promise<
  drive_v3.Schema$FileList | { didErr: boolean; doesFolderExist?: boolean; errMsg?: string }
> => {
  try {
    const { status, data } = await axios.get<drive_v3.Schema$FileList>(
      'https://www.googleapis.com/drive/v3/files',
      {
        headers: {
          Authorization: `Bearer ${gdriveAccessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          orderBy: 'name',
          q: `'${folderId}' in parents`,
          supportAllDrives: true,
          fields: '*',
          pageToken,
        },
      }
    );

    if (status !== 200) {
      throw new Error(
        `Failed to get items in user's google drive. Status: ${status}. Data: ${data}`
      );
    }

    if (data.files?.length) {
      currentChildItems.push(...data.files);
    }

    if (data.nextPageToken) {
      return await getAllChildItemsOfFolder(
        folderId,
        gdriveAccessToken,
        gdriveRefreshToken,
        clientOrigin,
        tries,
        currentChildItems,
        data.nextPageToken
      );
    }

    return { ...data, files: currentChildItems };
  } catch (error: any) {
    console.error("Failed to get items in user's google drive. Reason: ", error);
    const errMsg = "Failed to get items in user's google drive. Reason: " + error;

    if (error?.response?.data?.error?.code === 404) {
      console.error(`Folder with ID ${folderId} does not exist or was not found`);
      return {
        didErr: true,
        doesFolderExist: false,
      };
    }

    const canRetryResult = await getCanRetry(error, gdriveRefreshToken, clientOrigin);

    console.log('canRetryResult: ', canRetryResult);
    console.log(`getUserChildItemsOfFolder tries: ${tries}`);

    if (canRetryResult.canRetry && tries > 0) {
      await waitWithExponentialBackOff(tries);

      return await getAllChildItemsOfFolder(
        folderId,
        canRetryResult.accessToken ?? gdriveAccessToken,
        gdriveRefreshToken,
        clientOrigin,
        tries - 1
      );
    }

    return {
      didErr: true,
      errMsg,
    };
  }
};

export const getFolderChildItems = async (rootDriveFolders: drive_v3.Schema$File[]) => {
  const drive = await createDrive();
  const unitFolders: TUnitFolder[] = rootDriveFolders.map((folder) => ({
    name: folder.name,
    id: folder.id,
    mimeType: folder.mimeType,
    pathToFile: '',
  }));

  // get all of the folders of the target unit folder
  for (const unitFolder of unitFolders) {
    const parentFolderAlternativeName =
      'alternativeName' in unitFolder ? unitFolder.alternativeName : '';

    if (
      unitFolder?.mimeType?.includes('folder') &&
      unitFolder.pathToFile &&
      unitFolder.pathToFile !== ''
    ) {
      const { data } = await drive.files.list({
        ...getDriveListScopeParams(),
        q: `'${unitFolder.id}' in parents`,
      });

      if (!data.files) {
        continue;
      }

      const folders = data?.files.filter((file) => file?.mimeType?.includes('folder'));
      let foldersOccurrenceObj:
        | (drive_v3.Schema$File & { [key: string]: any })
        | null = null;

      if (folders.length) {
        foldersOccurrenceObj = folders.reduce((allFoldersObj, folderA, _, self) => {
          const foldersWithTheSameName = self.filter(
            (folderB) => folderA.name === folderB.name
          );

          if (!folderA.name) {
            return allFoldersObj;
          }

          const _allFoldersObj = {
            ...allFoldersObj,
            [folderA.name]: foldersWithTheSameName,
          };

          return _allFoldersObj;
        }, {} as drive_v3.Schema$File & { [key: string]: string });
      }

      const childFolderAndFilesOfFolder = data.files.map((file) => {
        if (
          !file?.mimeType?.includes('folder') ||
          !foldersOccurrenceObj ||
          (file.name &&
            (!foldersOccurrenceObj?.[file.name] ||
              foldersOccurrenceObj?.[file.name]?.length === 1))
        ) {
          console.log('The file retrieved from the server: ', file);

          return {
            ...file,
            name: file.name,
            id: file.id,
            mimeType: file.mimeType,
            parentFolderId: unitFolder.id,
            pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`,
            parentFolderAlternativeName,
          };
        }

        if (!file.name) {
          return null;
        }

        const targetFolderOccurrences = foldersOccurrenceObj[file.name];
        const targetFolder = targetFolderOccurrences.find(
          (folder: { id: string }) => folder.id === file.id
        );

        return {
          ...file,
          name: file.name,
          id: file.id,
          mimeType: file.mimeType,
          folderAlternativeName: targetFolder.alternativeName,
          parentFolderId: unitFolder.id,
          pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`,
          parentFolderAlternativeName,
        };
      });

      const _childFolderAndFilesOfFolder = childFolderAndFilesOfFolder.filter(
        Boolean
      ) as typeof unitFolders;

      unitFolders.push(..._childFolderAndFilesOfFolder);
      continue;
    }

    if (unitFolder?.mimeType?.includes('folder')) {
      const folderDataResponse = await drive.files.list({
        ...getDriveListScopeParams(),
        q: `'${unitFolder.id}' in parents`,
      });

      if (!folderDataResponse || !folderDataResponse?.data?.files) {
        continue;
      }

      const folders = folderDataResponse?.data?.files.filter((file) =>
        file?.mimeType?.includes('folder')
      );
      let foldersOccurrenceObj = null;

      if (folders.length) {
        foldersOccurrenceObj = folders.reduce((allFoldersObj, folderA, _, self) => {
          const foldersWithTheSameName = self.filter(
            (folderB) => folderA.name === folderB.name
          );

          if (!folderA.name) {
            return allFoldersObj;
          }

          return {
            ...allFoldersObj,
            [folderA.name]: foldersWithTheSameName,
          };
        }, {});

        // if a folder has duplicate names, give it a alternative name in order to differentiate it from the rest of the folders
        for (const folderNameAndOccurrences of Object.entries(foldersOccurrenceObj)) {
          const [folderName, occurrences] = folderNameAndOccurrences;

          if (
            occurrences.length === 1 ||
            !foldersOccurrenceObj ||
            (foldersOccurrenceObj as any)[folderName]
          ) {
            continue;
          }

          (foldersOccurrenceObj as any)[folderName] = occurrences.map(
            (folderOccurrence: any, index: number) => ({
              ...folderOccurrence,
              alternativeName: `${folderOccurrence.name} ${index + 1}`,
            })
          );
        }
      }

      const folderData = folderDataResponse.data.files.map((file) => {
        const targetFolderOccurrences = foldersOccurrenceObj
          ? (foldersOccurrenceObj as any)[file.name as string]
          : null;
        const targetFolder = targetFolderOccurrences
          ? targetFolderOccurrences.find((folder: any) => folder.id === file.id)
          : null;

        if (targetFolder) {
          return {
            ...file,
            name: file.name,
            id: file.id,
            folderAlternativeName: targetFolder.name,
            mimeType: file.mimeType,
            pathToFile: unitFolder.name,
            parentFolderId: unitFolder.id,
            parentFolderAlternativeName,
          };
        }

        return {
          ...file,
          name: file.name,
          id: file.id,
          mimeType: file.mimeType,
          parentFolderId: unitFolder.id,
          pathToFile: unitFolder.name,
          parentFolderAlternativeName,
        };
      });

      unitFolders.push(...(folderData as unknown as TUnitFolder[]));
      continue;
    }

    const isFilePresent = unitFolders.some((folder) => folder.name === unitFolder.name);

    if (!isFilePresent) {
      const file = {
        ...unitFolder,
        name: unitFolder.name,
        id: unitFolder.id,
        mimeType: unitFolder.mimeType,
        parentFolderId: unitFolder.id,
        pathToFile: unitFolder.pathToFile
          ? `${unitFolder.pathToFile}/${unitFolder.name}`
          : unitFolder.name,
        parentFolderAlternativeName,
      };

      unitFolders.push(...(file as unknown as TUnitFolder[]));
    }
  }

  return unitFolders;
};

export const getTargetFolderChildItems = async (
  drive: drive_v3.Drive,
  unitId: string
) => {
  try {
    const gdriveResponse = await drive.files.list({
      ...getDriveListScopeParams(),
      q: `'${unitId}' in parents`,
      fields: '*',
    });

    if (!gdriveResponse.data?.files) {
      throw new CustomError(
        'Failed to get the root items of the target unit folder.',
        500
      );
    }

    const allChildItems = await getFolderChildItems(gdriveResponse.data.files);

    return allChildItems;
  } catch (error) {
    console.error('Failed to get the target folder child items. Reason: ', error);

    return null;
  }
};

export const createFolderStructure = async (
  unitFolders: TUnitFolder[],
  gdriveAccessToken: string,
  unitFolderId: string,
  gdriveRefreshToken: string,
  clientOrigin: string
) => {
  const folderPaths = unitFolders
    .filter((folder) => folder?.mimeType?.includes('folder'))
    .map((folder) => {
      return {
        name: folder.name,
        mimeType: folder.mimeType,
        fileId: folder.id,
        pathToFile: folder.pathToFile,
        parentFolderId: folder.parentFolderId,
      };
    });
  const foldersFailedToCreate = [];
  const createdFolders = [];

  // create the google sub folders
  for (const folderToCreate of folderPaths) {
    console.log('folderToCreate: ', folderToCreate);

    if (folderToCreate.pathToFile === '') {
      const folderCreationResult = await createGDriveFolder(
        folderToCreate.name as string,
        gdriveAccessToken,
        [unitFolderId],
        3,
        gdriveRefreshToken,
        clientOrigin,
        {
          [ORIGINAL_ITEM_ID_FIELD_NAME]: folderToCreate.fileId ?? null,
        }
      );

      console.log('folderCreationResult: ', folderCreationResult);

      const { folderId, wasSuccessful } = folderCreationResult;

      if (!wasSuccessful) {
        foldersFailedToCreate.push(folderToCreate.name);
      } else {
        createdFolders.push({
          id: folderId,
          gpFolderId: folderToCreate.fileId,
          name: folderToCreate.name,
          pathToFile: '',
          parentFolderId: folderToCreate.parentFolderId,
          originalFileId: folderToCreate.fileId,
          mimeType: folderToCreate.mimeType,
        });
      }

      continue;
    }

    const parentFolderId = createdFolders.find(
      (folder) => folder.gpFolderId === folderToCreate.parentFolderId
    )?.id;

    console.log('parentFolderId: ', parentFolderId);

    if (!parentFolderId) {
      foldersFailedToCreate.push(folderToCreate.name);
      continue;
    }

    const nestedFolderCreationResult = await createGDriveFolder(
      folderToCreate.name as string,
      gdriveAccessToken,
      [parentFolderId],
      3,
      gdriveRefreshToken as string,
      clientOrigin
    );
    console.log('nestedFolderCreationResult: ', nestedFolderCreationResult);
    const { folderId, wasSuccessful } = nestedFolderCreationResult;

    if (!wasSuccessful) {
      foldersFailedToCreate.push(folderToCreate.name);
      continue;
    }

    createdFolders.push({
      id: folderId,
      gpFolderId: folderToCreate.fileId,
      name: folderToCreate.name,
      pathToFile: folderToCreate.pathToFile,
      parentFolderId: folderToCreate.parentFolderId,
      originalFileId: folderToCreate.fileId,
      mimeType: folderToCreate.mimeType,
    });
  }

  return createdFolders;
};

export const getUnitGDriveChildItems = async (unitId: string) => {
  const creds = new GoogleServiceAccountAuthCreds();
  const hasDriveId =
    typeof process.env.GOOGLE_DRIVE_ID === 'string' && !!process.env.GOOGLE_DRIVE_ID;
  const hasPrivateKey = typeof creds.private_key === 'string' && !!creds.private_key;

  if (!hasDriveId || !hasPrivateKey) {
    console.warn(
      'Skipping getUnitGDriveChildItems because Google Drive credentials are not configured in this environment.'
    );
    return [];
  }

  try {
    const drive = await createDrive();

    console.log(`Getting the GDrive child items for the unit: ${unitId}`);

    const gdriveResponse = await drive.files.list({
      ...getDriveListScopeParams(),
      q: `'${unitId}' in parents`,
      fields: '*',
    });

    if (!gdriveResponse.data?.files) {
      throw new CustomError(
        'Failed to get the root items of the target unit folder.',
        500
      );
    }

    console.log('gdriveResponse.data.files.length: ', gdriveResponse.data.files);

    const allChildItems = await getFolderChildItems(gdriveResponse.data.files);

    return allChildItems;
  } catch (error) {
    console.error('Failed to get the root items of the target unit folder. Reason: ', error);

    return null;
  }
};
