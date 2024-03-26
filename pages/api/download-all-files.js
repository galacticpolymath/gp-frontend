/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
import { getGoogleAuthJwt } from '../../backend/utils/auth';
import { google } from 'googleapis'
import fs from 'fs'
import { CustomError } from '../../backend/utils/errors';
import { getIsTypeValid } from '../../globalFns';

// NOTES:
// what to do with the json file that contains the keys? 
// create a jwt
// send requests to the google drive api via the url



// GOALS: 
// GOAL #1: authenticate with google drive api
// GOAL #2: get the files from the google drive

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
        // if (!request.query.fileNames || (typeof request.query.fileNames !== 'string') || ((typeof request.query.fileNames === 'string') && !getIsTypeValid(JSON.parse(request.query.fileNames), 'object'))) {
        //     throw new CustomError(`"fileName" field is invalid. Received: ${request.query.fileNames}`, 400);
        // }

        // const fileNames = JSON.parse(request.query.fileNames)
        let credentials = new Credentials()
        credentials = JSON.stringify(credentials)
        let credentialsSplitted = credentials.split('')
        let indexesOfValsToDel = []

        for (let index = 0; index < credentialsSplitted.length; index++) {
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
        const drive = google.drive({ version: 'v3', auth: googleAuthJwt });
        const res = await drive.files.list({
            corpora: 'drive',
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
            driveId: process.env.GOOGLE_DRIVE_ID
        });

        return response.json({
            data: [...res.data.files]
        })

        // const { data } = await drive.files.list({

        // if (!data?.files?.length) {
        //     throw new CustomError('Failed to retrieve fails from google drive.', 500)
        // }

        // const folder = data.files.find(({ name }) => name.toLocaleLowerCase().includes('i like'))
        // // const folders = data.files.filter(({ mimeType }) => mimeType.includes('folder'));
        // // console.log('folders: ', folders)

        // const targetFiles = data.files.filter(file => fileNames.includes(file.name))

        // if (!targetFiles?.length) {
        //     throw new CustomError("Couldn't retrieve gp lessons from google drive.", 500)
        // }


        // // GOAL:
        // // copy the lesson, and store it into a new folder called  


        // return response.json({ msg: 'GP lessons has been downloaded.' });
    } catch (error) {
        console.error('An error has occurred. Error: ', error)
        return response.status(500).json({ msg: `Failed to download GP lessons. Reason: ${error}` });
    }
}