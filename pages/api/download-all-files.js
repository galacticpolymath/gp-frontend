/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
import { authenticate } from '@google-cloud/local-auth';
import { CustomError } from '../../backend/utils/errors';
import fs from 'fs';

// NOTES:
// will get tokens after the user has been authenticated with the google drive api

// GOAL #3: contact the google drive api after authentication

// GOAL #4: list all of the files from google drive. MUST SEE THE GP LESSONS

// GOAL #5: download all of the lessons from the specified unit

// GOAL #1: authenticate the user to google drive

// SUB-GOAL: create the credentials json file

// SUB-GOAL: delete the credentials json file after it was created

const CREDENTIALS_PATH = 'credentials.json';
const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

const createGoogleDriveCredentialsObj = () => {
    const {
        GOOGLE_DRIVE_CLIENT_SECRET,
        GOOGLE_DRIVE_CLIENT_ID,
        GOOGLE_DRIVE_PROJECT_ID,
        GOOGLE_DRIVE_AUTH_URI,
        GOOGLE_DRIVE_TOKEN_URI,
        GOOGLE_DRIVE_AUTH_PROVIDER_x509_CERT_URL,
        GOOGLE_DRIVE_REDIRECT_URIS,
        GOOGLE_DRIVE_JAVASCRIPT_ORIGINS,
    } = process.env;
    const googleDriveRedirectUris = GOOGLE_DRIVE_REDIRECT_URIS.split(',');
    const javascriptOrigins = GOOGLE_DRIVE_JAVASCRIPT_ORIGINS.split(',');

    return {
        'web': {
            'client_id': GOOGLE_DRIVE_CLIENT_ID,
            'project_id': GOOGLE_DRIVE_PROJECT_ID,
            'auth_uri': GOOGLE_DRIVE_AUTH_URI,
            'token_uri': GOOGLE_DRIVE_TOKEN_URI,
            'auth_provider_x509_cert_url': GOOGLE_DRIVE_AUTH_PROVIDER_x509_CERT_URL,
            'client_secret': GOOGLE_DRIVE_CLIENT_SECRET,
            'redirect_uris': googleDriveRedirectUris,
            'javascript_origins': javascriptOrigins,
        },
    };
};

export default async function handler(request, response) {
    try {
        if (request.method !== 'GET') {
            throw new CustomError('Invalid request method.', 405);
        }

        const credentialsObj = createGoogleDriveCredentialsObj();

        console.log('credentialsObj, sup there: ', credentialsObj);

        fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentialsObj));

        const client = await authenticate({
            scopes,
            keyfilePath: CREDENTIALS_PATH,
        });

        console.log('client, hey there meng: ', client);

        return response.json({ msg: 'GP lessons has been downloaded.' });
    } catch (error) {
        console.error(error);

        fs.unlinkSync(CREDENTIALS_PATH);

        return response.status(500).json({ msg: `Failed to download GP lessons. Reason: ${error}` });
    }
}