import jwt from "jsonwebtoken";
import { authOptions } from "../../pages/api/auth/[...nextAuth]";

const validateJwtToken = async (token) => {
    try {
        const userCredentials = await authOptions.jwt.decode({ secret: process.env.NEXTAUTH_SECRET, token: token });

        if (!userCredentials) {
            throw new Error('User credentials could not be verified.')
        }

        return { wasSuccessful: true, userCredentials }
    } catch (error) {
        console.error('An error has occurred in validating jwt: ', error)

        return { wasSuccessful: false, errorMsg: `An error has occurred in validating jwt. Error message: ${error}.` }
    }
}

const getIsReqAuthorizedResult = request => {
    const token = request.headers.authorization.split(" ")[1].trim();

    return validateJwtToken(token);
}

export { validateJwtToken, getIsReqAuthorizedResult }