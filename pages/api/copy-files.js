/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
import { getGoogleAuthJwt } from '../../backend/utils/auth';
import { google, drive_v3 } from 'googleapis';
import fs from 'fs'
import { CustomError } from '../../backend/utils/errors';
import axios from 'axios';
import { FileMetaData, generateGoogleAuthJwt, getGpGoogleDriveService, listFilesOfGoogleDriveFolder } from '../../backend/services/googleDriveServices';

const getUserDriveFiles = (accessToken, nextPageToken) => axios.get(
    'https://www.googleapis.com/drive/v3/files',
    {
        params: {
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
            ...(nextPageToken ? { pageToken: nextPageToken } : {})
        },
        headers:
        {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    })

/**
 * Get all of the files for the target user.
 * @param{string} accessToken The client side user's access token.
 * @param{drive_v3.Drive} service google drive service object
 * @return{Promise< any[] | null>} An object contain the results and optional message.
 * */
const listAllUserFiles = async (accessToken, nextPageToken, startingFiles = []) => {
    try {
        const response = await getUserDriveFiles(accessToken, nextPageToken)
        const { status, data } = response;
        let files = data.files;
        files = startingFiles?.length ? [...startingFiles, ...files] : files

        if (status !== 200) {
            throw new CustomError('Failed to get user google drive files.', status)
        }

        if (data.nextPageToken) {
            files = await listAllUserFiles(accessToken, nextPageToken, files);
        }


        return files;
    } catch (error) {
        console.error('An error has occurred in listing all of the user files: ', error)

        return null;
    }
}

/**
 * Copy a google drive file into a folder (if specified).
 * @param{string} fileId The id of the file.
 * @param{string[]} folderIds The ids of the folders to copy the files into.
 * @param{string} accessToken The client side user's access token.
 * @param{drive_v3.Drive} service google drive service object
 * @return{Promise<{ wasSuccessful: boolean }>} An object contain the results and optional message.
 * */
const copyFile = async (fileId, folderIds, accessToken) => {
    try {
        const reqBody = folderIds ? { parents: folderIds } : {};
        const response = await axios.post(
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


        if (response.status !== 200) {
            throw new CustomError("Failed to copy the files into the user's google drive.", response.status)
        }

        return { wasSuccessful: true, msg: response.data };
    } catch (error) {
        const errMsg = `Failed to create folder for the user. Reason: ${error.response.data.error}`;

        return { wasSuccessful: false }
    }
}

/**
 * Share the google drive file with a user.
 * @param{string} fileId The id of the file.
 * @param{{ type: string, role: string, emailAddress: string }[]} permissions Permissions for the user to access the file
 * @param{drive_v3.Drive} service google drive service object
 * @return{Promise<list | null>} An array of the permission ids if successful. Otherwise, it will return null.
 * */
const shareFile = async (fileId, service, permissions) => {
    try {
        const permissionIds = [];

        for (const permission of permissions) {
            try {
                const result = await service.permissions.create({
                    resource: permission,
                    fileId: fileId,
                    fields: 'id',
                    corpora: 'drive',
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                    driveId: process.env.GOOGLE_DRIVE_ID
                });
                permissionIds.push(result.data.id);

                console.log(`Inserted permission id: ${result.data.id}`);
            } catch (err) {
                console.error('Failed to share the file with the user. Reason: ', err);
            }
        }

        return permissionIds;
    } catch (error) {
        const errMsg = `Failed to share the file with the target user.`
        console.log('errMsg: ', errMsg)
        console.log(error.response.data.error)

        return null;
    }
}

const retrieveGoogleDriveFolder = async () => {

}


/**
 * Share the google drive file with a user.
 * @param{string} driveId The id of the file.
 * @param{drive_v3.Drive} googleService google drive service object
 * @return{Promise<[] | null>} An array of the permission ids if successful. Otherwise, it will return null.
 * */
const retrieveGoogleFoldersAndFiles = async (
    gooogleService,
    queryObj,
    unitDriveId,
    startingFilesAndFoldersFromDrive = [],
    startingfilesAndFoldersFromDriveModified = []
) => {
    // NOTES:
    // get the files from the drive via the id of the google drive 
    // the files has been retreived 
    // 1) loop through the files
    // 2) for each iteration, if the value is a file, then push it into the filesAndFolder array as follows: { fileId, fileName, parentFoldeName }
    // 3) if the value is a folder, push the following into filesAndFolders: { folderId, folderName, parentFolderName  } 
    // 4) if the value is a folder, make a request to get the files for that folder within the getFileOfFolder function
    // 5) the files for that folder has been received within the getFilesOfFolder function
    // repeat steps 1 thorugh 5 for all of the values in the filesAndFoldersFromDrive 
    let filesAndFoldersFromDrive = []
    let filesAndFoldersFromDriveModified = []

    const getDataFromFolder = () => {

    }




}

const createGoogleDriveFolderForUser = async (folderName, accessToken, parentFolderIds) => {
    try {
        const folderMetadata = parentFolderIds ? new FileMetaData(folderName, parentFolderIds) : new FileMetaData(folderName)
        const response = await axios.post(
            'https://www.googleapis.com/drive/v3/files?fields=id',
            folderMetadata,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        if (response.status !== 200) {
            throw new CustomError(response.data ?? 'Failed to create a lesson folder.', response.status)
        }

        return { wasSuccessful: true, folderId: response.data.id }
    } catch (error) {
        const errMsg = `Failed to create folder fo the user. Reason: ${error.response.data.error}`
        console.log('errMsg: ', errMsg)

        return { wasSuccessful: false, errMsg: errMsg }
    }
}

const CREDENTIALS_PATH = 'credentials2.json';
const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

class Credentials {
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
        } = process.env

        this.type = 'service_account'
        this.project_id = GOOGLE_SERVICE_ACCOUNT_PROJECT_ID
        this.private_key_id = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID
        this.private_key = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
        this.client_email = GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL
        this.client_id = GOOGLE_SERVICE_ACCOUNT_CLIENT_ID
        this.auth_uri = GOOGLE_SERVICE_ACCOUNT_AUTH_URI
        this.token_uri = GOOGLE_SERVICE_ACCOUNT_TOKEN_URI
        this.auth_provider_x509_cert_url = GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL
        this.client_x509_cert_url = GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL
        this.universe_domain = "googleapis.com"
    }
}

export default async function handler(request, response) {
    try {
        if (!request.body.accessToken) {
            throw new CustomError('access token was not provided.', 400);
        }

        if (!request.body.email) {
            throw new CustomError('The email  was not provided.', 400);
        }
        if (!request.body.unitDriveId) {
            throw new CustomError('The email  was not provided.', 400);
        }

        // if (!request.query.fileNames || (typeof request.query.fileNames !== 'string') || ((typeof request.query.fileNames === 'string') && !getIsTypeValid(JSON.parse(request.query.fileNames), 'object'))) {
        //     throw new CustomError(`"fileName" field is invalid. Received: ${request.query.fileNames}`, 400);
        // }

        // const fileNames = JSON.parse(request.query.fileNames)

        const googleAuthJwt = generateGoogleAuthJwt()
        const googleService = google.drive({ version: 'v3', auth: googleAuthJwt });

        const getTargetFolder = (folderName, folders) => {
            const targetFolder = folders.find(folder => {
                const folderEntries = Array.from(folder.entries())
                const isCorrectFolder = folderEntries.some(entry => entry[0].folderName === folderName)

                return isCorrectFolder
            });

            return targetFolder
        }
        const getGooglDriveFolders = async (folderId) => {
            try {
                const response = await googleService.files.list({
                    corpora: 'drive',
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                    driveId: process.env.GOOGLE_DRIVE_ID,
                    q: `'${folderId}' in parents`
                })


                return response.data.files
            } catch (error) {
                console.error('Failed to get the root folders of drive.')

                return null;
            }
        }


        const rootDriveFolders = await getGooglDriveFolders(request.body.unitDriveId)
        let unitFolders = [...rootDriveFolders.map(folder => ({ name: folder.name, id: folder.id, mimeType: folder.mimeType, pathToFile: 'root' }))]

        for (const unitFolder of unitFolders) {
            if (unitFolder.mimeType.includes("folder") && (unitFolder.pathToFile && (unitFolder.pathToFile !== 'root'))) {
                const folderDataResponse = await googleService.files.list({
                    corpora: 'drive',
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                    driveId: process.env.GOOGLE_DRIVE_ID,
                    q: `'${unitFolder.id}' in parents`
                });
                const folderData = folderDataResponse.data.files.map(file => {
                    return {
                        ...file,
                        name: file.name,
                        id: file.id,
                        mimeType: file.mimeType,
                        pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`
                    }
                })

                unitFolders.push(...folderData)
                continue
            }

            if (unitFolder.mimeType.includes("folder")) {
                const folderDataResponse = await googleService.files.list({
                    corpora: 'drive',
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                    driveId: process.env.GOOGLE_DRIVE_ID,
                    q: `'${unitFolder.id}' in parents`
                });
                const folderData = folderDataResponse.data.files.map(file => {
                    return {
                        ...file,
                        name: file.name,
                        id: file.id,
                        mimeType: file.mimeType,
                        pathToFile: unitFolder.name
                    }
                })

                unitFolders.push(...folderData)
                continue
            }

            const isFilePresent = unitFolders.some(folder => folder.name === unitFolder.name)

            if (!isFilePresent) {
                const file = {
                    ...unitFolder,
                    name: unitFolder.name,
                    id: unitFolder.id,
                    parentFolderId: "",
                    mimeType: unitFolder.mimeType,
                    pathToFile: unitFolder.pathToFile ? `${unitFolder.pathToFile}/${unitFolder.name}` : unitFolder.name
                }

                unitFolders.push(file)
            }
        }

        console.log("unitFolders.length: ", unitFolders.length)

        const userFiles = await googleService.files.list({
            corpora: 'drive',
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
            driveId: process.env.GOOGLE_DRIVE_ID
        })

        console.log('user files: ', userFiles)

        // MAIN GOAL: create the main folder of the unit with all of the subfolders
        // the sub-folders are created 
        // get all of the folders in the user's drive
        // for each value, if the path is nested split the string bh '/
        // loop through the array
        // get an array of all of the paths for the folders

        return response.json({
            data: unitFolders
        });
    } catch (error) {
        console.error('An error has occurred. Error: ', error)
        return response.status(500).json({ msg: `Failed to download GP lessons. Reason: ${error}` });
    }
}