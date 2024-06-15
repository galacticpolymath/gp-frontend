/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
import { google, drive_v3 } from 'googleapis';
import { CustomError } from '../../backend/utils/errors';
import axios from 'axios';
import { FileMetaData, generateGoogleAuthJwt, getGooglDriveFolders } from '../../backend/services/googleDriveServices';

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
 * @return{Promise<AxiosResponse<any, any>>} An object contain the results and optional message.
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
 * @param{string} fileName The name of the file.
 * @param{{ type: string, role: string, emailAddress: string }[]} permissions Permissions for the user to access the file
 * @param{drive_v3.Drive} service google drive service object
 * @return{Promise<any[] | null>} An array of the permission ids if successful. Otherwise, it will return null.
 * */
const shareFile = async (fileId, service, permissions, fileName) => {
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
            console.error(`Failed to share file '${fileId}' with the name of ${fileName} with the user. Reason: `, err);
        }
    }

    return permissionIdsForFile?.length ? permissionIdsForFile : null;
}

// create a files

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
        );

        if (response.status !== 200) {
            throw new CustomError(response.data ?? 'Failed to create a lesson folder.', response.status)
        }

        return { wasSuccessful: true, folderId: response.data.id }
    } catch (error) {
        console.error("Error object: ", error)
        const errMsg = `Failed to create folder for the user. Reason: ${error.response.data.error}`
        console.log('errMsg: ', errMsg)

        return { wasSuccessful: false, errMsg: errMsg }
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

        const googleAuthJwt = generateGoogleAuthJwt()
        const googleService = google.drive({ version: 'v3', auth: googleAuthJwt });

        console.log('googleService: ', googleService)
        const rootDriveFolders = await getGooglDriveFolders(googleService, request.body.unitDriveId)

        if (!rootDriveFolders?.length) {
            console.error('The root of the drive folder is empty.')
            return response.status(500).json({ wasCopySuccessful: false, msg: `Failed to download GP lessons. Either the root drive of the gp folder is empty or the access token is invalid.` });
        }

        /** @type {{ id: string, name: string, pathToFile: string, mimeType: string, parentFolderId?: string, wasCreated?: boolean }[]} */
        // will hold all of the folders
        let unitFolders = [...rootDriveFolders.map(folder => ({ name: folder.name, id: folder.id, mimeType: folder.mimeType, pathToFile: '' }))]

        // get all of the folders of the unit 
        for (const unitFolder of unitFolders) {
            const parentFolderAlternativeName = unitFolder.alternativeName

            if (unitFolder.mimeType.includes("folder") && (unitFolder.pathToFile && (unitFolder.pathToFile !== ''))) {
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

                const folderFilesAndFolders = folderDataResponse.data.files.map(file => {
                    if (!file.mimeType.includes('folder') || !foldersOccurrenceObj || !foldersOccurrenceObj?.[file.name] || (foldersOccurrenceObj?.[file.name]?.length === 1)) {
                        return {
                            ...file,
                            name: file.name,
                            id: file.id,
                            // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive 
                            mimeType: file.mimeType,
                            parentFolderId: unitFolder.id,
                            pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`,
                            parentFolderAlternativeName
                        }
                    }
                    const targetFolderOccurrences = foldersOccurrenceObj[file.name]
                    const targetFolder = targetFolderOccurrences.find(folder => folder.id === file.id)

                    return {
                        ...file,
                        name: file.name,
                        id: file.id,
                        mimeType: file.mimeType,
                        folderAlternativeName: targetFolder.alternativeName,
                        parentFolderId: unitFolder.id,
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
                            parentFolderId: unitFolder.id,
                            parentFolderAlternativeName
                        }
                    }

                    return {
                        ...file,
                        name: file.name,
                        id: file.id,
                        mimeType: file.mimeType,
                        parentFolderId: unitFolder.id,
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
                    parentFolderId: unitFolder.id,
                    pathToFile: unitFolder.pathToFile ? `${unitFolder.pathToFile}/${unitFolder.name}` : unitFolder.name,
                    parentFolderAlternativeName
                }

                unitFolders.push(file)
            }
        }

        // give the user the ability to name the folder where the files will be copied to. 
        const searchGoogleDriveUnitFolders = await searchUserGoogleDrive(request.body.accessToken, `name = "${request.body.unitName} COPY"`)
        let unitFolderId = searchGoogleDriveUnitFolders?.[0]?.id

        console.log('unitFolderId: ', unitFolderId)

        // Create the folder that the user wants to copy
        if (!searchGoogleDriveUnitFolders?.length) {
            const { folderId, errMsg } = await createGoogleDriveFolderForUser(`${request.body.unitName} COPY`, request.body.accessToken)

            if (errMsg) {
                throw new CustomError(errMsg, 500)
            }

            unitFolderId = folderId
        }

        let foldersFailedToCreate = [];
        /** @type {{ id: string, name: string, pathToFile: string, parentFolderId: string, gpFolderId: string }[]} */
        let createdFolders = []
        /** @type {{ fileId: string, pathToFile: string, parentFolderId: string, name: string }[]} */
        // get only the folders of the unit
        let folderPaths = unitFolders
            .filter(folder => folder.mimeType.includes('folder'))
            .map(folder => {
                return {
                    name: folder.name,
                    mimeType: folder.mimeType,
                    fileId: folder.id,
                    pathToFile: folder.pathToFile,
                    parentFolderId: folder.parentFolderId
                }
            })

        // create the google sub folders 
        for (const folderToCreate of folderPaths) {
            // if the folder is at the root
            if (folderToCreate.pathToFile === '') {
                const { folderId, wasSuccessful } = await createGoogleDriveFolderForUser(folderToCreate.name, request.body.accessToken, [unitFolderId])

                if (!wasSuccessful) {
                    foldersFailedToCreate.push(folderToCreate.name)
                } else {
                    createdFolders.push({
                        id: folderId,
                        gpFolderId: folderToCreate.fileId,
                        name: folderToCreate.name,
                        pathToFile: '',
                        parentFolderId: folderToCreate.parentFolderId
                    })
                }

                continue
            }

            // the id of the parent folder that was just created in the previous iteration
            const parentFolderId = createdFolders.find(folder => folder.gpFolderId === folderToCreate.parentFolderId)?.id

            if (!parentFolderId) {
                foldersFailedToCreate.push(folderToCreate.name)
                continue
            }

            const { folderId, wasSuccessful } = await createGoogleDriveFolderForUser(folderToCreate.name, request.body.accessToken, [parentFolderId])

            if (!wasSuccessful) {
                foldersFailedToCreate.push(folderToCreate.name)
                continue
            }

            createdFolders.push({
                id: folderId,
                gpFolderId: folderToCreate.fileId,
                name: folderToCreate.name,
                pathToFile: folderToCreate.pathToFile,
                parentFolderId: folderToCreate.parentFolderId
            })
        }

        const files = unitFolders.filter(folder => !folder.mimeType.includes('folder'))
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
        ];

        let shareFilePromises = [];

        for (const file of files) {
            for (const permission of permissions) {
                const shareFilePromise = googleService.permissions.create({
                    resource: permission,
                    fileId: file.id,
                    fields: 'id',
                    corpora: 'drive',
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                    driveId: process.env.GOOGLE_DRIVE_ID
                });
                shareFilePromises.push(shareFilePromise);
            }
        }

        console.log('Sharing all files via Promse.allSettled...')

        let sharedFilesResults = await Promise.allSettled(shareFilePromises);

        console.log('Files has been shared....')
        let failedShareFiles = sharedFilesResults.filter(sharedFileResult => sharedFileResult.status === "rejected")

        if (failedShareFiles.length) {
            failedShareFiles.forEach(file => {
                console.log("file.value.data: ", file.value.data)
                console.log('file.reason: ', file)
            });

            return response.status(500).json({
                wasCopySuccessful: false,
                msg: `Failed to share at least one file.`,
                failedSharedFiles: failedShareFiles
            });
        }


        let parentFoldersThatDontExist = []
        /** @type {Promise<AxiosResponse<any, any>>[]} */
        let copiedFilesPromises = [];


        // copy the files into the corresponding folder
        for (const file of files) {
            const parentFolderId = createdFolders.find(folder => folder.gpFolderId === file.parentFolderId)?.id

            if (!parentFolderId) {
                console.error(`The parent folder for '${file.name}' file does not exist.`)
                parentFoldersThatDontExist.push(parentFolderId)
                continue
            }

            copiedFilesPromises.push(getCopyFilePromise(request.body.accessToken, [parentFolderId], file.id))
        }
        console.log('executing Promise.allSettled, excuting copying of files...')

        const copiedFilesResult = await Promise.allSettled(copiedFilesPromises);

        console.log('copying files has been completed...')

        const failedCopiedFiles = copiedFilesResult.filter(copiedFileResult => copiedFileResult.status === 'rejected')

        if (failedCopiedFiles.length) {
            failedCopiedFiles.forEach(file => {
                console.log('file: ', file.reason)
                console.log('file.value.data: ', file.response);
            })

            return response.status(500).json({
                wasCopySuccessful: false,
                msg: 'At least one file failed to be shared.',
                failedSharedFiles: failedCopiedFiles
            });
        }

        return response.json({ wasCopySuccessful: true });
    } catch (error) {
        console.error('An error has occurred. Error: ', error)
        return response.status(500).json({ wasCopySuccessful: false, msg: `Failed to download GP lessons. Reason: ${error}` });
    }
}