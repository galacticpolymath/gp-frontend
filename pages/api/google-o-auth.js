import { google } from 'googleapis';

// GOAL:get the domain of where the request came from.
// use request.get('origin') to get the domain of where the request came from.

export default async function handler(_, response) {
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

    return response.redirect(url)
}
