/* eslint-disable quotes */
/* eslint-disable indent */
import { CustomError } from "../../backend/utils/errors";
import { deleteUserByEmail } from "../../backend/services/userServices";
import { cache } from "../../backend/authOpts/authOptions";

export default async function handler(request, response) {
    try {
        if (request.method !== 'DELETE') {
            throw new CustomError("Incorrect request method. Must be a 'DELETE'.", 405);
        }

        if (!request.query.email) {
            throw new CustomError("'email' is not present in the request url.", 404);
        }

        const { wasSuccessful: wasUserDeletedFromDb } = await deleteUserByEmail(request.query.email);

        cache.del(request.query.email);

        if (!wasUserDeletedFromDb) {
            throw new CustomError("Failed to delete the target user.", 500);
        }

        return response.status(200).json({ msg: 'success' });
    } catch (error) {
        const { code, message } = error ?? {};

        return response.status(code ?? 500).json({ msg: message ?? 'An error has occurred.' });
    }
}