/* eslint-disable indent */
/* eslint-disable quotes */
import { cache } from "../../backend/authOpts/authOptions";
import { updateUser } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";

export default async function handler(request, response) {
    try {
        console.log('will update the target user...');
        if (!request.body || (request.body && (typeof request.body !== 'object'))) {
            throw new CustomError("Received either a incorrect data type for the body of the request or its value is falsey.", 400);
        }

        if (Object.keys(request.body).length <= 0) {
            throw new CustomError("The request body is empty. Must include the 'user' field.", 404);
        }

        if (!('updatedUser' in request.body) || (typeof request.body.updatedUser !== 'object') || !Object.values(request.body.updatedUser).length) {
            throw new CustomError("The user field is empty or contains the incorrect data type (must be a non-array object).", 404);
        }

        if (
            (('email' in request.body) && (typeof request.body.email !== 'string')) ||
            (('id' in request.body) && (typeof request.body.id !== 'string')) ||
            (('email' in request.body) && ('id' in request.body)) ||
            (!('email' in request.body) && !('id' in request.body))
        ) {
            throw new CustomError("Must have 'email' or the 'id' field in the body of the request. Values must be strings.", 404);
        }

        // take the user off the mailing list if the user wants to be taken of the mailing list 

        await connectToMongodb();

        const { email, id, updatedUser } = request.body;
        const query = email ? { email } : { _id: id };
        const { updatedUser: updatedUserFromDb, wasSuccessful } = await updateUser(query, updatedUser, [], ['password']);

        if (!wasSuccessful || !updatedUserFromDb) {
            throw new CustomError('Failed to update user.', 500);
        }

        cache.set(email, updatedUserFromDb);

        return response.status(200).json({ msg: 'User updated successfully.' });
    } catch (error) {
        console.error('An error has occurred, failed to update user. Reason: ', error);
        const { code, message } = error ?? {};

        return response.status(code ?? 500).json({ msg: message ?? 'Failed to update user.' });
    }
}