/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
import fs from 'fs';
import { authenticate } from '@google-cloud/local-auth';

// NOTES:
// GOAL #1: authenticate with google drive api

// GOAL #2: get the files from the google drive

const CREDENTIALS_PATH = 'credentials.json';
const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

class Credentials {
    constructor() {
        const {
            GOOGLE_DRIVE_CLIENT_ID,
            GOOGLE_DRIVE_PROJECT_ID,
            GOOGLE_DRIVE_AUTH_URI,
            GOOGLE_DRIVE_TOKEN_URI,
            GOOGLE_DRIVE_AUTH_PROVIDER_x509_CERT_URL,
            GOOGLE_DRIVE_CLIENT_SECRET,
            GOOGLE_DRIVE_REDIRECT_URIS,
        } = process.env
        const redirectUris = GOOGLE_DRIVE_REDIRECT_URIS.split(',')

        this.web = {
            client_id: GOOGLE_DRIVE_CLIENT_ID,
            project_id: GOOGLE_DRIVE_PROJECT_ID,
            auth_uri: GOOGLE_DRIVE_AUTH_URI,
            token_uri: GOOGLE_DRIVE_TOKEN_URI,
            auth_provider_x509_cert_url: GOOGLE_DRIVE_AUTH_PROVIDER_x509_CERT_URL,
            client_secret: GOOGLE_DRIVE_CLIENT_SECRET,
            redirect_uris: redirectUris,
        }
    }
}

export default async function handler(request, response) {
    try {


        return response.json({ msg: 'GP lessons has been downloaded.' });
    } catch (error) {

        return response.status(500).json({ msg: `Failed to download GP lessons. Reason: ${error}` });
    }
}