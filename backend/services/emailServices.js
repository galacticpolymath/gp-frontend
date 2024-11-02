/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable indent */
import nodemailer from 'nodemailer';

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
                user: "shared@galacticpolymath.com",
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
 * Adds a user to our email list via the brevo api.
 * @param {string} email The user's email.
 * @param {string} clientUrl The url of the client side of the app. This is used to construct the unsubscribe link.
 * @return {Promise<{ wasSuccessful: boolean }>} A promise that resolves to an object with a boolean indicating whether the operation was successful.
 */
export const addUserToEmailList = async (email, clientUrl) => {
    try {
        // add the user to our maliing list via the brevo api 
        const reqBody = {
            email,
            includeListIds: [8],
            templateId: 5,
            redirectionUrl: clientUrl,
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

        if (!((response.status >= 200) && (response.status < 300))) {
            return { wasSuccessful: false };
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

        console.log('delete the user  from the brevo mailing list.');
        
        const options = {
            method: 'DELETE',
            headers: {
                accept: 'application/json',
                'api-key': process.env.BREVO_API_KEY,
            },
        };
        const response = await fetch(`https://api.brevo.com/v3/contacts/${email}`, options);
        const fromBrevoServer = await response.json();

        console.log('fromBrevoServer: ', fromBrevoServer);
        
        if (response.status === 404) {
            console.log('Contact was not found on the mailing list.');

            return { wasSuccessful: true };
        }
        
        if (response.status !== 204) {
            console.log('Failed to delete the target user from the mailing list. Reason: ', fromBrevoServer);
            
            return { wasSuccessful: false };
        }
        
        console.log('Deleted contact from mailing list.');
        
        return { wasSuccessful: true };
    } catch (error) {
        console.error('An error has occurred. Failed to delete the target user from the mailing list.', error);

        return { wasSuccessful: false };
    }
};

