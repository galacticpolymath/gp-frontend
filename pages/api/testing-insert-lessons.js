import { getIsReqAuthorizedResult } from "../../backend/services/authServices";

export default async function handler(request, response) {
    const authorizationResult = await getIsReqAuthorizedResult(request);

    console.log('authorizationResult.userCredentials.claims.allowedRoles: ', authorizationResult.userCredentials.claims.allowedRoles)

    return response.status(200).json({ message: "test!" })
}
