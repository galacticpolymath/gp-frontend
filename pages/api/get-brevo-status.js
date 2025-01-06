
/**
 * Handles incoming API requests to retrieve the Brevo status.
 * 
 * @param {import('next').NextApiRequest} request - The incoming request object.
 * @param {import('next').NextApiResponse} response - The response object to send data back.
 */

import MailingListConfirmations from '../../backend/models/mailingListConfirmation';
import { getMailingListContact } from '../../backend/services/emailServices';

export default async function handler(request, response) {
    try {
        const { mailingListConfirmationId } = request.body;
        const mailingListConfirmationIdDoc = await MailingListConfirmations.findOne({ _id: mailingListConfirmationId }).lean();

        if (!mailingListConfirmationIdDoc || !mailingListConfirmationIdDoc.email) {
            throw new Error("The target mailing list confirmation document does not exist.");
        }

        const mailingListContact = await getMailingListContact(mailingListConfirmationIdDoc.email);

        console.log("mailingListContact: ", mailingListContact);

        if (!mailingListContact) {
            throw new Error("The target user was not found on the mailing list.");
        }

        return response.status(200).json({ isOnMailingList: false });
    } catch (error) {
        console.error("An error has occurred. Failed to retrieve the brevo status of the non-signed in user. Reason: ", error);

        return response.status(500).json({ isOnMailingList: false, errType: "userNotFound" });
    }
}