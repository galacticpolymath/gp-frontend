/* eslint-disable indent */
/* eslint-disable no-console */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */

import { nanoid } from 'nanoid';
import { createPasswordResetEmail } from '../../backend/emailTemplates/passwordReset';
import { sendEmail } from '../../backend/services/emailServices';
import { getUserByEmail } from '../../backend/services/userServices';
import { signJwt } from '../../backend/utils/auth';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';
import { PASSWORD_RESET_CODE_VAR_NAME } from '../../globalVars';
import JwtModel from '../../backend/models/Jwt';

export default async function handler(request, response) {
    try {
        console.log('request received...');

        if (!request.body.email) {
            throw new CustomError('The "email" property is missing from the body of the request.', 500);
        }

        const { email, clientOrigin } = request.body;

        await connectToMongodb(
            15_000,
            0,
            true
        );

        const user = await getUserByEmail(email);

        if (!user) {
            return response.status(200).json({ msg: 'Requested processed.' });
        }

        console.log('will send password recover email');

        const resetPasswordToken = await signJwt({ email, accessibleRoutes: ['/api/updated-password'] }, process.env.NEXTAUTH_SECRET, '5 minutes');
        // store the token into the database
        const code = nanoid();
        const jwtModel = new JwtModel({
            _id: code,
            access: resetPasswordToken,
        });
        const resetPasswordLink = `${request.headers.origin}/password-reset/?${PASSWORD_RESET_CODE_VAR_NAME}=${resetPasswordToken}`;
        const { wasSuccessful } = await sendEmail({
            from: 'shared@galacticpolymath.com',
            to: email,
            subject: 'Galactic Polymath Password Reset',
            html: createPasswordResetEmail(user?.firstName ?? user.name.first, resetPasswordLink, clientOrigin),
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