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

// NOTES:
// what to do with the json file that contains the keys? 
// create a jwt
// send requests to the google drive api via the url



// GOALS: 
// GOAL #1: authenticate with google drive api
// GOAL #2: get the files from the google drive

const CREDENTIALS_PATH = 'credentials.json';
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

        this.private_key = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
        this.private_key_id = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID
        this.client_email = GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL
        this.client_id = GOOGLE_SERVICE_ACCOUNT_CLIENT_ID
        this.auth_uri = GOOGLE_SERVICE_ACCOUNT_AUTH_URI
        this.project_id = GOOGLE_SERVICE_ACCOUNT_PROJECT_ID
        this.account_token_uri = GOOGLE_SERVICE_ACCOUNT_TOKEN_URI
        this.auth_provider_x509_cert_url = GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL
        this.client_x509_cert_url = GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL
        this.type = 'service_account'
        this.auth_uri = "https://accounts.google.com/o/oauth2/auth"
        this.token_uri = "https://oauth2.googleapis.com/token"
        this.universe_domain = "googleapis.com"
    }
}

export default async function handler(request, response) {
    try {
        const googleAuthJwt = getGoogleAuthJwt(CREDENTIALS_PATH, [
            "https://www.googleapis.com/auth/drive.metadata.readonly",
        ]);
        const drive = google.drive({ version: 'v3', auth: googleAuthJwt });
        const responseGoogle = await drive.files.list()

        console.log('responseGoogle: ', responseGoogle)

        console.log('files, yo there, data.files: ', responseGoogle.data.files)

        return response.json({ msg: 'GP lessons has been downloaded.' });
    } catch (error) {
        console.error('An error has occurred. Error: ', error)
        return response.status(500).json({ msg: `Failed to download GP lessons. Reason: ${error}` });
    }
}