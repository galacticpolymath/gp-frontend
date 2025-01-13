import { getMailingListContact } from "../../backend/services/emailServices";

export default async function handler(request, response) {
    try {
        // get the email from the parameters
        const { email } = request.query;
        const emailListContact = await getMailingListContact(email);

        console.log("emailListContact: ", emailListContact);

        return response.status(200).json(emailListContact);
    } catch (error) {
        console.error("An error has occurred.");

        return response.status(500).json({ msg: "SERVER ERROR: " + error });
    }
}