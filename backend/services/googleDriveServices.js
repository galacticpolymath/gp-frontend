/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable semi */
import { waitWithExponentialBackOff } from "../../globalFns";
import axios from "axios";
import { GoogleAuthReqBody } from "../../pages/api/gp-plus/auth";
import { getCacheVal } from "../helperFns";

export class FileMetaData {
  constructor(
    folderName,
    parents = [],
    mimeType = "application/vnd.google-apps.folder"
  ) {
    this.name = folderName;
    this.parents = parents;
    this.mimeType = mimeType;
  }
}

export class Credentials {
  constructor() {
    const {
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
      GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
      GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
      GOOGLE_SERVICE_ACCOUNT_AUTH_URI,
      GOOGLE_SERVICE_ACCOUNT_TOKEN_URI,
      GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
      GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    } = process.env;

    this.type = "service_account";
    this.project_id = GOOGLE_SERVICE_ACCOUNT_PROJECT_ID;
    this.private_key_id = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID;
    this.private_key = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    this.client_email = GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
    this.client_id = GOOGLE_SERVICE_ACCOUNT_CLIENT_ID;
    this.auth_uri = GOOGLE_SERVICE_ACCOUNT_AUTH_URI;
    this.token_uri = GOOGLE_SERVICE_ACCOUNT_TOKEN_URI;
    this.auth_provider_x509_cert_url =
      GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL;
    this.client_x509_cert_url = GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL;
    this.universe_domain = "googleapis.com";
  }
}

export class GoogleServiceAccountAuthCreds {
  constructor() {
    this.type = "service_account";
    this.project_id = "gp-frontend-391915";
    this.private_key_id = "8dc9a39284181bf8e9b820fc177dc3e470be1a95";
    this.private_key = process.env.GDRIVE_WORKER_KEY;
    this.client_email =
      "gdrive-worker@gp-frontend-391915.iam.gserviceaccount.com";
    this.client_id = "118385108168850461818";
    this.auth_uri = "https://accounts.google.com/o/oauth2/auth";
    this.token_uri = "https://oauth2.googleapis.com/token";
    this.auth_provider_x509_cert_url =
      "https://www.googleapis.com/oauth2/v1/certs";
    this.client_x509_cert_url =
      "https://www.googleapis.com/robot/v1/metadata/x509/gdrive-worker%40gp-frontend-391915.iam.gserviceaccount.com";
    this.universe_domain = "googleapis.com";
  }
}

/**
 * Get the google drive folders.
 * @param{string} folderId The id of the file.
 * @param{drive_v3.Drive} googleService google drive service object
 * @return{Promise<[] | null>} An array of the permission ids if successful. Otherwise, it will return null.
 * */
export const getGoogleDriveFolders = async (googleService, folderId) => {
  try {
    const response = await googleService.files.list({
      corpora: "drive",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      driveId: process.env.GOOGLE_DRIVE_ID,
      q: `'${folderId}' in parents`,
    });

    return response.data.files;
  } catch (error) {
    console.error("Failed to get the root folders of drive. Reason: ", error);

    return null;
  }
};

/**
 * Share the google drive file with a user.
 * @param{string} driveId The id of the file.
 * @param{drive_v3.Drive} googleService google drive service object
 * @return{Promise<[] | null>} An array of the permission ids if successful. Otherwise, it will return null.
 * */
export const listFilesOfGoogleDriveFolder = (
  googleService,
  driveId,
  queryObj = { q: "" }
) => {
  try {
    const files = googleService.files.list({
      corpora: "drive",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      driveId: driveId,
      ...queryObj,
    });

    return files;
  } catch (error) {
    console.error("Failed to get files from google drive. Reason: ", error);

    return null;
  }
};

export const shareFilesWithRetries = async (
  files,
  userEmail,
  drive,
  tries = 3
) => {
  try {
    console.log("Current try: ", tries);
    console.log("Files to share: ", files.length);

    if (tries === 0) {
      return { wasSuccessful: false };
    }

    const shareFilePromises = [];

    for (const file of files) {
      console.log("file name: ", file.name);
      const shareFilePromise = drive.permissions.create({
        resource: {
          type: "user",
          role: "writer",
          emailAddress: userEmail,
        },
        fileId: file.id,
        fields: "id",
        corpora: "drive",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        sendNotificationEmail: false,
        driveId: process.env.GOOGLE_DRIVE_ID,
      });

      shareFilePromises.push(shareFilePromise);
    }

    const sharedFilesResults = await Promise.allSettled(shareFilePromises);
    const failedShareFilesIndices = new Set();

    for (const resultIndex in sharedFilesResults) {
      const result = sharedFilesResults[resultIndex];

      console.log("Share file result.value: ", result.value);
      console.log("Share file result.status: ", result.status);
      console.log("Share file result.reason: ", result.reason);
      const targetFile = files[parseInt(resultIndex)];
      console.log("The target file: ", targetFile);
      console.log("Shared file: ", targetFile.name);


      if (
        result.status == "rejected" &&
        result?.reason?.response?.data?.error?.code === 400
      ) {
        console.log("Name of restricted file: ", targetFile.name);

        console.error(result?.reason?.response);
        console.error("result?.reason?.response?.data?.error?.errors: ");
        console.error(result?.reason?.response?.data?.error?.errors);
        console.error("This file is restricted. Skipping it.");
        continue;
      } else if (result.status === "rejected") {
        console.log("Failed shared file: ", targetFile.name);

        console.error("Error reasons: ");
        console.error(result.reason);
        console.error("Error response: ");
        console.error(result?.reason?.response);
        console.error("result?.reason?.response?.data?.error?.errors: ");
        console.error(result?.reason?.response?.data?.error?.errors);
        failedShareFilesIndices.add(parseInt(resultIndex));
      }
      console.log("Successful file share: ", targetFile.name);
    }

    if (failedShareFilesIndices.size) {
      const failedFilesToShare = files.filter((_, index) =>
        failedShareFilesIndices.has(index)
      );
      console.log("failedFilesToShare: ", failedFilesToShare.length);

      tries -= 1;

      waitWithExponentialBackOff(tries, [1000, 5_500]);

      console.log("Current tries: ", tries);

      return await shareFilesWithRetries(
        failedFilesToShare,
        userEmail,
        drive,
        tries
      );
    }

    return { wasSuccessful: true };
  } catch (error) {
    console.error("Failed to share files with user. Reason: ", error);

    return { wasSuccessful: false };
  }
};

/**
 * Copy a google drive file into a folder (if specified).
 * @param {string} fileId The id of the file.
 * @param {string[]} parentFolderIds The ids of the folders to copy the files into.
 * @param {string} accessToken The client side user's access token.
 * @param {number} tries Default is 3
 * @return {Promise<AxiosResponse<any, any>> | { errType: string }} An object contain the results and optional message.
 * */
export const copyFile = async (accessToken, parentFolderIds, fileId, tries = 3) => {
  const reqBody = parentFolderIds ? { parents: parentFolderIds } : {};

  try {
    console.log("fileId, sup there: ", fileId);
    
    return await axios.post(
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
  } catch (error) {
    console.error("Failed to copy files with user. Reason: ", error);
    console.error("Failed to copy files with user. Reason, keys: ", Object.keys(error));
    const response = error.response;

    console.log("The response: ", response);
    console.log("The response errors: ", response?.data?.error);

    const didTimeoutOccur =
      error?.code === "ECONNABORTED" ||
      error?.response?.status === 408 ||
      error?.message?.includes("timeout") || response?.data?.error?.message === "Internal Error";

    if (didTimeoutOccur && tries <= 0) {
      return {
        errType: "timeout"
      }
    }

    if (didTimeoutOccur) {
      console.log("Retrying to copy files with user...");
      await waitWithExponentialBackOff(tries);

      return await copyFile(accessToken, parentFolderIds, fileId, tries - 1);
    }
    
    
    if (response.status) {
      return {
        errType: "notFound"
      }
    }


    return { errType: "generalErr" }
  }
};

export const copyFiles = async (
  files,
  createdFolders,
  accessToken,
  tries = 3,
  updateClient,
  fileCopies = [],
  copyUnitJobId
) => {
  console.log("copyUnitJobId: ", copyUnitJobId);
  /** @type {Promise<AxiosResponse<any, any>>[]} */
  const copiedFilesPromises = [];
  const jobStatus = await getCacheVal(`copyUnitJobStatus-${copyUnitJobId}`)

  console.log("copyFiles, jobStatus: ", jobStatus);
  

  if (!jobStatus || jobStatus === "stopped") {
    return {
      wasSuccessful: false,
      errType: "clientCanceled"
    }
  }

  for (const file of files) {
    const parentFolderId = createdFolders.find(
      (folder) => folder.gpFolderId === file.parentFolderId
    )?.id;

    if (!parentFolderId) {
      console.error(
        `The parent folder for '${file.name}' file does not exist.`
      );
      continue;
    }

    copiedFilesPromises.push(
      copyFile(accessToken, [parentFolderId], file.id)
    );
  }

  const copiedFilesResult = await Promise.allSettled(copiedFilesPromises);
  const failedCopiedFilesIndices = new Set();

  for (const index in copiedFilesResult) {
    const result = copiedFilesResult[index];

    console.log("result, what is up there: ", result);
    console.log("result?.reason: ", result?.reason);

    if (result?.value?.errType === "notFound") {
      failedCopiedFilesIndices.add(parseInt(index));
      continue;
    }

    if (result.status === "rejected" ) {
      failedCopiedFilesIndices.add(parseInt(index));
      continue;
    }

    const originalFileObj = files[index];

    console.log("File copy result, result?.value?.data: ", result?.value?.data);

    if (
      result?.value?.data?.id &&
      result?.value?.data?.name &&
      !fileCopies.find((file) => file.id === result?.value?.data.id)
    ) {
      const name = result?.value?.data?.name.replace(/Copy of/, "").trim();

      fileCopies.push({
        id: result?.value?.data?.id,
        name,
      });
    }

    updateClient({ fileCopied: originalFileObj.name });
  }

  if (failedCopiedFilesIndices.size) {
    console.error(
      "Failed to copy files length: ",
      failedCopiedFilesIndices.size
    );
    const failedCopiedFiles = files.filter((_, index) =>
      failedCopiedFilesIndices.has(index)
    );

    console.log("files to copy, after failure: ", failedCopiedFiles.length);

    tries -= 1;

    console.error("Current trie: ", tries);

    if (tries > 0) {
      await waitWithExponentialBackOff(tries);

      return await copyFiles(
        failedCopiedFiles,
        createdFolders,
        accessToken,
        tries,
        updateClient,
        fileCopies,
        copyUnitJobId
      );
    }

    console.error("Retries limit reached. Failed to copy unit.");

    return { wasSuccessful: false, };
  }

  console.log("Successfully copied all files.");

  return { wasSuccessful: true, fileCopies };
};

export const refreshAuthToken = async (refreshToken, origin, tries = 3) => {
  try {
    console.log("Refreshing auth token...");

    const reqBody = new GoogleAuthReqBody(
      `${origin}/google-drive-auth-result`,
      undefined,
      refreshToken
    );
    console.log("Refresh auth token request body: ", reqBody);
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      reqBody
    );

    return {
      wasSuccessful: true,
      accessToken: response.data.access_token,
    };
  } catch (error) {
    console.error("Error refreshing access token: ", error.response);
    console.log("Error dir: ");
    console.dir(error);

    const didTimeoutOccur =
      error?.code === "ECONNABORTED" ||
      error?.response?.status === 408 ||
      error?.message?.includes("timeout");

    if (didTimeoutOccur && tries > 0) {
      console.log("Timeout occurred while refreshing token. Will retry.");

      await waitWithExponentialBackOff(tries, 2_000, 5_000);

      return refreshAuthToken(refreshToken, origin, tries);
    }

    return {
      wasSuccessful: false,
      error: error.message,
    };
  }
};

/**
 * Delete a Google Drive item (file or folder).
 * @param {string} fileId The id of the file or folder to delete.
 * @param {string} accessToken The client side user's access token.
 * @return {Promise<{wasSuccessful: boolean, error?: string}>} An object indicating success or failure.
 */
export const deleteGoogleDriveItem = async (fileId, accessToken) => {
  try {
    console.log(`Attempting to delete Google Drive item with ID: ${fileId}`);

    await axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        supportsAllDrives: true,
      },
    });

    console.log(`Successfully deleted Google Drive item with ID: ${fileId}`);

    return { wasSuccessful: true };
  } catch (error) {
    console.error(
      `Failed to delete Google Drive item with ID: ${fileId}. Reason:`,
      error
    );

    return {
      wasSuccessful: false,
      error: error.message,
    };
  }
};
