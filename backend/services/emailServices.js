/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable indent */
import nodemailer from 'nodemailer';
// import creds from '../../creds.json';
import creds from '../../creds2.json';

// class EmailTransport {
//     constructor() {
//         const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

//         this.host = 'smtp.gmail.com';
//         this.port = 465;
//         this.secure = true;
//         this.auth = {
//             user: EMAIL_USER,
//             pass: EMAIL_PASSWORD,
//             serviceClient: 
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
                user: "gabe@toriondev.com",
                serviceClient: process.env.SERVICE_ACCOUNT_CLIENT_ID,
                privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
                accessUrl: 'https://oauth2.googleapis.com/token',
            },
        };
        // console.log('emailTransport, yo there: ', emailTransport);

        const transport = nodemailer.createTransport(emailTransport);

        // console.log("will verify transporter...", transport);

        const canSendEmail = await transport.verify();

        console.log('canSendEmail: ', canSendEmail);


        // console.log('transporter has been verified.');

        // const mailOpts = {
        //     from: process.env.EMAIL_USER,
        //     to: "gabe-948@ethereal-entity-414923.iam.gserviceaccount.com",
        //     subject: 'Galactic Polymath Password Reset',
        //     html: "<p>hi</p>",
        // };

        // const sentMessageInfo = await transport.sendMail(mailOpts);

        // if (sentMessageInfo.rejected.length) {
        //     throw new Error('Failed to send the email to the target user.');
        // }

        return { wasSuccessful: true };
    } catch (error) {
        console.error('Error object: ', error);

        return { wasSuccessful: false };
    }
};

