import axios from "axios";
import Users from "../models/user";
import { google } from "googleapis";
import { externalApiInfo } from "../globalVals/externalApis";

async function verifyIdToken(code) {
    const oauth2Client = new google.auth.OAuth2()

    try {
        const reqBody = {
            code: code,
            client_id: process.env.AUTH_CLIENT_ID,
            client_secret: process.env.AUTH_CLIENT_SECRET,
            redirect_uri: process.env.AUTH_REDIRECT_URI,
            grant_type: 'authorization_code'
        }
        const response = await axios.post(externalApiInfo.oauthGoogleApisUrl, reqBody)

        if(response.status !== 200) {
            throw new Error('An error has occurred in trying to get the access token.')
        }

        if(response.data.id_token === undefined) {
            throw new Error('An error has occurred in trying to get the access token. The id_token is undefined.')
        }

        const loginTicket = await oauth2Client.verifyIdToken({
            idToken: response.data.id_token,
            audience: AUTH_CLIENT_ID
        })

        return { status: 200, data: loginTicket }
    } catch (error) {
        const verificationErrorMsg = `An error has occurred in trying to verify the token: ${error}`

        console.error(verificationErrorMsg)

        return { status: 500, msg: verificationErrorMsg }
    }
}

function getDoesUserHaveASpecificRole(email, targetRole) {
    const targetUser = Users.findOne({ email: email }).lean()

    return targetUser.roles.map(({ role }) => role).includes(targetRole)
}



export { verifyIdToken, getDoesUserHaveASpecificRole }