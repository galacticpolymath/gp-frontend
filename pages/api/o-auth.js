import { connectToMongodb } from '../../backend/utils/connection';
import { createJwt, userLogin } from '../../backend/services/authServices';
import { google } from 'googleapis';

export default async function handler(request, response) {
    const { AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_REDIRECT_URI } = process.env;
    // const oauth2Client = new google.auth.OAuth2(
    //     AUTH_CLIENT_ID,
    //     AUTH_CLIENT_SECRET,
    //     AUTH_REDIRECT_URI
    // );
    // const scopes = [
    //     'https://www.googleapis.com/auth/userinfo.profile',
    //     'https://www.googleapis.com/auth/userinfo.email',
    // ];
    // const url = oauth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: scopes,
    // });
    const oauth2 = new google.auth.OAuth2()
    const client = await oauth2.verifyIdToken({
        idToken: "4/0AbUR2VMiIV6Ci07390r-t0j9sui7QinYQoaJ1U6XhUUjuE6mpwU93UJKpSuERsjXYqEd7A",
        audience: AUTH_CLIENT_ID,
    })

    // console.log("client: ", client)


    response.status(200).json({ msg: "success" })

    // return response.redirect(url)
}
