/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable semi */
import fs from 'fs'
import { getGoogleAuthJwt } from '../utils/auth'

export class FileMetaData {
    constructor(folderName, parents = [], mimeType = 'application/vnd.google-apps.folder') {
        this.name = folderName
        this.parents = parents
        this.mimeType = mimeType
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

/**
 * Get the google drive folders.
 * @param{string} folderId The id of the file.
 * @param{drive_v3.Drive} googleService google drive service object
 * @return{Promise<[] | null>} An array of the permission ids if successful. Otherwise, it will return null.
 * */
export const getGooglDriveFolders = async (googleService, folderId) => {
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
        console.error('Failed to get the root folders of drive. Reason: ', error)

        return null;
    }
}

/**
 * Create a service object that will access the company's google drive. 
 *  @return {import('google-auth-library').JWT | null} Returns google auth jwt. Else, null will be returned.
 * */
export const generateGoogleAuthJwt = () => {
    try {
        let credentials = new Credentials()
        credentials = JSON.stringify(credentials)
        let credentialsSplitted = credentials.split('')
        let indexesOfValsToDel = []

        for (let index = 0; index < credentialsSplitted?.length; index++) {
            const nextVal = credentialsSplitted[index + 1]

            if (nextVal === undefined) {
                break
            }

            const currentVal = credentialsSplitted[index]

            if ((currentVal === '\\') && (nextVal === '\\')) {
                indexesOfValsToDel.push(index)
            }
        }

        credentialsSplitted = credentialsSplitted.filter((_, index) => !indexesOfValsToDel.includes(index));
        credentials = credentialsSplitted.join('');

        fs.writeFileSync('credentials.json', credentials)

        const googleAuthJwt = getGoogleAuthJwt('credentials.json', [
            "https://www.googleapis.com/auth/drive"
        ]);

        return googleAuthJwt
    } catch (error) {
        console.error('Failed to retrieve the google drive service object. Reason: ', error)

        return null;
    }
}

/**
 * Share the google drive file with a user.
 * @param{string} driveId The id of the file.
 * @param{drive_v3.Drive} googleService google drive service object
 * @return{Promise<[] | null>} An array of the permission ids if successful. Otherwise, it will return null.
 * */
export async function listFilesOfGoogleDriveFolder(googleService, driveId, queryObj = { q: '' }) {
    try {
        const files = googleService.files.list({
            corpora: 'drive',
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
            driveId: driveId,
            ...queryObj
        });

        return files
    } catch (error) {
        console.error('Failed to get files from google drive. Reason: ', error)

        return null
    }
}

export async function shareFilesWithRetries() {

}