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
 * @return{Promise<any[] | null>} An array of the permission ids if successful. Otherwise, it will return null.
 * */
const shareFile = async (fileId, service, permissions) => {
    console.log('fileId: ', fileId)
    let permissionIdsForFile = []

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
            permissionIdsForFile.push({ fileId: fileId, permissionId: result.data.id });

            console.log(`Inserted permission id: ${result.data.id}`);
        } catch (err) {
            console.error(`Failed to share file '${fileId}' with the user. Reason: `, err);
        }
    }

    return permissionIdsForFile?.length ? permissionIdsForFile : null;
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
            const parentFolderAlternativeName = unitFolder.alternativeName

            if (unitFolder.mimeType.includes("folder") && (unitFolder.pathToFile && (unitFolder.pathToFile !== 'root'))) {
                const folderDataResponse = await googleService.files.list({
                    corpora: 'drive',
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                    driveId: process.env.GOOGLE_DRIVE_ID,
                    q: `'${unitFolder.id}' in parents`
                });
                const folders = folderDataResponse.data.files.filter(file => file.mimeType.includes('folder'))
                /** @type {{ [key: string]: any[] } | null} */
                let foldersOccurrenceObj = null;

                if (folders.length) {
                    foldersOccurrenceObj = folders.reduce((allFoldersObj, folderA, _, self) => {
                        const foldersWithTheSameName = self.filter(folderB => folderA.name === folderB.name)
                        allFoldersObj[folderA.name] = foldersWithTheSameName;

                        return allFoldersObj
                    }, {})

                    // if a folder has duplicate names, give it a alternative name in order to differentiate it from the rest of the folders
                    for (const folderNameAndOccurrences of Object.entries(foldersOccurrenceObj)) {
                        let [folderName, occurrences] = folderNameAndOccurrences;

                        if (occurrences.length === 1) {
                            continue
                        }

                        foldersOccurrenceObj[folderName] = occurrences.map((folderOccurrence, index) => ({
                            ...folderOccurrence,
                            alternativeName: `${folderOccurrence.name} ${index + 1}`
                        }))
                    }
                }

                console.log('foldersOccurrenceObj, sup there meng: ', foldersOccurrenceObj)


                const folderFilesAndFolders = folderDataResponse.data.files.map(file => {
                    if (!file.mimeType.includes('folder') || !foldersOccurrenceObj || !foldersOccurrenceObj?.[file.name] || (foldersOccurrenceObj?.[file.name]?.length === 1)) {
                        return {
                            ...file,
                            name: file.name,
                            id: file.id,
                            // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive 
                            mimeType: file.mimeType,
                            pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`,
                            parentFolderAlternativeName
                        }
                    }
                    console.log('foldersOccurrenceObj: ', foldersOccurrenceObj)

                    const targetFolderOccurrences = foldersOccurrenceObj[file.name]
                    const targetFolder = targetFolderOccurrences.find(folder => folder.id === file.id)

                    return {
                        ...file,
                        name: file.name,
                        id: file.id,
                        mimeType: file.mimeType,
                        folderAlternativeName: targetFolder.alternativeName,
                        pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`,
                        parentFolderAlternativeName
                    }
                })

                unitFolders.push(...folderFilesAndFolders)
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

                const folders = folderDataResponse.data.files.filter(file => file.mimeType.includes('folder'))
                /** @type {{ [key: string]: any[] } | null} */
                let foldersOccurrenceObj = null;

                if (folders.length) {
                    foldersOccurrenceObj = folders.reduce((allFoldersObj, folderA, _, self) => {
                        const foldersWithTheSameName = self.filter(folderB => folderA.name === folderB.name)
                        allFoldersObj[folderA.name] = foldersWithTheSameName;

                        return allFoldersObj
                    }, {})

                    // if a folder has duplicate names, give it a alternative name in order to differentiate it from the rest of the folders
                    for (const folderNameAndOccurrences of Object.entries(foldersOccurrenceObj)) {
                        let [folderName, occurrences] = folderNameAndOccurrences;

                        if (occurrences.length === 1) {
                            continue
                        }

                        foldersOccurrenceObj[folderName] = occurrences.map((folderOccurrence, index) => ({
                            ...folderOccurrence,
                            alternativeName: `${folderOccurrence.name} ${index + 1}`
                        }))
                    }
                }

                const folderData = folderDataResponse.data.files.map(file => {
                    const targetFolderOccurrences = foldersOccurrenceObj?.[file.name]
                    const targetFolder = targetFolderOccurrences ? targetFolderOccurrences.find(folder => folder.id === file.id) : null;

                    if (targetFolder) {
                        return {
                            ...file,
                            name: file.name,
                            id: file.id,
                            folderAlternativeName: targetFolder.name,
                            mimeType: file.mimeType,
                            pathToFile: unitFolder.name,
                            parentFolderAlternativeName
                        }
                    }

                    return {
                        ...file,
                        name: file.name,
                        id: file.id,
                        mimeType: file.mimeType,
                        pathToFile: unitFolder.name,
                        parentFolderAlternativeName

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
                    pathToFile: unitFolder.pathToFile ? `${unitFolder.pathToFile}/${unitFolder.name}` : unitFolder.name,
                    parentFolderAlternativeName
                }

                unitFolders.push(file)
            }
        }

        // give the user the ability the name the folder where the files will be copied to. 
        const searchGoogleDriveUnitFolders = await searchUserGoogleDrive(request.body.accessToken, `name = "${request.body.unitName} COPY"`)
        let unitFolderId = searchGoogleDriveUnitFolders?.[0]?.id

        console.log('searchGoogleDriveUnitFolders: ', searchGoogleDriveUnitFolders)

        // Create the folder if the folder has not been created yet.
        if (!searchGoogleDriveUnitFolders?.length) {
            const { folderId, errMsg } = await createGoogleDriveFolderForUser(`${request.body.unitName} COPY`, request.body.accessToken)

            if (errMsg) {
                throw new CustomError(errMsg, 500)
            }

            unitFolderId = folderId
        }

        console.log('unitFolderId: ', unitFolderId)

        // const folderPaths = [...new Set(unitFolders.filter(folder => folder.pathToFile !== 'root').map(folder => folder.pathToFile))]
        // let folderPaths = unitFolders.filter(folder => folder.pathToFile !== 'root').map((folder, index) => ({
        //     id: index,
        //     wasCreated: false,
        //     parentFolderAlternativeName: folder.parentFolderAlternativeName,
        //     pathToFile: folder.pathToFile,
        //     ...(folder.folderAlternativeName ? { folderAlternativeName: folder.folderAlternativeName } : {})
        // }))
        let foldersFailedToCreate = [];
        /** @type {{ id: string, name: string, pathToFile: string }[]} */
        let createdFolders = []
        const folderPaths = [...new Set(unitFolders.filter(folder => folder.pathToFile !== 'root').map(folder => folder.pathToFile))]

        console.log('creating the google folders...')
        // create the google folders 
        for (let index = 0; index < folderPaths.length; index++) {
            const folderPath = folderPaths[index]
            const folderPathSplitted = folderPath.split('/')
            const folderName = folderPathSplitted.at(-1)

            if (folderPathSplitted.length === 1) {
                const { folderId, wasSuccessful } = await createGoogleDriveFolderForUser(folderName, request.body.accessToken, [unitFolderId])

                if (!wasSuccessful) {
                    foldersFailedToCreate.push(folderName)
                } else {
                    createdFolders.push({ id: folderId, name: folderName, pathToFile: folderPath })
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

            createdFolders.push({ id: folderId, name: folderName, pathToFile: folderPath })
        }

        console.log('google folders has been created...')

        const permissions = [
            {
                type: 'user',
                role: 'writer',
                emailAddress: request.body.email
            },
            {
                type: 'domain',
                role: 'writer',
                domain: 'galacticpolymath.com'
            }
        ]
        const files = unitFolders.filter(folder => !folder.mimeType.includes('folder'))
        let failedFilesToShare = [];
        let filesThatWereShared = []

        console.log('will share files shared with the client side user...')
        // share the files in order to copy them into the specified folder

        for (const file in files) {
            console.log('file.name: ', file.name)
            console.log('file.id: ', file.id)

            let permissionResults = await shareFile(file.id, googleService, permissions)

            if (!permissionResults?.length) {
                failedFilesToShare.push({ name: file.name, id: file.id })
                continue
            }


            filesThatWereShared.push(...permissionResults)
        }

        console.log('files has been shared...')

        let failedCopiedFiles = []
        let parentFoldersThatDontExist = []

        console.log('will execute copy...')
        //  copy the files into the corresponding folder
        for (const file of files) {
            // get the parent folder of the file
            const parentFolderName = file.pathToFile.split("/").at(-1)
            const parentFolder = createdFolders.find(folder => folder.name === parentFolderName)

            if (!parentFolder) {
                console.error(`The parent folder for '${file.name}' file does not exist.`)
                parentFoldersThatDontExist.push(parentFolder)
                continue
            }

            const copyFileResult = await copyFile(file.id, [parentFolder.id], request.body.accessToken)

            if (!copyFileResult.wasSuccessful) {
                failedCopiedFiles.push(file.name)
            }
        }

        console.log('Done copying files...')

        console.log("failedCopiedFiles: ", failedCopiedFiles)
        console.log("failedFilesToShare: ", failedFilesToShare)

        return response.json({
            data: unitFolders
        });
    } catch (error) {
        console.error('An error has occurred. Error: ', error)
        return response.status(500).json({ msg: `Failed to download GP lessons. Reason: ${error}` });
    }
}