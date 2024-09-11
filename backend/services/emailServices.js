/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable indent */
import nodemailer from 'nodemailer';

// class EmailTransport {
//     constructor() {
//         const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

//         this.host = 'smtp.gmail.com';
//         this.port = 465;
//         this.secure = true;
//         this.auth = {
//             user: EMAIL_USER,
//             pass: EMAIL_PASSWORD,
//         };
//     }
// }

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

        const emailTransport = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                serviceClient: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
                privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
                accessUrl: process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN_URI,
            },
        };
        const transport = nodemailer.createTransport(emailTransport);

        const sentMessageInfo = await transport.sendMail(mailOpts);

        if (sentMessageInfo.rejected.length) {
            throw new Error('Failed to send the email to the target user.');
        }

        return { wasSuccessful: true };
    } catch (error) {
        console.error('Error object: ', error);

        return { wasSuccessful: false };
    }
};

