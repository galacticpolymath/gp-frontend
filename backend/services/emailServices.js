/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable indent */
import nodemailer from 'nodemailer';
const brevo = require('@getbrevo/brevo');

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
 * 
 * @param {string} email User email.
 * @param {string} firstName First name of user. 
 * @returns {boolean} Will return a boolean if email contact was created successfully. 
 */
export const addEmailToMailingList = async (email, firstName) => {
    try {
        const apiInstance = new brevo.TransactionalEmailsApi();
        const apiKey = apiInstance.authentications['apiKey'];

        apiKey.apiKey = process.env.BREVO_API_KEY;

        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.subject = 'Galactic Polymath Newsletter Confirmation Email';
        sendSmtpEmail.htmlContent = '<html><body><h1>You have successfully been added to</h1></body></html>';
        sendSmtpEmail.sender = { 'name': 'Galactic Polymath', 'email': 'shared@galacticpolymath.com' };
        sendSmtpEmail.to = [
            { 'email': email, 'name': firstName },
        ];
        sendSmtpEmail.replyTo = { 'email': 'shared@galacticpolymath.com', 'name': 'Galactic Polymath' };
        sendSmtpEmail.params = { 'subject': 'GP NewsLetter Confirmation Email' };

        const emailResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);

        if (emailResponse.body.statusCode !== 201) {
            throw new Error('Failed to create email newsletter contact.');
        }

        return true;
    } catch (error) {
        console.error('An error has occurred. Unable to create the email contact. Error: ', error);

        return false;
    }
};

