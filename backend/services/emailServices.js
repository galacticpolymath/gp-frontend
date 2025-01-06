/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable indent */
import nodemailer from 'nodemailer';
import { updateUser } from './userServices';
import { nanoid } from 'nanoid';

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
            // send the email using your own email
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


export const addUserToEmailList = async (email, clientUrl, mailingListConfirmationId) => {
    try {
        const redirectionUrl = `${clientUrl}?confirmation-id=${mailingListConfirmationId}`;
        console.log('redirectionUrl: ', redirectionUrl);
        const reqBody = {
            email,
            includeListIds: [7],
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

        if ((response.status === 201) || (response.status === 204)) {
            const { wasSuccessful } = await updateUser({ email }, { mailingListConfirmationEmailId });

            console.log('Did update target user in db: ', wasSuccessful);
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
 * Finds the contact with the given email on the Brevo mailing list.
 * @param {string} email The email of the contact on the mailing list.
 * @return {Promise<Object | null>} A promise that resolves to the `Contact` object if the contact is found, otherwise `null`.
 */
export const getMailingListContact = async (email) => {
    try {
        if (!email) {
            throw new Error("The email was not provided.")
        };

        const options = new BrevoOptions();
        const response = await fetch(`https://api.brevo.com/v3/contacts/${email}?identifierType=email_id`, options);
        const body = await response.json();

        console.log("body: ", body);

        return body;
    } catch (error) {
        console.error("Unable to find the target user. Reason: ", error);

        return null;
    }
}

