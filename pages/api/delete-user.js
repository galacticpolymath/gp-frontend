/* eslint-disable quotes */
/* eslint-disable indent */
// create the handler for the delete account path must accept the id of the user as the param of the request url 

import { CustomError } from "../../backend/utils/errors";
import { deleteUserByEmail } from "../../backend/services/userServices";
import { deleteUserFromMailingList } from "../../backend/services/emailServices";
import { cache } from "../../backend/authOpts/authOptions";

export default async function handler(request, response) {
    try {
        // print the request 
        console.log('REQUEST: ');
        console.log(request);
        if (request.method !== 'DELETE') {
            throw new CustomError("Incorrect request method. Must be a 'DELETE'.", 405);
        }

        console.log('QUERY: ');
        console.log(request.query);

        if (!request.query.email) {
            throw new CustomError("'email' is not present in the request url.", 405);
        }

        const { wasSuccessful: wasUserDeletedFromMailingList } = await deleteUserFromMailingList(request.query.email);
        const { wasSuccessful: wasUserDeletedFromDb } = await deleteUserByEmail(request.query.email);
        
        cache.del(request.query.email);

        console.log('Was user taken off from mailing list: ', wasUserDeletedFromMailingList);

        if (!wasUserDeletedFromDb) {
            throw new CustomError("Failed to delete the target user.", 500);
        }

        return response.status(200).json({ msg: 'success' });
    } catch (error) {
        const { code, message } = error ?? {};
        return response.status(code ?? 500).json({ msg: message ?? 'An error has occurred.' });
    }
}