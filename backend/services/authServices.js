import Users from "../models/user";
import { scryptSync, timingSafeEqual } from 'crypto'
import { google } from "googleapis";
import jwt from 'jsonwebtoken';

async function verifyIdToken(token) {
    const oauth2Client = new google.auth.OAuth2()

    try{
        const client = await oauth2Client.verifyIdToken({
            idToken: token,
            audience: AUTH_CLIENT_ID,
        })

        return { status: 200, data: client }
    } catch(error){
        const verificationErrorMsg = `An error has occurred in trying to verify the token: ${error}`

        console.error(verificationErrorMsg)

        return { status: 500, msg: verificationErrorMsg }
    }
}



export { verifyIdToken }