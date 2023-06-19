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

        if (!isCredentialsValid) {
            throw new Error('Invalid credentials.');
        }

        const userDocAsObj = user.toObject();

        return { isCredentialsValid: isCredentialsValid, msg: isCredentialsValid ? 'User logged in.' : 'Invalid credentials.', data: userDocAsObj?.roles || [] };
    } catch (error) {
        console.error('An error has occurred in logging the user in: ', error);

        return { status: 401, isCredentialsValid: false, msg: 'An error has occurred in logging the user in.' }
    }
}

function createJwt(user) {
    const privateKey = process.env.JWT_PRIVATE_KEY
    const _jwt = jwt.sign(user, privateKey, { algorithm: 'HS256', expiresIn: 86_400_000 });

    return _jwt;
}

function verifyJwtToken(token) {
    try {
        const payloadDecoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY, { algorithms: ['HS256'] });

        return { data: payloadDecoded, msg: 'Token is valid.' };
    } catch (error) {
        console.error('The token is invalid: ', error)

        return { status: 401, msg: 'Token is invalid.' }
    }
}

function getDoesUserHaveASpecificRole(userRoles, targetRole) {
    return userRoles.map(({ role }) => role).includes(targetRole)
}

export { userLogin, createJwt, verifyJwtToken, getDoesUserHaveASpecificRole }