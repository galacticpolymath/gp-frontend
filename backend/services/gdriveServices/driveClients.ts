import { google } from 'googleapis';
import { GoogleAuthOptions, OAuth2Client } from 'google-auth-library';
import { GoogleServiceAccountAuthCreds } from '../googleDriveServices';
import { CustomError } from '../../utils/errors';
import { TGoogleAuthScopes } from './shared';

export const createDrive = async (
  scopes: TGoogleAuthScopes[] = ['https://www.googleapis.com/auth/drive'],
  _clientOptions?: GoogleAuthOptions['clientOptions']
) => {
  const drive = google.drive('v3');
  const creds = new GoogleServiceAccountAuthCreds();
  const normalizedPrivateKey = creds?.private_key
    ?.replace(/\\n/g, '\n')
    .replace(/"/g, '');
  const hasRequiredCreds =
    typeof creds.client_email === 'string' &&
    !!creds.client_email &&
    typeof normalizedPrivateKey === 'string' &&
    !!normalizedPrivateKey;

  if (!hasRequiredCreds) {
    throw new CustomError(
      'Google Drive service account credentials are missing. Set GDRIVE_WORKER_KEY and related service account env vars before creating a Drive client.',
      500
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      client_id: creds.client_id,
      private_key: normalizedPrivateKey,
    },
    scopes: scopes,
  });
  const authClient = (await auth.getClient()) as OAuth2Client;

  google.options({ auth: authClient });

  return drive;
};

export const createGoogleAdminService = async (
  scopes: TGoogleAuthScopes[] = ['https://www.googleapis.com/auth/drive'],
  clientOptions?: GoogleAuthOptions['clientOptions']
) => {
  const creds = new GoogleServiceAccountAuthCreds();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      client_id: creds.client_id,
      private_key: creds?.private_key?.replace(/\\n/g, '\n').replace(/"/g, ''),
    },
    scopes: scopes,
    clientOptions,
  });
  const authClient = (await auth.getClient()) as OAuth2Client;
  const adminService = google.admin({
    version: 'directory_v1',
    auth: authClient,
  });

  return adminService;
};
