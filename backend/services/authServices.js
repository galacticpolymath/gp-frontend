import Users from "../models/user";
import { scryptSync, timingSafeEqual } from 'crypto'
import jwt from 'jsonwebtoken';

async function userLogin(email, passwordAttempt) {
    try {
        const user = await Users.findOne({ _id: email });

        if (!user || !user.password) {
            return { isCredentialsValid: false, msg: 'User not found.' }
        }

        const [salt, actualPasswordHashed] = user.password.split(':');
        const hashedBuffer = scryptSync(passwordAttempt, salt, 64);
        const keyBuffer = Buffer.from(actualPasswordHashed, 'hex');
        const isCredentialsValid = timingSafeEqual(hashedBuffer, keyBuffer);

        return { isCredentialsValid: isCredentialsValid, msg: isCredentialsValid ? 'User logged in.' : 'Invalid credentials.', data: user.toObject() };
    } catch (error) {
        console.error('An error has occurred in logging the user in: ', error);

        return { status: 4, isCredentialsValid: false, msg: 'An error has occurred in logging the user in.' }
    }
}

function createJwt(user) {
    const privateKey = process.env.JWT_PRIVATE_KEY
    const _jwt = jwt.sign(user, privateKey, { algorithm: 'HS256', expiresIn: 86_400_000 });
    
    return _jwt;
}

function verifyJwtToken(token) {

}

export { userLogin, createJwt }