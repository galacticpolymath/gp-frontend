/* eslint-disable no-console */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable indent */
import nodemailer from 'nodemailer';

class EmailTransport {
    constructor() {
        const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

        this.pool = true;
        this.host = 'smtp.galacticpolymath.com';
        this.port = 465;
        this.secure = true;
        this.auth = {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD,
        };
    }
}

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

        const transport = nodemailer.createTransport(new EmailTransport());

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

