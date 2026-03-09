import { drive_v3 } from 'googleapis';
import { sleep, waitWithExponentialBackOff } from '../../../globalFns';
import { CustomError } from '../../utils/errors';
import { createDrive } from './driveClients';

export const listPermissions = async (fileId: string, drive?: drive_v3.Drive) => {
  let _drive = drive;

  if (!drive) {
    _drive = await createDrive();
  }

  const filePermissions = await _drive!.permissions.list({
    fileId,
    supportsAllDrives: true,
    fields: '*',
  });

  return filePermissions.data;
};

export const getTargetUserPermission = async (
  fileId: string,
  email: string,
  drive?: drive_v3.Drive
) => {
  let _drive = drive;

  if (!drive) {
    _drive = await createDrive();
  }

  const filePermissions = await _drive!.permissions.list({
    fileId,
    supportsAllDrives: true,
    fields: '*',
  });

  console.log('filePermissions.data.permissions: ', filePermissions.data.permissions);

  return filePermissions.data.permissions?.find((permission) => {
    return permission.emailAddress === email;
  });
};

export const shareFilesWithUser = async (
  fileIds: string[],
  userEmail: string,
  drive?: drive_v3.Drive
) => {
  try {
    let _drive = drive;

    if (!drive) {
      _drive = await createDrive();
    }

    const shareFilePromises = fileIds.map((fileId) => {
      // @ts-ignore
      return _drive!.permissions.create({
        requestBody: {
          type: 'user',
          role: 'fileOrganizer',
          emailAddress: userEmail,
        },
        fileId: fileId,
        fields: '*',
        supportsAllDrives: true,
        sendNotificationEmail: false,
      });
    });
    const shareFileResults = await Promise.all(shareFilePromises);

    return shareFileResults;
  } catch (error: any) {
    console.error('Failed to share files with the target user. Reason: ', error);
    console.error(
      'Failed to share files with the target user. Error response: ',
      error.response?.data
    );

    return null;
  }
};

export const shareFileWithUser = async (
  fileId: string,
  userEmail: string,
  drive?: drive_v3.Drive,
  role: 'fileOrganizer' | 'writer' | 'viewer' | 'reader' = 'fileOrganizer'
) => {
  try {
    let _drive = drive;

    if (!drive) {
      _drive = await createDrive();
    }

    // @ts-ignore
    const permissionUpdateResult = await _drive!.permissions.create({
      requestBody: {
        type: 'user',
        role,
        emailAddress: userEmail,
      },
      fileId: fileId,
      fields: '*',
      supportsAllDrives: true,
      sendNotificationEmail: false,
    });

    return permissionUpdateResult as unknown as {
      data: drive_v3.Schema$Permission;
    };
  } catch (error: any) {
    console.error('Failed to share files with the target user. Reason: ', error);
    console.error(
      'Failed to share files with the target user. Error response: ',
      error.response?.data
    );

    return null;
  }
};

export const updatePermissionsForSharedFileItems = async (
  drive: drive_v3.Drive,
  email: string,
  fileIds: string[]
) => {
  const parentFolderId = (
    await drive.files.get({
      fileId: fileIds[0],
      fields: '*',
      supportsAllDrives: true,
    })
  ).data?.parents?.[0];

  console.log('parentFolderId: ', parentFolderId);

  if (!parentFolderId) {
    throw new CustomError('The file does not have a parent folder.', 500);
  }

  const shareParentFolderResult = await shareFileWithUser(parentFolderId, email, drive);

  console.log('shareParentFolderResult: ', shareParentFolderResult);

  await sleep(1_500);

  console.log(
    `Updating permissions for shared file items. Email: ${email}, File IDs: ${fileIds.join(', ')}`
  );

  let targetPermission = await getTargetUserPermission(parentFolderId, email, drive);

  console.log('targetPermission: ', targetPermission);

  let tries = 4;
  let didFailToGetTargetPermission = false;

  while (!targetPermission) {
    console.log(
      'Checking if the parent folder was successfully shared with the target user. Tries left: ',
      tries
    );

    if (tries <= 0) {
      didFailToGetTargetPermission = true;
      break;
    }

    await waitWithExponentialBackOff(tries);

    targetPermission = await getTargetUserPermission(parentFolderId, email, drive);
    tries -= 1;
  }

  console.log('targetPermission: ', targetPermission);

  if (didFailToGetTargetPermission) {
    throw new CustomError('Failed to get target user permission after multiple attempts.', 500);
  }

  if (!targetPermission?.id) {
    throw new CustomError('The target permission for the gp plus user was not found.', 500);
  }

  console.log('Will update the permission of the target file.');

  const shareFilesResultPromises = fileIds.map((fileId) => {
    return shareFileWithUser(fileId, email, drive, 'writer');
  });
  const shareFilesResults = await Promise.all(shareFilesResultPromises);

  shareFilesResults.forEach((result) => {
    console.log('Share file result: ', result?.data?.role);
  });

  for (const fileId of fileIds) {
    // @ts-ignore
    await drive.files.update({
      fileId: fileId,
      supportsAllDrives: true,
      requestBody: {
        contentRestrictions: {
          readOnly: true,
          reason:
            'Making a copy for GP plus user. Making file readonly temporarily.',
        },
      },
    });
    console.log('File was made readonly.');
  }

  return { id: parentFolderId, permissionId: targetPermission.id };
};
