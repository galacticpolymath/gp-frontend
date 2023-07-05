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

export { generateRedirectUrl }