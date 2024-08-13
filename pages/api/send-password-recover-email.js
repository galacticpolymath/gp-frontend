/* eslint-disable no-console */
/* eslint-disable no-empty */

import { sendEmail } from '../../backend/services/emailServices';
import { CustomError } from '../../backend/utils/errors';

/* eslint-disable indent */
export default async function handler(request, response) {
    try {
        const { email } = request.body;
        const resetPasswordLink = `${request.headers.origin}/password-reset`;
        
        const { wasSuccessful } = await sendEmail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Galactic Polymath Password Reset',
            html: `<span>You requested to reset your password. Please click the following link: <a href=${resetPasswordLink}>someLink</a></span>`,
        });

        if(!wasSuccessful){
            throw new CustomError('Failed to send email to the target user.', 500, 'emailSendError');
        }

        return response.status(200).json({ msg: "Successfully saved the 'aboutUser' form into the db." });
    } catch(error){
        console.error('Failed to send the email to the target user. Reason: ', error);
        
        return response.status(500);
    }
}