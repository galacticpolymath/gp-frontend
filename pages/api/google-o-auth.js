import { google } from 'googleapis';


export default async function handler(request, response) {
    // determine where the request originated from in order to get the appropriate redirect uri
    const { AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_REDIRECT_URI } = process.env;
    const oauth2Client = new google.auth.OAuth2(
        AUTH_CLIENT_ID,
        AUTH_CLIENT_SECRET,
        AUTH_REDIRECT_URI
    );
    const SCOPES = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    // The url will be sent to the client side in a json body.
    return response.redirect(url)
}
