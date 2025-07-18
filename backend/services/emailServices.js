/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable indent */
import nodemailer from 'nodemailer';
import { updateUser } from './userServices';
import { nanoid } from 'nanoid';
import MailingListConfirmation from '../models/mailingListConfirmation';
import { deleteMailingListConfirmationsByEmail } from './mailingListConfirmationServices';
import { CustomError } from '../utils/errors';
import { waitWithExponentialBackOff } from '../../globalFns';

const MAILING_LIST_ID = 7;
const BREVO_PG_LIMIT = 1_000;

/**
 * @typedef {Object} TMailOpts
 * @property {string} from
 * @property {string} to
 * @property {string} subject
 * @property {string} text
 * @property {string} html
 */

/**
 * 
 * @param {TMailOpts} mailOpts 
 */
export const sendEmail = async (mailOpts) => {
    try {
        const privateKey = process.env.EMAIL_SENDER_SERVICE_ACCOUNT_PRIVATE_KEY.split("\\n").join("\n");
        const emailTransport = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                privateKey,
                type: 'OAuth2',
                user: "techguy@galacticpolymath.com",
                serviceClient: process.env.EMAIL_SENDER_SERVICE_ACCOUNT_CLIENT_ID,
                accessUrl: "https://oauth2.googleapis.com/token",
            },
        };
        const transport = nodemailer.createTransport(emailTransport);
        const canSendEmail = await transport.verify();

        if (!canSendEmail) {
            throw new Error("Email auth has failed.");
        }

        const sentMessageInfo = await transport.sendMail(mailOpts);

        console.log('sentMessageInfo: ', sentMessageInfo);

        if (sentMessageInfo.rejected.length) {
            throw new Error('Failed to send the email to the target user.');
        }

        console.log('the email was sent...');

        return { wasSuccessful: true };
    } catch (error) {
        console.error('Error object: ', error);

        return { wasSuccessful: false };
    }
};

/**
 * Sends an email with the given options and retries the operation if it fails.
 * Retries are done with an exponential backoff.
 * @param {TMailOpts} mailOpts
 * @param {number} [retries=1]
 * @return {Promise<{ wasSuccessful: boolean }>} A promise that resolves to an object with a boolean indicating whether the operation was successful.
 */
export const sendEmailWithRetries = async (mailOpts, retries = 1) => {
    try {
        const { wasSuccessful } = await sendEmail(mailOpts)

        if (!wasSuccessful) {
            throw new Error("Failed to send email. Retrying...");
        }

        return { wasSuccessful: true };
    } catch (error) {
        if (retries <= 3) {
            const randomNumMs = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
            const waitTime = randomNumMs + (retries * 1_000);
            console.log("Will wait for ", waitTime);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            return await sendEmailWithRetries(mailOpts, retries + 1);
        }

        console.error("Failed to send the email.")

        return { wasSuccessful: false };
    }
};

class BrevoOptions {
    constructor(method = 'GET') {
        this.method = method;
        this.headers = {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
        }
    }
}


export const addUserToEmailList = async (email, clientUrl) => {
    try {
        const mailingListConfirmationId = nanoid();
        const redirectionUrl = `${clientUrl}?confirmation-id=${mailingListConfirmationId}`;
        console.log('redirectionUrl: ', redirectionUrl);
        const reqBody = {
            email,
            includeListIds: [MAILING_LIST_ID],
            templateId: 5,
            redirectionUrl,
        };
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
            },
            body: JSON.stringify(reqBody),
        };
        const response = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', options);

        console.log('response, adding user to mailing list: ', response);

        if (response.status === 401) {
            throw new Error('Unauthorized. Check Brevo API key.');
        }

        if (!((response.status >= 200) && (response.status < 300))) {
            const responseBody = await response.json();

            return { wasSuccessful: false, errMsg: `Failed to add the user to the mailing list. Response body from Brevo server: ${responseBody}` };
        }

        await deleteMailingListConfirmationsByEmail(email);

        const mailingListConfirmationDoc = new MailingListConfirmation({ _id: mailingListConfirmationId, email });
        const saveResult = await mailingListConfirmationDoc.save();

        console.log("saveResult, mailingListConfirmationDoc: ", saveResult);

        if (!saveResult) {
            console.error("Failed to save the document into the database.");
        }

        return { wasSuccessful: true };
    } catch (error) {
        console.error(error);

        return { wasSuccessful: false };
    }
};

/**
 * @param {string} email The email of the user who will be deletede from the mailing list. 
 * @return {Promise<{ wasSuccessful: boolean }>} A promise that resolves to an object with a boolean indicating whether the operation was successful.
 */
export const deleteUserFromMailingList = async (email) => {
    try {

        console.log('delete the user from the brevo mailing list.');

        const options = {
            method: 'DELETE',
            headers: {
                accept: 'application/json',
                'api-key': process.env.BREVO_API_KEY,
            },
        };
        const response = await fetch(`https://api.brevo.com/v3/contacts/${email}`, options);

        if (response.status === 404) {
            console.log('Contact was not found on the mailing list.');

            return { wasSuccessful: true };
        }

        if (response.status === 401) {
            throw new Error('Unauthorized. Check Brevo API key.');
        }

        if (response.status !== 204) {

            return { wasSuccessful: false };
        }

        console.log('Contact was deleted from mailing list.');

        await updateUser({ email }, { isOnMailingList: false });

        return { wasSuccessful: true };
    } catch (error) {
        console.error('An error has occurred. Failed to delete the target user from the mailing list.', error);

        return { wasSuccessful: false };
    }
};

/**
 * Retrieves the Brevo contact information for the given email. 
 * 
 * @param {string} email The email of the target user.
 * @returns {Promise<Object | string | null>} A promise that resolves to the Brevo contact information associated with the email. If the email is not found, null is returned. If Brevo returns a 429 status code, the email is returned as a string. If there is an error, null is returned.
 */
export const getMailingListContact = async (email) => {
    try {
        if (!email || (typeof email !== 'string')) {
            throw new Error("The email was not provided or was not a string data type.")
        };

        const options = new BrevoOptions();
        const response = await fetch(`https://api.brevo.com/v3/contacts/${email}?identifierType=email_id`, options);

        if (response.status === 429) {
            return email;
        }

        if (response.status !== 200) {
            return null;
        }

        const body = await response.json();

        return body;
    } catch (error) {
        console.error("Unable to find the target user. Reason: ", error);

        if (error.name === "FetchError" || error.name === "TypeError") {
            console.error("Failed to get the target user. Fetch error.");
            return email;
        }


        return null;
    }
}

export const getBrevoMailingListContacts = async (listIds = [MAILING_LIST_ID], offset = 0) => {
    try {
        const url = new URL('https://api.brevo.com/v3/contacts');

        url.searchParams.set('limit', BREVO_PG_LIMIT);
        url.searchParams.set('offset', offset);

        for (const listId of listIds) {
            url.searchParams.set('listIds', listId);
        }

        const options = new BrevoOptions();
        const response = await fetch(url.href, options);

        if (response.status !== 200) {
            const body = await response.json();

            console.log("Failed to get the mailing list contacts. Response body: ", body);
            

            throw new Error("Failed to get the mailing list contacts.");
        }

        const body = await response.json();

        return body;
    } catch (error) {
        console.error("Failed to get the mailing list contacts. Reason: ", error);

        return null;
    }
}



export const getAllBrevoMailingListContacts = async (offset = 0, allContacts = [], tries = 0) => {
    try {
        if (tries > 15) {
            throw new CustomError("Reached max tries.", undefined, "maxTriesExceeded");
        }

        const allContactsClone = structuredClone(allContacts);
        console.log("allContactsClone: ", allContactsClone.length);
        const brevoMailingListContacts = await getBrevoMailingListContacts([MAILING_LIST_ID], offset);

        if (!brevoMailingListContacts && (typeof brevoMailingListContacts === 'object')) {
            console.log("Failed to get the mailing list contacts. Will try again.");
            await waitWithExponentialBackOff(tries);
            tries += 1;

            return getAllBrevoMailingListContacts(offset, allContactsClone, tries)
        }

        const { contacts, count } = brevoMailingListContacts;

        console.log("contacts.length: ", contacts.length);
        console.log("count of contacts: ", count);

        if (!contacts.length) {
            console.log("No more contacts to retrieve.");
            return allContactsClone;
        }

        for (const contact of contacts) {
            const isPresent = allContactsClone
                .find(retrievedContact => retrievedContact.email === contact.email)

            if (!isPresent) {
                allContactsClone.push(contact)
            }
        }

        if (allContactsClone.length >= count) {
            console.log("No more contacts to retrieve. Reached end.");
            return allContactsClone;
        }

        console.log("More contacts to retrieve. Will try again.");

        return await getAllBrevoMailingListContacts(offset + BREVO_PG_LIMIT, allContactsClone)
    } catch (error) {
        const { type, name } = error ?? {};

        if (type === "maxTriesExceeded") {
            return null;
        }

        if (name === "FetchError" || name === "TypeError") {
            console.error("Failed to get the target user. Fetch error.");
            return email;
        }

        console.error("An error has occurred: ", error);

        return null;
    }
}
