import jwt from "jsonwebtoken";
import { authOptions } from "../../pages/api/auth/[...nextauth";

const validateJwtToken = async (token) => {
    try {
        const userCredentials = await authOptions.jwt.decode({ secret: process.env.NEXTAUTH_SECRET, token: token });

        if (!userCredentials) {
            throw new Error('User credentials could not be verified.')
        }

        return { wasSuccessful: true, userCredentials }
    } catch (error) {
        console.error('An error has occurred in validating jwt: ', error)

        return { wasSuccessful: false, msg: `An error has occurred in validating jwt. Error message: ${error}.` }
    }
}

const getIsReqAuthorizedResult = async (request, role = "user") => {
    try {
        const token = request?.headers?.authorization.split(" ")[1].trim();
        const validateJwtTokenResult = await validateJwtToken(token);

        if (!validateJwtTokenResult.wasSuccessful || !validateJwtTokenResult?.userCredentials) {
            throw new Error(validateJwtTokenResult.msg);
        }

        console.log("validateJwtTokenResult.userCredentials: ", validateJwtTokenResult.userCredentials)

        const roles = validateJwtTokenResult.userCredentials.claims.allowedRoles;
        const hasUserRole = roles.find(role => role === 'user');
        const hasTargetRole = (role !== "user") ? roles.find(role => role === role) : hasUserRole;

        if (hasUserRole && hasTargetRole) {
            return { isReqAuthorized: true, msg: "User is authorized to access this service." }
        }

        throw new Error("User is not authorized to access this service.");
    } catch (error) {
        const errMsg = `An error has occurred in authorizing the request. Error message: ${error}.`

        return { isReqAuthorized: true, msg: errMsg }
    }
}

export { validateJwtToken, getIsReqAuthorizedResult }