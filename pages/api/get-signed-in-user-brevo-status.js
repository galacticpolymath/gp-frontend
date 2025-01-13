import { getMailingListContact } from "../../backend/services/emailServices";
import { CustomError } from "../../backend/utils/errors";
import { verifyJwt } from "../../nondependencyFns";

export default async function handler(request, response) {
    try {
        console.log('what is up there, request: ', request);

        if (request.method !== 'GET') {
            throw new CustomError("Incorrect request method. Must be a 'GET'.", 405, 'incorrectMethod');
        }

        const token = request.headers.authorization.replace('Bearer ', '');
        const { payload } = await verifyJwt(token);

        if (!payload) {
            throw new CustomError("You are not authorized to access this service. Token invalid.", 401, 'invalidToken');
        };

        if (!payload.email) {
            throw new CustomError("You are not authorized to access this service. No email found in the token.", 401, 'invalidTokenEmailNotFound');
        };

        const emailListContact = await getMailingListContact(payload.email);

        return response.status(200).json({ isOnMailingList: !!emailListContact });
    } catch (error) {
        const { errType, msg } = error ?? {}
        console.error("Unable to get the mailing list status of the signed user. Reason: ", msg ?? error);

        return response.status(500).json({ errType, msg, isOnMailingList: false });
    }
}
