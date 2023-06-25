import { connectToMongodb } from '../../backend/utils/connection';
import { createJwt, userLogin } from '../../backend/services/authServices';
import { google } from 'googleapis';

export default async function handler(request, response) {
    const { AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_REDIRECT_URI } = process.env;
    const oauth2Client = new google.auth.OAuth2(
        AUTH_CLIENT_ID,
        AUTH_CLIENT_SECRET,
        AUTH_REDIRECT_URI
    );
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    console.log("url: ", url)

    // const client = await new google.auth.OAuth2().verifyIdToken({
    //     idToken: Token,
    //     audience: AUTH_CLIENT_ID,
    // })



    return response.redirect(url)
}
