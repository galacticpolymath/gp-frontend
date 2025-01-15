/* eslint-disable quotes */
/* eslint-disable no-console */

/**
 * Handles incoming API requests to retrieve the Brevo status.
 *
 * @param {import('next').NextApiRequest} request - The incoming request object.
 * @param {import('next').NextApiResponse} response - The response object to send data back.
 */

import MailingListConfirmations from "../../backend/models/mailingListConfirmation";
import { getMailingListContact } from "../../backend/services/emailServices";
import { deleteMailingListConfirmationsByEmail } from "../../backend/services/mailingListConfirmationServices";

export default async function handler(request, response) {
  try {
    if (request.method !== "GET") {
      throw new Error("Incorrect request method. Must be a 'GET'.");
    }

    if (!request.query || !request.query.mailingListConfirmationId) {
      throw new Error(
        "The 'mailingListConfirmationId' param is not found in the request param."
      );
    }

    const mailingListConfirmationIdDoc = await MailingListConfirmations.findOne(
      { _id: request.query.mailingListConfirmationId }
    ).lean();

    if (!mailingListConfirmationIdDoc || !mailingListConfirmationIdDoc.email) {
      throw new Error(
        "The target mailing list confirmation document does not exist."
      );
    }

    const mailingListContactPromise = getMailingListContact(
      mailingListConfirmationIdDoc.email
    );
    const deleteMailingListConfirmationByEmailPromise =
      deleteMailingListConfirmationsByEmail(mailingListConfirmationIdDoc.email);
    const [mailingListContact, deleteMailingListConfirmationByEmailResult] =
      await Promise.all([
        mailingListContactPromise,
        deleteMailingListConfirmationByEmailPromise,
      ]);

    console.log(
      "deleteMailingListConfirmationByEmailResult, yo there: ",
      deleteMailingListConfirmationByEmailResult
    );

    if (!mailingListContact) {
      throw new Error("The target user was not found on the mailing list.");
    }

    return response.status(200).json({ isOnMailingList: true });
  } catch (error) {
    const errMsg = `An error has occurred. Failed to retrieve the brevo status of the non-signed in user. Reason: ${error}`;

    console.error(errMsg);

    return response
      .status(500)
      .json({ isOnMailingList: false, errType: "userNotFound", errMsg });
  }
}
