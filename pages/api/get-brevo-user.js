/* eslint-disable quotes */

import { getMailingListContact } from "../../backend/services/emailServices";

export default async function handler(request, response) {
  try {
    // get the email from the parameters
    const { email } = request.query;
    const emailListContact = await getMailingListContact(email);

    return response.status(200).json(emailListContact);
  } catch (error) {

    return response.status(500).json({ msg: `SERVER ERROR: ${error}` });
  }
}
