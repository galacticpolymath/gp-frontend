/* eslint-disable indent */
/* eslint-disable no-console */
/* eslint-disable no-empty */

import { sendEmail } from '../../backend/services/emailServices';
import { getUserByEmail } from '../../backend/services/userServices';
import { signJwt } from '../../backend/utils/auth';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';
import { PASSWORD_RESET_TOKEN_VAR_NAME } from '../../globalVars';

export default async function handler(request, response) {
    try {
        if (!request.body.email) {
            throw new CustomError('The "email" property is missing from the body of the request.', 500);
        }

        const { email } = request.body;

        await connectToMongodb();

        const user = await getUserByEmail(email);

        if (!user) {
            throw new CustomError('Failed to send the email to the target user', 500, 'emailSendError');
        }

        // const expirationTime = 
        const resetPasswordToken = await signJwt({ email }, process.env.NEXTAUTH_SECRET, '5 minutes');
        const resetPasswordLink = `${request.headers.origin}/password-reset/?${PASSWORD_RESET_TOKEN_VAR_NAME}=${resetPasswordToken}`;
        const htmlMsg = user.provider === 'credentials'
            ?
            `<span>You requested to reset your password. If you didn't, please disregard this message. Please click the following link to reset it: <a href=${resetPasswordLink}>Reset Password Link</a></span>`
            :
            '<span>You requested a password reset, but your account uses a third party for the login. Only Galactic Polymath accounts that uses our platform for logins can request a password reset.</span>';

        const { wasSuccessful } = await sendEmail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Galactic Polymath Password Reset',
            html: htmlMsg,
        });

        if (!wasSuccessful) {
            throw new CustomError('Failed to send email to the target user.', 500, 'emailSendError');
        }

        return response.status(200).json({ msg: "Successfully saved the 'aboutUser' form into the db." });
    } catch (error) {
        const errMsg = error?.message ?? `Failed to send the email to the target user. Reason: ${error}`;

        return response.status(500).json({ msg: errMsg });
    }
}