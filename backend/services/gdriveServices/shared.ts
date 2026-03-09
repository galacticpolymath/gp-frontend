import { refreshAuthToken } from '../googleDriveServices';
import { CustomError } from '../../utils/errors';

export const TEACHERS_GOOGLE_GROUP_EMAIL = 'teachers@galacticpolymath.com';
export const ORIGINAL_ITEM_ID_FIELD_NAME = 'originalItemId';

type RetryResult = {
  canRetry: boolean;
  accessToken?: string;
};

export type TUnitFolder = Partial<{
  name: string | null;
  id: string | null;
  mimeType: string | null;
  pathToFile?: string;
  parentFolderId?: string;
}>;

export type TAppProperties = Record<
  string,
  null | number | string | boolean | { [key: string]: unknown } | unknown[]
>;

export type TGoogleAuthScopes =
  | 'https://www.googleapis.com/auth/drive'
  | 'https://www.googleapis.com/auth/admin.directory.group'
  | 'https://www.googleapis.com/auth/admin.directory.user'
  | 'https://www.googleapis.com/auth/gmail.send';

export const getDriveListScopeParams = () => {
  const sharedDriveId = process.env.GOOGLE_DRIVE_ID?.trim();

  if (!sharedDriveId) {
    throw new CustomError(
      'GOOGLE_DRIVE_ID is required for template Shared Drive listing.',
      500
    );
  }

  return {
    corpora: 'drive' as const,
    driveId: sharedDriveId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  };
};

export class GDriveItem {
  name: string;
  appProperties?: TAppProperties;
  parents: string[];
  mimeType: 'application/vnd.google-apps.folder' | string;

  constructor(
    folderName: string,
    parents: string[],
    mimeType = 'application/vnd.google-apps.folder',
    appProperties?: TAppProperties
  ) {
    this.name = folderName;
    this.parents = parents;
    this.mimeType = mimeType;

    if (appProperties) {
      this.appProperties = appProperties;
    }
  }
}

export const getCanRetry = async (
  error: any,
  refreshToken: string,
  reqOriginForRefreshingToken: string
): Promise<RetryResult> => {
  if (error?.response?.data?.error?.status === 'UNAUTHENTICATED') {
    console.log('Will refresh the auth token...');

    const refreshTokenRes =
      (await refreshAuthToken(refreshToken, reqOriginForRefreshingToken)) ?? {};
    const { accessToken } = refreshTokenRes;

    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Failed to refresh access token');
    }

    return {
      canRetry: true,
      accessToken,
    };
  }

  if (error?.code === 'ECONNABORTED') {
    return {
      canRetry: true,
    };
  }

  return {
    canRetry: false,
  };
};

export const getIsValidFileId = (id: unknown) =>
  typeof id === 'string' && /^[a-zA-Z0-9_-]{10,}$/.test(id);
