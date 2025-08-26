import { drive_v3, google } from "googleapis";
import {
  GoogleServiceAccountAuthCreds,
  refreshAuthToken,
} from "./googleDriveServices";
import { GoogleAuthOptions, OAuth2Client } from "google-auth-library";
import { CustomError } from "../utils/errors";
import axios from "axios";
import { waitWithExponentialBackOff } from "../../globalFns";
import { GOOGLE_DRIVE_PROJECT_CLIENT_ID } from "../../globalVars";
import { ILessonGDriveId, IUnitGDriveLesson } from "../models/User/types";
import {
  addNewGDriveLessons,
  createDbArrFilter,
  getUserByEmail,
  updateUserCustom,
} from "./userServices";
import { INewUnitLesson } from "../models/Unit/types/teachingMaterials";
import {
  sendMessage,
  TCopyFilesMsg,
} from "../../pages/api/gp-plus/copy-lesson";

type TUnitFolder = Partial<{
  name: string | null;
  id: string | null;
  mimeType: string | null;
  pathToFile?: string;
  parentFolderId?: string;
}>;

type TAppProperties = Record<
  string,
  null | number | string | boolean | { [key: string]: unknown } | unknown[]
>;

export const ORIGINAL_ITEM_ID_FIELD_NAME = "originalItemId";

export class GDriveItem {
  name: string;
  appProperties?: TAppProperties;
  parents: string[];
  mimeType: "application/vnd.google-apps.folder" | string;

  constructor(
    folderName: string,
    parents: string[],
    mimeType = "application/vnd.google-apps.folder",
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

type TGoogleAuthScopese =
  | "https://www.googleapis.com/auth/drive"
  | "https://www.googleapis.com/auth/admin.directory.user";

export const createDrive = async (
  scopes: TGoogleAuthScopese[] = ["https://www.googleapis.com/auth/drive"],
  clientOptions?: GoogleAuthOptions["clientOptions"]
) => {
  const drive = google.drive("v3");
  const creds = new GoogleServiceAccountAuthCreds();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      client_id: creds.client_id,
      private_key: creds?.private_key?.replace(/\\n/g, "\n").replace(/"/g, ""),
    },
    scopes: scopes,
    clientOptions,
  });
  const authClient = (await auth.getClient()) as OAuth2Client;

  google.options({ auth: authClient });

  return drive;
};

export const createGoogleAdminService = async (
  scopes: TGoogleAuthScopese[] = ["https://www.googleapis.com/auth/drive"],
  clientOptions?: GoogleAuthOptions["clientOptions"]
) => {
  const creds = new GoogleServiceAccountAuthCreds();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      client_id: creds.client_id,
      private_key: creds?.private_key?.replace(/\\n/g, "\n").replace(/"/g, ""),
    },
    scopes: scopes,
    clientOptions,
  });
  const authClient = (await auth.getClient()) as OAuth2Client;
  const adminService = google.admin({
    version: "directory_v1",
    auth: authClient,
  });

  return adminService;
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
      "https://www.googleapis.com/drive/v3/files",
      {
        headers: {
          Authorization: `Bearer ${gdriveAccessToken}`,
          "Content-Type": "application/json",
        },
        params: {
          orderBy: "name",
          q: `'${folderId}' in parents`,
          supportAllDrives: true,
          fields: "*",
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
    console.error(
      "Failed to get items in user's google drive. Reason: ",
      error
    );

    const canRetryResult = await getCanRetry(
      error,
      gdriveRefreshToken,
      clientOrigin
    );

    console.log("canRetryResult: ", canRetryResult);

    console.log(`getUserChildItemsOfFolder tries: ${tries}`);

    if (canRetryResult.canRetry && tries > 0) {
      await waitWithExponentialBackOff(tries);

      return await getUserChildItemsOfFolder(
        folderId,
        gdriveAccessToken,
        gdriveRefreshToken,
        clientOrigin,
        tries - 1
      );
    }

    return null;
  }
};

export const getFolderChildItems = async (
  rootDriveFolders: drive_v3.Schema$File[]
) => {
  const drive = await createDrive();
  let unitFolders: TUnitFolder[] = rootDriveFolders.map((folder) => ({
    name: folder.name,
    id: folder.id,
    mimeType: folder.mimeType,
    pathToFile: "",
  }));

  // get all of the folders of the target unit folder
  for (const unitFolder of unitFolders) {
    const parentFolderAlternativeName =
      "alternativeName" in unitFolder ? unitFolder.alternativeName : "";

    if (
      unitFolder?.mimeType?.includes("folder") &&
      unitFolder.pathToFile &&
      unitFolder.pathToFile !== ""
    ) {
      const { data } = await drive.files.list({
        corpora: "drive",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        driveId: process.env.GOOGLE_DRIVE_ID,
        q: `'${unitFolder.id}' in parents`,
      });

      if (!data.files) {
        continue;
      }

      const folders = data?.files.filter((file) =>
        file?.mimeType?.includes("folder")
      );
      let foldersOccurrenceObj:
        | (drive_v3.Schema$File & { [key: string]: any })
        | null = null;

      if (folders.length) {
        foldersOccurrenceObj = folders.reduce(
          (allFoldersObj, folderA, _, self) => {
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
          },
          {} as drive_v3.Schema$File & { [key: string]: string }
        );
      }

      const childFolderAndFilesOfFolder = data.files.map((file) => {
        if (
          !file?.mimeType?.includes("folder") ||
          !foldersOccurrenceObj ||
          (file.name &&
            (!foldersOccurrenceObj?.[file.name] ||
              foldersOccurrenceObj?.[file.name]?.length === 1))
        ) {
          console.log("The file retrieved from the server: ", file);

          return {
            ...file,
            name: file.name,
            id: file.id,
            // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive
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

    if (unitFolder?.mimeType?.includes("folder")) {
      const folderDataResponse = await drive.files.list({
        corpora: "drive",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        driveId: process.env.GOOGLE_DRIVE_ID,
        q: `'${unitFolder.id}' in parents`,
      });

      if (!folderDataResponse || !folderDataResponse?.data?.files) {
        continue;
      }

      const folders = folderDataResponse?.data?.files.filter((file) =>
        file?.mimeType?.includes("folder")
      );
      /** @type {{ [key: string]: any[] } | null} */
      let foldersOccurrenceObj = null;

      if (folders.length) {
        foldersOccurrenceObj = folders.reduce(
          (allFoldersObj, folderA, _, self) => {
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
          },
          {}
        );

        // if a folder has duplicate names, give it a alternative name in order to differentiate it from the rest of the folders
        for (const folderNameAndOccurrences of Object.entries(
          foldersOccurrenceObj
        )) {
          let [folderName, occurrences] = folderNameAndOccurrences;

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

    const isFilePresent = unitFolders.some(
      (folder) => folder.name === unitFolder.name
    );

    if (!isFilePresent) {
      const file = {
        ...unitFolder,
        name: unitFolder.name,
        id: unitFolder.id,
        // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive
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
      corpora: "drive",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      driveId: process.env.GOOGLE_DRIVE_ID,
      q: `'${unitId}' in parents`,
      fields: "*",
    });

    if (!gdriveResponse.data?.files) {
      throw new CustomError(
        "Failed to get the root items of the target unit folder.",
        500
      );
    }

    const allChildFiles = await getFolderChildItems(gdriveResponse.data.files);

    return allChildFiles;
  } catch (error) {
    console.error(
      "Failed to get the target folder child items. Reason: ",
      error
    );

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
    .filter((folder) => folder?.mimeType?.includes("folder"))
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
    console.log("folderToCreate: ", folderToCreate);

    // if the folder is at the root of the parent folder
    if (folderToCreate.pathToFile === "") {
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

      console.log("folderCreationResult: ", folderCreationResult);

      const { folderId, wasSuccessful } = folderCreationResult;

      if (!wasSuccessful) {
        foldersFailedToCreate.push(folderToCreate.name);
      } else {
        createdFolders.push({
          id: folderId,
          gpFolderId: folderToCreate.fileId,
          name: folderToCreate.name,
          pathToFile: "",
          parentFolderId: folderToCreate.parentFolderId,
          originalFileId: folderToCreate.fileId,
          mimeType: folderToCreate.mimeType,
        });
      }

      continue;
    }

    // the id of the parent folder that was just created in the previous iteration
    const parentFolderId = createdFolders.find(
      (folder) => folder.gpFolderId === folderToCreate.parentFolderId
    )?.id;

    console.log("parentFolderId: ", parentFolderId);

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
    console.log("nestedFolderCreationResult: ", nestedFolderCreationResult);
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
    fields: "*",
  });

  return filePermissions.data.permissions?.find((permission) => {
    return permission.emailAddress === email;
  });
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
    console.error(
      "Failed to get item in Google Drive via service account. Reason: ",
      error
    );

    return null;
  }
};

export const getUnitGDriveChildItems = async (unitId: string) => {
  try {
    const drive = await createDrive();

    console.log(`Getting the GDrive child items for the unit: ${unitId}`);

    const gdriveResponse = await drive.files.list({
      corpora: "drive",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      driveId: process.env.GOOGLE_DRIVE_ID,
      q: `'${unitId}' in parents`,
      fields: "*",
    });

    if (!gdriveResponse.data?.files) {
      throw new CustomError(
        "Failed to get the root items of the target unit folder.",
        500
      );
    }

    console.log(
      `gdriveResponse.data.files.length: `,
      gdriveResponse.data.files
    );

    const allChildItems = await getFolderChildItems(gdriveResponse.data.files);

    return allChildItems;
  } catch (error) {
    console.error(
      "Failed to get the root items of the target unit folder. Reason: ",
      error
    );

    return null;
  }
};

export const getGoogleDriveItem = async (
  fileId: string,
  accessToken: string,
  tries = 3,
  willRetry = true
): Promise<{ id: string; [key: string]: unknown } | { errType: string }> => {
  try {
    const { status, data } = await axios.get<{
      id: string;
      [key: string]: unknown;
    }>(`https://www.googleapis.com/drive/v2/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        supportsAllDrives: true,
      },
    });

    if (status !== 200) {
      throw new CustomError(
        data ?? "Failed to retrieve Google Drive item.",
        status
      );
    }

    return data;
  } catch (error: any) {
    console.error("Failed to retrieve Google Drive item. Error: ", error);

    if (error?.response?.data?.error?.code === 404) {
      return {
        errType: "notFound",
      };
    }

    if (error?.response?.data?.error?.status === "UNAUTHENTICATED") {
      return {
        errType: "unauthenticated",
      };
    }

    if (error?.code === "ECONNABORTED" && tries > 0 && willRetry) {
      await waitWithExponentialBackOff(tries, [2_000, 5_000]);

      return await getGoogleDriveItem(fileId, accessToken, tries - 1);
    } else if (error?.code === "ECONNABORTED" && willRetry) {
      return {
        errType: "timeout",
      };
    }

    return {
      errType: "generalErr",
    };
  }
};

/**
 * Create a folder in the user's Google Drive account.
 * @param {string} folderName The name of the folder to create.
 * @param {string} accessToken The client side user's access token.
 * @param {string[]} parentFolderIds The ids of the folders to create the folder in.
 * @param {number} tries The number of tries to make. Default is 3.
 * @param {string} refreshToken The client side user's refresh token. If the user is not authenticated, it will be refreshed.
 * @param {string} reqOriginForRefreshingToken The origin of the request that triggered the refresh of the access token.
 * @return {Promise<{ wasSuccessful: boolean, folderId?: string, [key: string]: unknown }>} An object containing the results of the operation.
 * The object will contain the keys of `wasSuccessful`, `folderId`, and `errMsg` and `status` if the operation failed.
 * The `wasSuccessful` key will be set to `true` if the folder was successfully created. Otherwise, it will be set to `false`.
 * The `folderId` key will be set to the id of the created folder if the operation was successful.
 * The `errMsg` key will be set to the error message if the operation failed.
 * The `status` key will be set to the error status if the operation failed.
 * */
export const createGDriveFolder = async (
  folderName: string,
  accessToken: string,
  parentFolderIds: string[] = [],
  tries: number = 3,
  refreshToken?: string,
  reqOriginForRefreshingToken?: string,
  appProperties?: ConstructorParameters<typeof GDriveItem>["3"]
): Promise<{
  wasSuccessful: boolean;
  folderId?: string;
  [key: string]: unknown;
}> => {
  try {
    const folderMetadata = new GDriveItem(
      folderName,
      parentFolderIds,
      "application/vnd.google-apps.folder",
      appProperties
    );
    const response = await axios.post(
      "https://www.googleapis.com/drive/v3/files?fields=id",
      folderMetadata,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      throw new CustomError(
        response.data ?? "Failed to create a lesson folder.",
        response.status
      );
    }

    return { wasSuccessful: true, folderId: response.data.id };
  } catch (error: any) {
    console.error("Error object: ", error?.response?.data?.error);
    const errMsg = `Failed to create folder for the user. Reason: ${error?.response?.data?.error?.message}`;
    console.log("errMsg: ", errMsg);
    console.log("refreshToken: ", refreshToken);

    if (error?.response?.data?.error?.status === "UNAUTHENTICATED") {
      console.log("Will refresh the auth token...");

      tries -= 1;

      console.log("the user is not authenticated: ", refreshToken);

      const refreshTokenRes =
        (await refreshAuthToken(refreshToken, reqOriginForRefreshingToken)) ??
        {};
      const { accessToken } = refreshTokenRes;

      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }

      return await createGDriveFolder(
        folderName,
        accessToken,
        parentFolderIds,
        tries,
        refreshToken,
        origin
      );
    }

    return {
      wasSuccessful: false,
      errMsg: errMsg,
      status: error?.response?.data?.error?.status,
    };
  }
};

type TCopiedFile = { id: string; [key: string]: unknown };

export const copyGDriveItem = async (
  accessToken: string,
  parentFolderIds: string[],
  fileId: string,
  refreshToken: string,
  clientOrigin: string,
  tries = 3
): Promise<
  | TCopiedFile
  | { errType: string; errMsg?: string; status?: number; errorObj?: any }
> => {
  const reqBody = parentFolderIds ? { parents: parentFolderIds } : {};

  try {
    console.log("fileId, sup there: ", fileId);

    const { status, data } = await axios.post<TCopiedFile>(
      `https://www.googleapis.com/drive/v3/files/${fileId}/copy`,
      reqBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params: {
          supportsAllDrives: true,
        },
      }
    );

    if (status !== 200) {
      throw new Error(
        `Failed to copy a file with id ${fileId}. Status: ${status}`
      );
    }

    return data;
  } catch (error: any) {
    console.error("Failed to copy files with user. Reason: ", error);
    console.error(
      "Failed to copy files with user. Reason, keys: ",
      Object.keys(error)
    );
    const response = error.response;

    console.log("The response: ", response);
    console.log("The response errors: ", response?.data?.error);

    const { canRetry } = await getCanRetry(error, refreshToken, clientOrigin);

    if (canRetry && tries <= 0) {
      return {
        errType: "timeout",
      };
    }

    if (canRetry) {
      console.log("Retrying to copy files with user...");

      console.log(`The current tries are: ${tries}. Will pause...`);

      await waitWithExponentialBackOff(tries);

      tries -= 1;

      return await copyGDriveItem(
        accessToken,
        parentFolderIds,
        fileId,
        refreshToken,
        clientOrigin,
        tries
      );
    }

    if (response.status === 404) {
      return {
        errType: "notFound",
      };
    }

    return { errType: "generalErr", errorObj: error };
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
): Promise<{ id: string; [key: string]: unknown } | { errType: string }> => {
  try {
    const url = new URL(`https://www.googleapis.com/drive/v2/files/${fileId}`);

    if (urlParams?.length) {
      for (const [key, val] of urlParams) {
        url.searchParams.append(key, val);
      }
    }

    const { status, data } = await axios.get<{
      id: string;
      [key: string]: unknown;
    }>(url.href, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        supportsAllDrives: true,
      },
    });

    if (status !== 200) {
      throw new CustomError(
        data ?? "Failed to retrieve Google Drive item.",
        status
      );
    }

    return data;
  } catch (error: any) {
    console.error("Failed to retrieve Google Drive item. Error: ", error);
    console.log("The response errors: ", error?.response);

    if (error?.response?.data?.error?.code === 404) {
      return {
        errType: "notFound",
      };
    }

    if (error?.response?.data?.error?.status === "UNAUTHENTICATED") {
      return {
        errType: "unauthenticated",
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
        errType: "timeout",
      };
    }

    return {
      errType: "generalErr",
    };
  }
};

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

  console.log(`reqQueryParams.unit.id: ${unit.sharedGDriveId}`);

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

export const updatePermissionsForSharedFileItems = async (
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

type TSendMsgParams = Parameters<typeof sendMessage>;

export const copyFiles = async (
  fileIds: string[],
  email: string,
  drive: drive_v3.Drive,
  gDriveAccessToken: string,
  lessonFolderId: string,
  refreshAuthToken: string,
  clientOrigin: string,
  fileNames: string[],
  sendMessageToClient: (
    data: TCopyFilesMsg,
    willEndStream?: TSendMsgParams[2],
    delayMsg?: TSendMsgParams[3]
  ) => void
) => {

  let wasJobSuccessful = true;
  // check if the permission were propagated to all of the files to copy
  for (const fileIdIndex in fileIds) {
    const fileId = fileIds[fileIdIndex];
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

    if ("id" in fileCopyResult && fileCopyResult.id && fileNames[fileIdIndex]) {
      console.log(`Successfully copied file ${fileNames[fileIdIndex]}`);
      sendMessageToClient({
        fileCopied: fileNames[fileIdIndex],
      });
    } else if (fileNames[fileIdIndex] && fileCopyResult?.errType) {
      wasJobSuccessful = false;
      console.error(
        `Failed to copy file ${fileNames[fileIdIndex]} for user with email ${email}. Reason: `,
        fileCopyResult
      );
      sendMessageToClient({
        failedCopiedFile: fileNames[fileIdIndex],
      });
    }
    // console.log("fileCopyResult: ", fileCopyResult.status);
  }

  return wasJobSuccessful
};

export const addNewGDriveLessonToTargetUser = async (
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
