/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable indent */
import nodemailer from 'nodemailer';
// import creds from '../../creds.json';

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
        if (!process.env.SERVICE_ACCOUNT_PRIVATE_KEY) {
            throw new Error("Service account private key environment variable is not present.");
        }

        const privateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY.split("\\n").join("\n");
        const emailTransport = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                privateKey,
                type: 'OAuth2',
                user: "gabe@toriondev.com",
                serviceClient: process.env.SERVICE_ACCOUNT_CLIENT_ID,
                accessUrl: "https://oauth2.googleapis.com/token",
            },
        };
        // console.log('emailTransport, yo there: ', emailTransport);

        const transport = nodemailer.createTransport(emailTransport);

        // console.log("will verify transporter...", transport);

        const canSendEmail = await transport.verify();
        console.log('bacon liver');
        console.log('canSendEmail: ', canSendEmail);

        // console.log('transporter has been verified.');

        // const mailOpts = {
        //     from: process.env.EMAIL_USER,
        //     to: "gabe-948@ethereal-entity-414923.iam.gserviceaccount.com",
        //     subject: 'Galactic Polymath Password Reset',
        //     html: "<p>hi</p>",
        // };

        console.log('yo there!');


        const sentMessageInfo = await transport.sendMail(mailOpts);

        // console.log()

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

