/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable semi */
import fs from "fs";
import { getGoogleAuthJwt } from "../utils/auth";
import { waitWithExponentialBackOff } from "../../globalFns";
import axios from "axios";

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
 * Create a service object that will access the company's google drive.
 *  @return {import('google-auth-library').JWT | null} Returns google auth jwt. Else, null will be returned.
 * */
export const generateGoogleAuthJwt = () => {
    try {
        let credentials = new Credentials();
        credentials = JSON.stringify(credentials);
        let credentialsSplitted = credentials.split("");
        let indexesOfValsToDel = [];

        for (let index = 0; index < credentialsSplitted?.length; index++) {
            const nextVal = credentialsSplitted[index + 1];

            if (nextVal === undefined) {
                break;
            }

            const currentVal = credentialsSplitted[index];

            if (currentVal === "\\" && nextVal === "\\") {
                indexesOfValsToDel.push(index);
            }
        }

        credentialsSplitted = credentialsSplitted.filter(
            (_, index) => !indexesOfValsToDel.includes(index)
        );
        credentials = credentialsSplitted.join("");

        fs.writeFileSync("credentials.json", credentials);

        const googleAuthJwt = getGoogleAuthJwt("credentials.json", [
            "https://www.googleapis.com/auth/drive",
        ]);

        return googleAuthJwt;
    } catch (error) {
        console.error(
            "Failed to retrieve the google drive service object. Reason: ",
            error
        );

        return null;
    } finally {
        fs.unlinkSync("credentials.json");
    }
};

/**
 * Share the google drive file with a user.
 * @param{string} driveId The id of the file.
 * @param{drive_v3.Drive} googleService google drive service object
 * @return{Promise<[] | null>} An array of the permission ids if successful. Otherwise, it will return null.
 * */
export async function listFilesOfGoogleDriveFolder(
    googleService,
    driveId,
    queryObj = { q: "" }
) {
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
}

export async function shareFilesWithRetries(files, userEmail, googleService, tries = 0) {
    try {
        console.log("Current try: ", tries);
        console.log("Files to share: ", files.length);
        
        if (tries > 8) {
            return { wasSuccessful: false };
        }

        const shareFilePromises = [];

        for (const file of files) {
            const shareFilePromise = googleService.permissions.create({
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
                driveId: process.env.GOOGLE_DRIVE_ID,
            });

            shareFilePromises.push(shareFilePromise);
        }

        const sharedFilesResults = await Promise.allSettled(shareFilePromises);
        const failedShareFilesIndices = new Set();

        for (const resultIndex in sharedFilesResults) {
            const result = sharedFilesResults[resultIndex];

            console.log("Result, yo there: ", result);

            if (result.status === "rejected") {
                failedShareFilesIndices.add(parseInt(resultIndex));
            }
        }


        if (failedShareFilesIndices.size) {
            const failedFilesToShare = files.filter((_, index) => failedShareFilesIndices.has(index));
            console.log("failedFilesToShare: ", failedFilesToShare.length);
            tries = await waitWithExponentialBackOff(tries, [1000, 7_000]);

            return await shareFilesWithRetries(failedFilesToShare, userEmail, googleService, tries);
        }

        return { wasSuccessful: true };
    } catch (error) {
        console.error("Failed to share files with user. Reason: ", error);

        return { wasSuccessful: false };
    }
}

/**
 * Copy a google drive file into a folder (if specified).
 * @param {string} fileId The id of the file.
 * @param {string[]} folderIds The ids of the folders to copy the files into.
 * @param {string} accessToken The client side user's access token.
 * @return {Promise<AxiosResponse<any, any>>} An object contain the results and optional message.
 * */
const getCopyFilePromise = (accessToken, folderIds, fileId) => {
    const reqBody = folderIds ? { parents: folderIds } : {};

    return axios.post(
        `https://www.googleapis.com/drive/v3/files/${fileId}/copy`,
        reqBody,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: {
                supportsAllDrives: true,
            }
        }
    )
}

export async function copyFiles(files, createdFolders, accessToken, tries = 0, updateClient) {
    if (tries > 10) {
        console.error("Failed to copy files. Reached max tries.");
        return { wasSuccessful: false };
    }

    /** @type {Promise<AxiosResponse<any, any>>[]} */
    const copiedFilesPromises = [];

    for (const file of files) {
        const parentFolderId = createdFolders.find(folder => folder.gpFolderId === file.parentFolderId)?.id

        if (!parentFolderId) {
            console.error(`The parent folder for '${file.name}' file does not exist.`)
            continue
        }

        copiedFilesPromises.push(getCopyFilePromise(accessToken, [parentFolderId], file.id))
    }

    const copiedFilesResult = await Promise.allSettled(copiedFilesPromises);
    const failedCopiedFilesIndices = new Set();

    for (const index in copiedFilesResult) {
        const result = copiedFilesResult[index];

        if (result.status === "rejected") {
            failedCopiedFilesIndices.add(parseInt(index));
            continue;
        }

        const file = files[index];

        console.log("file: ", file);

        updateClient({ fileCopied: file.name })
    }

    console.log("failedCopiedFilesIndices: ", failedCopiedFilesIndices)

    if (failedCopiedFilesIndices.size) {
        console.error("Failed to copy files length: ", failedCopiedFilesIndices.size);
        const failedCopiedFiles = files.filter((_, index) => failedCopiedFilesIndices.has(index));
        console.log("files to copy, after failure: ", failedCopiedFiles.length);
        tries = await waitWithExponentialBackOff(tries);


        return await copyFiles(failedCopiedFiles, createdFolders, accessToken, tries);
    }

    console.log("Successfully copied all files.");

    return { wasSuccessful: true };
}
