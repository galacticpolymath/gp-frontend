import axios from 'axios';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { drive_v3 } from 'googleapis';
import { sendMessage, TCopyFilesMsg, VALID_WRITABLE_ROLES } from '../../../pages/api/gp-plus/copy-lesson';
import { waitWithExponentialBackOff } from '../../../globalFns';
import { CustomError } from '../../utils/errors';
import { IFile, TFilesToRename, TFileToCopy, TRenameFilesResult } from './types';
import { getCanRetry, getIsValidFileId } from './shared';
import { getTargetUserPermission } from './permissions';
import { createDrive } from './driveClients';

type TCopiedFile = { id: string; [key: string]: unknown };

interface TGDriveItem {
  id: string;
  labels: {
    trashed: boolean;
    [key: string]: boolean;
  };
  [key: string]: unknown;
}

type TSendMsgParams = Parameters<typeof sendMessage>;

export interface IFailedFileCopy {
  lessonName: string;
  unitName: string;
  lessonFolderLink: string;
  fileName: string;
  fileLink: string;
  errorType?: string;
  errorMessage?: string;
  timestamp: string;
  userEmail: string;
}

const updateFile = async (fileId: string, reqBody: IFile, accessToken: string) => {
  try {
    const { status, data } = await axios.put<{
      id: string;
      [key: string]: unknown;
    }>(`https://www.googleapis.com/drive/v2/files/${fileId}`, reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (status !== 200) {
      throw new CustomError(`Failed to update the target file. Status code: ${status}`, status);
    }

    return data;
  } catch (error: any) {
    console.error('An error has occurred. Failed to update the target file. Reason: ', error);
    console.log('updateFile, error?.response?.data: ', error?.response?.data);

    if (error?.response?.data?.error?.code === 404) {
      return {
        errType: 'notFound',
        fileId,
        reqBody,
      };
    }

    if (error?.code === 'ECONNABORTED') {
      console.log('Timeout occurred while updating the target file. Returning timeout error type.');
      return { errType: 'timeout', fileId, reqBody };
    }

    if (error?.response?.data?.error?.status === 'UNAUTHENTICATED') {
      console.log('User is not authenticated. Returning unauthenticated error type.');
      return {
        errType: 'unauthenticated',
      };
    }

    return { errType: 'generalErr', fileId, reqBody };
  }
};

export const renameFiles = async (
  fileCopies: { id: string; name: string }[],
  gdriveAccessToken: string,
  gdriveRefreshToken: string,
  origin: string,
  tries = 5
): Promise<TRenameFilesResult> => {
  try {
    const fileUpdatesPromises = fileCopies.map((file) => {
      return updateFile(file.id, { title: file.name }, gdriveAccessToken);
    });
    const fileUpdatesResults = await Promise.all(fileUpdatesPromises);
    const filesUpdateFailedDueToTimeout = fileUpdatesResults.filter(
      (result) => result.errType === 'timeout'
    );
    const filesUpdateFailedDueInvalidAuthToken = fileUpdatesResults.filter(
      (result) => result.errType === 'unauthenticated'
    );

    if (!filesUpdateFailedDueInvalidAuthToken.length && !filesUpdateFailedDueToTimeout.length) {
      console.log('All files have been successfully renamed.');
      return {
        wasSuccessful: true,
      };
    }

    const filesToUpdateRetry: Parameters<typeof renameFiles>[0] = [];

    if (filesUpdateFailedDueInvalidAuthToken.length && tries > 0) {
      tries -= 1;
      const { refreshAuthToken } = await import('../googleDriveServices');
      const refreshTokenRes = (await refreshAuthToken(gdriveRefreshToken, origin)) ?? {};
      const { accessToken: _accessToken, wasSuccessful } = refreshTokenRes;

      if (!wasSuccessful) {
        return {
          wasSuccessful: false,
          errType: 'invalidAuthToken',
        };
      }

      gdriveAccessToken = _accessToken as string;

      for (const fileUpdateResult of fileUpdatesResults) {
        console.log('fileUpdateResult: ', fileUpdateResult);

        if ('errType' in fileUpdateResult && fileUpdateResult.errType === 'unauthenticated') {
          filesToUpdateRetry.push({
            id: fileUpdateResult.fileId as string,
            name: (fileUpdateResult.reqBody as IFile).title,
          });
        }
      }
    }

    if (filesUpdateFailedDueToTimeout.length && tries > 0) {
      const filesToUpdateRetry: Parameters<typeof renameFiles>[0] = [];

      for (const fileUpdateResult of filesUpdateFailedDueToTimeout) {
        console.log('fileUpdateResult: ', fileUpdateResult);

        if ('errType' in fileUpdateResult && fileUpdateResult.errType === 'timeout') {
          filesToUpdateRetry.push({
            id: fileUpdateResult.fileId as string,
            name: (fileUpdateResult.reqBody as IFile).title,
          });
        }
      }
    }

    if (filesToUpdateRetry.length && tries > 0) {
      tries -= 1;
      await waitWithExponentialBackOff(tries, [2_000, 5_000]);

      return await renameFiles(
        filesToUpdateRetry,
        gdriveAccessToken,
        gdriveRefreshToken,
        origin,
        tries
      );
    }

    return {
      failedUpdatedFiles: filesToUpdateRetry,
      wasSuccessful: false,
      errType: 'fileUpdateErr',
    };
  } catch (error) {
    console.error('Error renaming files:', error);

    return {
      errType: 'renameFilesFailed',
      wasSuccessful: false,
    };
  }
};

export const getGDriveItemViaServiceAccount = async (
  gdriveItemId: string,
  drive?: drive_v3.Drive
) => {
  try {
    let _drive = drive;

    if (!drive) {
      _drive = await createDrive();
    }

    const fileRetrievalResult = await _drive!.files.get({
      fileId: gdriveItemId,
    });

    if (fileRetrievalResult.status !== 200) {
      throw new Error(
        `Failed to get item in Google Drive via service account. Status: ${fileRetrievalResult.status}. Data: ${fileRetrievalResult.data}`
      );
    }

    return fileRetrievalResult.data;
  } catch (error) {
    console.error('Failed to get item in Google Drive via service account. Reason: ', error);

    return null;
  }
};

export const copyGDriveItem = async (
  accessToken: string,
  parentFolderIds: string[],
  fileId: string,
  refreshToken: string,
  clientOrigin: string,
  tries = 3,
  appProperties?: Record<string, unknown>
): Promise<
  TCopiedFile | { errType: string; errMsg?: string; status?: number; errorObj?: any }
> => {
  let reqBody: Record<string, unknown> = parentFolderIds ? { parents: parentFolderIds } : {};

  if (appProperties) {
    reqBody = {
      ...reqBody,
      appProperties,
    };
  }

  try {
    const { status, data } = await axios.post<TCopiedFile>(
      `https://www.googleapis.com/drive/v3/files/${fileId}/copy`,
      reqBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          supportsAllDrives: true,
        },
      }
    );

    if (status !== 200) {
      throw new Error(`Failed to copy a file with id ${fileId}. Status: ${status}`);
    }

    return data;
  } catch (error: any) {
    console.error('Failed to copy files with user. Reason: ', error);
    console.error('Failed to copy files with user. Reason, keys: ', Object.keys(error));
    const response = error.response;

    console.log('The response: ', response);
    console.log('The response errors: ', response?.data?.error);

    const { canRetry } = await getCanRetry(error, refreshToken, clientOrigin);

    if (canRetry && tries <= 0) {
      return {
        errType: 'timeout',
      };
    }

    if (canRetry) {
      console.log('Retrying to copy files with user...');
      console.log(`The current tries are: ${tries}. Will pause...`);

      await waitWithExponentialBackOff(tries);

      tries -= 1;

      return await copyGDriveItem(
        accessToken,
        parentFolderIds,
        fileId,
        refreshToken,
        clientOrigin,
        tries,
        {
          originalGpGDriveItemId: fileId,
        }
      );
    }

    if (response.status === 404) {
      return {
        errType: 'notFound',
      };
    }

    return { errType: 'generalErr', errorObj: error };
  }
};

export const getGDriveItem = async (
  fileId: string,
  accessToken: string,
  refreshToken: string,
  clientOrigin: string,
  willRetry = true,
  tries = 3,
  urlParams?: [string, string][]
): Promise<TGDriveItem | { errType: string }> => {
  try {
    const url = new URL(`https://www.googleapis.com/drive/v2/files/${fileId}`);

    if (urlParams?.length) {
      for (const [key, val] of urlParams) {
        url.searchParams.append(key, val);
      }
    }

    const { status, data } = await axios.get<TGDriveItem>(url.href, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        supportsAllDrives: true,
      },
    });

    if (status !== 200) {
      throw new CustomError(data ?? 'Failed to retrieve Google Drive item.', status);
    }

    return data;
  } catch (error: any) {
    console.error('Failed to retrieve Google Drive item. Error: ', error);
    console.log('The response errors: ', error?.response);

    if (error?.response?.data?.error?.code === 404) {
      return {
        errType: 'notFound',
      };
    }

    if (error?.response?.data?.error?.status === 'UNAUTHENTICATED') {
      return {
        errType: 'unauthenticated',
      };
    }

    const canRetryResult = await getCanRetry(error, refreshToken, clientOrigin);

    if (canRetryResult.canRetry && tries > 0 && willRetry) {
      await waitWithExponentialBackOff(tries, [2_000, 5_000]);

      return await getGDriveItem(
        fileId,
        accessToken,
        refreshToken,
        clientOrigin,
        willRetry,
        tries - 1
      );
    } else if (canRetryResult.canRetry && willRetry) {
      return {
        errType: 'timeout',
      };
    }

    return {
      errType: 'generalErr',
    };
  }
};

export const logFailedFileCopyToExcel = async (failedCopy: IFailedFileCopy) => {
  try {
    const excelFilePath = path.join(process.cwd(), 'failed-file-copies.xlsx');
    const workbook = new ExcelJS.Workbook();
    const sheetName = 'Failed Copies';
    let worksheet: ExcelJS.Worksheet;

    const columns = [
      { header: 'Lesson Name', key: 'lessonName', width: 30 },
      { header: 'Unit Name', key: 'unitName', width: 30 },
      { header: 'Lesson Folder Link', key: 'lessonFolderLink', width: 50 },
      { header: 'File Name', key: 'fileName', width: 30 },
      { header: 'File Link', key: 'fileLink', width: 50 },
      { header: 'Error Type', key: 'errorType', width: 20 },
      { header: 'Error Message', key: 'errorMessage', width: 40 },
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'User Email', key: 'userEmail', width: 30 },
    ];

    if (fs.existsSync(excelFilePath)) {
      await workbook.xlsx.readFile(excelFilePath);
      worksheet = workbook.getWorksheet(sheetName) || workbook.addWorksheet(sheetName);
    } else {
      worksheet = workbook.addWorksheet(sheetName);
      worksheet.columns = columns;

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      headerRow.commit && headerRow.commit();
    }

    worksheet.columns = columns;

    let isAlreadyTracked = false;
    if (worksheet.rowCount > 1) {
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const rowFileName = row.getCell('fileName').value;
        const rowFileLink = row.getCell('fileLink').value;
        const rowUserEmail = row.getCell('userEmail').value;
        if (
          rowFileName === failedCopy.fileName &&
          rowFileLink === failedCopy.fileLink &&
          rowUserEmail === failedCopy.userEmail
        ) {
          isAlreadyTracked = true;
          break;
        }
      }
    }

    if (isAlreadyTracked) {
      console.log(
        `File ${failedCopy.fileName} has already been tracked in Excel, skipping duplicate entry.`
      );
      return;
    }

    worksheet.addRow({
      lessonName: failedCopy.lessonName,
      unitName: failedCopy.unitName,
      lessonFolderLink: failedCopy.lessonFolderLink,
      fileName: failedCopy.fileName,
      fileLink: failedCopy.fileLink,
      errorType: failedCopy.errorType || '',
      errorMessage: failedCopy.errorMessage || '',
      timestamp: failedCopy.timestamp,
      userEmail: failedCopy.userEmail,
    });

    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`Failed file copy logged to Excel: ${failedCopy.fileName}`);
  } catch (error) {
    console.error('Failed to log to Excel:', error);
  }
};

export const copyFiles = async (
  filesToCopy: TFileToCopy[],
  email: string,
  drive: drive_v3.Drive,
  gDriveAccessToken: string,
  lessonFolderId: string,
  refreshAuthToken: string,
  clientOrigin: string,
  sendMessageToClient: (
    data: TCopyFilesMsg,
    willEndStream?: TSendMsgParams[2],
    delayMsg?: TSendMsgParams[3]
  ) => void,
  lessonName: string,
  unitName: string,
  sharedGDriveLessonsFolderId: string
) => {
  let wasJobSuccessful = true;
  const fileCopies: TFilesToRename = [];

  for (const fileToCopy of filesToCopy) {
    const { id: fileId, name } = fileToCopy;

    if (!getIsValidFileId(fileId)) {
      console.error(`Invalid file ID: ${fileId}. Skipping file: ${name}`);
      wasJobSuccessful = false;
      continue;
    }

    const permission = await getTargetUserPermission(fileId, email, drive);

    let userUpdatedRole = permission?.role;
    let tries = 7;

    if (!userUpdatedRole) {
      console.log('role is not present');
      wasJobSuccessful = false;
      continue;
    }

    console.log(`Processing file: ${name}`);
    console.log("Made the target file read only and changed the target user's permission to writer.");

    let didFailedToUpdateFilePermissions = false;

    while (!VALID_WRITABLE_ROLES.has(userUpdatedRole!)) {
      console.log(`tries: ${tries}`);
      console.log(`userUpdatedRole: ${userUpdatedRole}`);

      if (tries <= 0) {
        console.error("Reached max tries. Failed to update the target user's permission.");
        didFailedToUpdateFilePermissions = true;

        break;
      }

      await waitWithExponentialBackOff(tries);

      const permission = await getTargetUserPermission(fileId, email, drive);

      userUpdatedRole = permission?.role;
      tries -= 1;
    }

    if (didFailedToUpdateFilePermissions) {
      wasJobSuccessful = false;
      continue;
    }

    console.log(`The role of the user is: ${userUpdatedRole}`);
    console.log("The user's role was updated.");
    console.log(`Will copy file: ${fileId}`);

    const gdriveItemMetaData = await getGDriveItem(
      fileId,
      gDriveAccessToken,
      refreshAuthToken,
      clientOrigin
    );

    console.log('gdriveItemMetaData: ', gdriveItemMetaData);

    const fileCopyResult = await copyGDriveItem(
      gDriveAccessToken,
      [lessonFolderId],
      fileId,
      refreshAuthToken,
      clientOrigin,
      3,
      {
        originalGpGDriveItemId: fileId,
      }
    );

    console.log('fileCopyResult: ', fileCopyResult.errType);
    console.log('permission: ', permission);

    if ('id' in fileCopyResult && fileCopyResult.id) {
      console.log(`Successfully copied file ${name}`);

      const fileCopy: TFilesToRename[number] = {
        id: fileCopyResult.id,
        name: name,
        originalFileIdInGpGoogleDrive: fileId,
      };

      fileCopies.push(fileCopy);

      sendMessageToClient({
        fileCopied: name,
      });
    } else if (fileCopyResult?.errType) {
      console.log('fileCopyResult?.errType: ', fileCopyResult?.errType);

      wasJobSuccessful = false;
      console.error(
        'Failed to copy file for user.',
        'Filename: ',
        name,
        'Email: ',
        email,
        'Reason: ',
        fileCopyResult
      );

      sendMessageToClient({
        failedCopiedFile: name,
        fileId,
      });

      const lessonFolderLink = `https://drive.google.com/drive/folders/${sharedGDriveLessonsFolderId}`;
      const fileLink = `https://drive.google.com/file/d/${fileId}/view`;
      const errorType =
        'errType' in fileCopyResult && typeof fileCopyResult.errType === 'string'
          ? fileCopyResult.errType
          : 'unknown';
      const errorMessage =
        'errMsg' in fileCopyResult && typeof fileCopyResult.errMsg === 'string'
          ? fileCopyResult.errMsg
          : JSON.stringify(fileCopyResult);

      if (process.env.NEXT_PUBLIC_HOST === 'localhost') {
        await logFailedFileCopyToExcel({
          lessonName,
          unitName,
          lessonFolderLink,
          fileName: name,
          fileLink,
          errorType,
          errorMessage,
          timestamp: new Date().toISOString(),
          userEmail: email,
        });
      }
    }
  }

  if (fileCopies.length) {
    const renameFilesResult = await renameFiles(
      fileCopies,
      gDriveAccessToken,
      refreshAuthToken,
      clientOrigin
    );

    console.log('The file names update results: ', renameFilesResult);

    if (!renameFilesResult.wasSuccessful) {
      console.error('Failed to rename copied files. Error type: ', renameFilesResult.errType);
    } else {
      console.log('All files have been successfully renamed.');
    }
  }

  return {
    wasJobSuccessful,
    fileCopies,
  };
};
