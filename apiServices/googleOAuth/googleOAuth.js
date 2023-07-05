import axios from 'axios';
import { google } from 'googleapis';


function generateRedirectUrl(requestOrigin) {
    const { AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_REDIRECT_URI } = process.env;
    // based on the client origin, get the redirect url that matches from where the request came from.
    const oauth2Client = new google.auth.OAuth2(
        AUTH_CLIENT_ID,
        AUTH_CLIENT_SECRET,
        AUTH_REDIRECT_URI
    );
    const SCOPES = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
}

function generateReqBodyForIdToken(refreshToken, idToken) {
    const { AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_REDIRECT_URI } = process.env;

    if (refreshToken) {
        return {
            client_id: AUTH_CLIENT_ID,
            client_secret: AUTH_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        }
    }

    return {
        client_id: AUTH_CLIENT_ID,
        client_secret: AUTH_CLIENT_SECRET,
        code: idToken,
        redirect_uri: AUTH_REDIRECT_URI,
        grant_type: 'authorization_code'
    }

}

async function getIdToken(idToken, refreshToken) {
    try {
        const googleApisUrl = 'https://oauth2.googleapis.com/token';
        const postReqBody = idToken ? generateReqBodyForIdToken(null, idToken) : generateReqBodyForIdToken(refreshToken, null);
        const response = await axios.post(googleApisUrl, postReqBody);

        if (response.status === 200) {
            const _data = idToken ? { refreshToken: response.data.refresh_token, idToken: response.data.id_token }: { idToken: response.data.id_token }
            
            return { status: 200, data: _data }
        }

        throw new Error('An error has occurred in getting the id token from google apis.')
    } catch (error) {
        console.error("An error has occurred in getting the id token from google apis: ", error);

        return { status: 500, msg: `Error message: ${error}` }
    }
}

export { generateRedirectUrl, getIdToken }