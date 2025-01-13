/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
import { nanoid } from "nanoid";
import { cache } from "../../backend/authOpts/authOptions";
import { addUserToEmailList, deleteUserFromMailingList } from "../../backend/services/emailServices";
import { updateUser } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import MailingListConfirmationModel from "../../backend/models/mailingListConfirmation";
import { ConversationsAgentOnlinePingPostRequest } from "@getbrevo/brevo";

export default async function handler(request, response) {
    try {
        console.log('will update the target user, in progress...');

        if (!request.body || (request.body && (typeof request.body !== 'object'))) {
            throw new CustomError("Received either a incorrect data type for the body of the request or its value is falsey.", 400);
        }

        if (Object.keys(request.body).length <= 0) {
            throw new CustomError("The request body is empty. Must include the 'user' field.", 404);
        }

        if (!request.body.willUpdateMailingListStatusOnly && (!('updatedUser' in request.body) || (typeof request.body.updatedUser !== 'object') || !Object.values(request.body.updatedUser).length)) {
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

        const {
            email,
            id,
            updatedUser,
            clientUrl,
            willUpdateMailingListStatusOnly,
            willSendEmailListingSubConfirmationEmail,
        } = request.body;

        console.log("the request body, yo there: ", request.body);

        const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb();

        if (!wasConnectionSuccessful) {
            throw new CustomError("Failed to connect to the database.", 500);
        }

        if ((willSendEmailListingSubConfirmationEmail === true) && (typeof clientUrl === 'string')) {
            console.log("Will add the user to mailing list...");

            const { wasSuccessful } = await addUserToEmailList(email, clientUrl);

            console.log("Was user added to mailing list: ", wasSuccessful);
        } else if (willSendEmailListingSubConfirmationEmail === false) {
            console.log('will delete the user  from the mailing list...');
            const { wasSuccessful } = await deleteUserFromMailingList(email);

            console.log('Was user successfully deleted? ', wasSuccessful);
        }

        if (willUpdateMailingListStatusOnly) {
            return response.status(200).json({ msg: 'User updated successfully.' });
        }

        const query = email ? { email } : { _id: id };
        const { updatedUser: updatedUserFromDb, wasSuccessful } = await updateUser(query, updatedUser, ['password']);

        if (!wasSuccessful || !updatedUserFromDb) {
            throw new CustomError('Failed to update user.', 500);
        }

        console.log('updated user, sup there: ', updatedUserFromDb);

        cache.set(email, updatedUserFromDb);

        return response.status(200).json({ msg: 'User updated successfully.' });
    } catch (error) {
        console.error('An error has occurred, failed to update user. Reason: ', error);
        const { code, message } = error ?? {};

        return response.status(code ?? 500).json({ msg: message ?? 'Failed to update user.' });
    }
}