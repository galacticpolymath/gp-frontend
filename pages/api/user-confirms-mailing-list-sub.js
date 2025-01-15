/* eslint-disable no-console */
/* eslint-disable indent */
import { getUserByEmail, updateUser } from '../../backend/services/userServices';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';

export default async function handler(request, response) {
    console.log('will add user to the mailing list: ', request.body);

    if (request.method !== 'PUT') {
        console.error('Incorrect method. Only accepts PUT requests.');

        return response.status(405).json({ msg: 'Incorrect method. Only accepts PUT requests.' });
    }

    if (
        !request?.body?.email ||
        (typeof request?.body?.email !== 'string') ||
        (typeof request?.body?.mailingListConfirmationEmailId !== 'string') ||
        !request?.body?.mailingListConfirmationEmailId
    ) {
        console.error('Invalid request body. Must have both the "email" and the "mailingListConfirmationEmailId" properties and they must be both strings.');

        return response.status(400).json({ msg: 'The request body must have an email and a callbackUrl property and they must all be strings.' });
    }

    const { email, mailingListConfirmationEmailId: mailingListConfirmationEmailIdFromClient } = request.body;
    const targetUser = await getUserByEmail(email);

    if (!targetUser) {
        console.error('The user does not exist.');

        return response.status(404).json({ msg: 'The user does not exist.', errType: 'userNotFound' });
    }

    if (targetUser.isOnMailingList) {
        return response.status(200).json({ msg: 'The email is already on the mailing list.', mailingListStatus: 'alreadyOnMailingList' });
    }

    if (!targetUser.mailingListConfirmationEmailId) {
        console.error('The mailing list confirmation email has not been sent yet.');

        return response.status(400).json({ msg: 'The mailing list confirmation email has not been sent yet or the user did not subscribe.', errType: 'mailingListConfirmationEmailNotSent' });
    }

    if (mailingListConfirmationEmailIdFromClient !== targetUser.mailingListConfirmationEmailId) {
        console.error('The mailing list confirmation email ids do not match.');

        return response.status(400).json({ msg: 'The mailing list confirmation email ids do not match.', errType: 'mailingListConfirmationEmailIdMismatch' });
    }

    const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb();

    if (!wasConnectionSuccessful) {
        throw new CustomError('Failed to connect to the database.', 500);
    }

    const { wasSuccessful } = await updateUser({ email }, { mailingListConfirmationEmailId: null, isOnMailingList: true });

    if (!wasSuccessful) {
        console.error('Failed to update the target user.');

        return response.status(500).json({ msg: 'Failed to update the target user.', errType: 'failedToUpdateUser' });
    }

    return response.status(200).json({
        msg: 'The email was added to the email list.',
    });
}