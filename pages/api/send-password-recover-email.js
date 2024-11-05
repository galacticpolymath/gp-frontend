/* eslint-disable indent */
/* eslint-disable no-console */
/* eslint-disable no-empty */

import { createPasswordResetEmail } from '../../backend/emailTemplates/passwordReset';
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
            return response.status(200).json({ msg: 'Requested processed.' });
        }

        console.log('will send password recover email');

        const resetPasswordToken = await signJwt({ email }, process.env.NEXTAUTH_SECRET, '5 minutes');
        const resetPasswordLink = `${request.headers.origin}/password-reset/?${PASSWORD_RESET_TOKEN_VAR_NAME}=${resetPasswordToken}`;
        const { wasSuccessful } = await sendEmail({
            from: 'shared@galacticpolymath.com',
            to: email,
            subject: 'Galactic Polymath Password Reset',
            html: createPasswordResetEmail(user.name.first, resetPasswordLink),
        });

        if (!wasSuccessful) {
            throw new CustomError('Failed to send email to the target user.', 500, 'emailSendError');
        }

        return response.status(200).json({ msg: 'Requested processed.' });
    } catch (error) {
        const errMsg = error?.message ?? `Failed to send the email to the target user. Reason: ${error}`;

        console.error('An error has occurred: ', error);

        return response.status(500).json({ msg: errMsg });
    }
}