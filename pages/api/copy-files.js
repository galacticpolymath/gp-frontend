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
 * Searches through the user's google drive.
 * @param{string} accessToken Access token for user's google drive. The client must send this.
 * @param{string} searchQuery The query for the user's google drive.
 * @return{Promise<any[] | null>} An array of searched folders and files. Otherwise, it will return null if an error has occurred.
 * */
const searchUserGoogleDrive = async (accessToken, searchQuery) => {
    try {
        const response = await axios.get('https://www.googleapis.com/drive/v3/files',
            {
                params: { q: searchQuery },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        console.log('response.data: ', response.data)

        return [...(response?.data?.files ?? [])]
    } catch (error) {
        console.error('Failed to search google drive of user. Reason: ', error)

        return null;
    }
}

const createGoogleDriveFolderForUser = async (folderName, accessToken, parentFolderIds = []) => {
    try {
        const folderMetadata = new FileMetaData(folderName, parentFolderIds);
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
            throw new CustomError('The email was not provided.', 400);
        }

        if (!request.body.unitDriveId) {
            throw new CustomError('The id of the drive was not provided.', 400);
        }

        if (!request.body.unitName) {
            throw new CustomError('The the name of the unit was not provided.', 400);
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
                        // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive 
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
                        // get the id of the folder in the user's google drive in order to copy the file or folder into the specific folder of the user's drive 
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
                    // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive 
                    mimeType: unitFolder.mimeType,
                    pathToFile: unitFolder.pathToFile ? `${unitFolder.pathToFile}/${unitFolder.name}` : unitFolder.name
                }

                unitFolders.push(file)
            }
        }

        const searchGoogleDriveUnitFolders = await searchUserGoogleDrive(request.body.accessToken, `name = "${request.body.unitName} COPY"`)
        let unitFolderId = searchGoogleDriveUnitFolders?.[0]?.id


        if (!searchGoogleDriveUnitFolders?.length) {
            const { folderId, errMsg } = await createGoogleDriveFolderForUser(`${request.body.unitName} COPY`, request.body.accessToken)

            if (errMsg) {
                throw new CustomError(errMsg, 500)
            }

            unitFolderId = folderId
        }

        const folderPaths = [...new Set(unitFolders.filter(folder => folder.pathToFile !== 'root').map(folder => folder.pathToFile))]
        let foldersFailedToCreate = []
        /** @type {{ id: string, name: string }[]} */
        let createdFolders = []

        for (const folderPath of folderPaths) {
            const folderPathSplitted = folderPath.split('/')
            const folderName = folderPathSplitted.at(-1)

            if (folderPathSplitted.length === 1) {
                // creating the folders at the root of the unit folder
                const { folderId, wasSuccessful } = await createGoogleDriveFolderForUser(folderName, request.body.accessToken, [unitFolderId])

                if (!wasSuccessful) {
                    foldersFailedToCreate.push(folderName)
                } else {
                    createdFolders.push({ id: folderId, name: folderName })
                }

                continue
            }

            const parentFolder = folderPathSplitted.at(-2)
            const parentFolderId = createdFolders.find(folder => folder.name === parentFolder)?.id

            if (!parentFolderId) {
                foldersFailedToCreate.push(folderName)
                continue
            }

            const { folderId, wasSuccessful } = await createGoogleDriveFolderForUser(folderName, request.body.accessToken, [parentFolderId])

            if (!wasSuccessful) {
                foldersFailedToCreate.push(folderName)
                continue
            }

            createdFolders.push({ id: folderId, name: folderName })
        }

        console.log("createdFolders: ", createdFolders)


        // CASE: the folder path does not have '/' in it.
        // GOAL: create the folder at the root of the unit folder

        // CASE: the folder does have '/' in it. 
        // GOAL: create the folder within the parent folder
        // push the following into folderNamesAndIds array: { name, id }
        // get the id of the folder
        // create the folder within the parent folder
        // query the object, get the id of the folder
        // the target parent folder object is found in the array that keeps tracks of the folder name and its id






        // FOR APP:
        // CASES: the folder that is being copied, there could be duplicate names in the user's google drive

        // CASE: the unit that the user is trying to copy does not exist in the user's google drive
        // GOAL: create the unit folder in the user's google drive


        // MAIN GOAL: create all of the subfolders for the unit
        // the sub-folders are created
        // push the folder name and the id of the folder into the folders array
        // get the id of the folder
        // the folder has been created
        // if x is at the root, then create the folder at the root of the unit (get the id of the unit folder in the user's google drive) 
        // if the folder does not exist, then loop through the folder names splitted, call it y and each iteration of y, x
        // CHECK IF THE FOLDER ALREADY EXIST IN THE USER'S GOOGLE DRIVE BY USING THE NAME OF THE FOLDER "name = '{the name of the folder}'"
        // for each value, if the path is nested, split the string by '/'
        // loop through the array
        // get an array of all of the paths for the folders as follows: (the string for 'unitFolderId')[]

        // GOAL: copy all of the files into their folders
        // the file has been copied into the target folder
        // get the google id of the target folder
        // the target folder has been retrieved
        // using the name of the parent folder find the target folder in the folders array 
        // the parent folder has been attained
        // get the last element of the split array, this will be the parent folder
        // split the path string into an array

        return response.json({
            data: unitFolders
        });
    } catch (error) {
        console.error('An error has occurred. Error: ', error)
        return response.status(500).json({ msg: `Failed to download GP lessons. Reason: ${error}` });
    }
}