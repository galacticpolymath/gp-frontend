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
        // make the above into a service
        // how do I get all of the folders for a unit? 
        // 

        // GOAL: get all of the folders for a unit?


        // GOAL: get all of the files for a paritcular unit

        // get the data at the root level of the folder
        // const res = await googleService.files.list({
        //     corpora: 'drive',
        //     includeItemsFromAllDrives: true,
        //     supportsAllDrives: true,
        //     driveId: process.env.GOOGLE_DRIVE_ID,
        //     q: `'${request.body.unitDriveId}' in parents`
        // });
        const filesObj = await listFilesOfGoogleDriveFolder(
            googleService,
            request.body.unitDriveId,
            { q: `'${request.body.unitDriveId}' in parents` }
        );

        console.log('filesObj: ', filesObj)

        // create folder object:
        // folderName: str
        // fileIds: an array of file id strings 
        // subFolders: 
        // [
        // { folderName, fileIds, subFolders: { ...(follow the same structure) }  }
        // ]


        // share the files with the user
        // create breadth first search algorithm
        // create a recursive function, 
        // if the item is a folder, then get the id of the folder
        // using the id of the folder, make another query to get their files



        // GOAL: copy the file into the target folder

        // NOTES:
        // create a folder in the user google drive
        // within it, create the appropiate folders that match with the folders that the user wants to copy

        // get the public id of the unit that the user wants to copy
        // main folder id for frogs unit: 1Ky0DSDrrtDl0nc0Ct9rKxrLUkzEvLKBQ
        // classroom materials folder id: 1P5d0lA6XQILhgEkadWzFhFDnAe4c-EvL

        // console.log('res.data: ', res.data)





        // MAIN GOAL: copy the file into the target user's drive

        // GOAL A: share the file to the target user.

        // GOAL B: list all of the files in the user's drive

        // GOAL C: get the target file from the list and copy it

        // SHARE THE FILE WITH THE TARGET USER: 
        // must send the email to the server

        // the folder id:
        // 1FBK6JY1gwu95MPp1MFh-D6ao2URt01sp
        // copy the below file into the target folder with the id of 1FBK6JY1gwu95MPp1MFh-D6ao2URt01sp
        // testing file id: 1QV9ZMPG7eFnPVlYrSj3t75W8YBD825feGGRntmll9uc

        // const permissions = [
        //     {
        //         type: 'user',
        //         role: 'writer',
        //         emailAddress: request.body.email
        //     },
        //     {
        //         type: 'domain',
        //         role: 'writer',
        //         domain: 'galacticpolymath.com'
        //     }
        // ]
        // const permissionIds = await shareFile(
        //     '19oynB8Wgv2ustQr6ETYK_O4-5M86ruj6ydZTqx0xNGc',
        //     googleService,
        //     permissions
        // );
        // const allUserFiles = await listAllUserFiles(request.body.accessToken);

        // if (!allUserFiles) {
        //     throw new CustomError('Failed to get all of the files of the user', 500)
        // }

        // const { folderId } = await createGoogleDriveFolderForUser('BioPhysics', request.body.accessToken)


        // // console.log('allUserFiles: ', allUserFiles)
        // // allUserFiles.forEach(({ id }) => typeof id)

        // const sharedTargetFile = allUserFiles.find(({ id }) => id === '19oynB8Wgv2ustQr6ETYK_O4-5M86ruj6ydZTqx0xNGc')

        // console.log('sharedTargetFile, yo there meng! ', sharedTargetFile)

        // const { wasSuccessful } = await copyFile(sharedTargetFile.id, [folderId], request.body.accessToken)

        // console.log('wasSuccessful copying file: ', wasSuccessful)


        // the user choose a destination folder to download their folders from
        // list all of the available folders that the user can choose from to upload their files to
        // else, create the folder on the server
        // const googleDriveFolderCreationResult = await createGoogleDriveFolderForUser('Chem', request.body.accessToken)

        // console.log('googleDriveFolderCreationResult: ', googleDriveFolderCreationResult)

        // const copyFileResult = await copyFile('1xLo9wJKUB3kNGWzCMZ1MjUJb1-9ieHFyAMllxerF1Zc', [googleDriveFolderCreationResult.folderId], request.body.accessToken)

        // console.log('copyFileResult: ', copyFileResult);

        // GOAL: copy the file into the user's drive.
        // list the files
        // create a folder with the name of the unit
        // copy those files into the folder


        return response.json({
            data: [...filesObj.data.files]
        });
    } catch (error) {
        console.error('An error has occurred. Error: ', error)
        return response.status(500).json({ msg: `Failed to download GP lessons. Reason: ${error}` });
    }
}