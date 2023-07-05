import axios from "axios";
import Users from "../models/user";
import { google, GoogleApis } from "googleapis";
import { externalApiInfo } from "../globalVals/externalApis";

async function verifyIdToken(token) {
    const oauth2Client = new google.auth.OAuth2()

    try {
        const loginTicket = await oauth2Client.verifyIdToken({
            idToken: token,
            audience: process.env.AUTH_CLIENT_ID
        })
        const payload = loginTicket.getPayload()

        console.log('payload: ', payload)

        return { status: 200, data: payload }
    } catch (error) {
        const verificationErrorMsg = `An error has occurred in trying to verify the token: ${error}`

        console.error(verificationErrorMsg)

        return { status: 500, msg: verificationErrorMsg }
    }
}

function getDoesUserHaveASpecificRole(email, targetRole) {
    const targetUser = Users.findOne({ _id: email }).lean()

    console.log('targetUser: ', targetUser)

    return targetUser ? targetUser.roles.map(({ role }) => role).includes(targetRole) : false
}



export { verifyIdToken, getDoesUserHaveASpecificRole }