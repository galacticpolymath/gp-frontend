/* eslint-disable no-console */
/* eslint-disable indent */
import { getUserByEmail, updateUser } from '../../backend/services/userServices';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';
import { createIterations, createSalt, hashPassword, verifyJwt } from '../../backend/utils/security';

export default async function handler(request, response) {
    try {
        if (request.method !== 'POST') {
            throw new CustomError('Invalid request method. Must be "POST".', 405);
        }

        if (!request.headers || (typeof request.headers !== 'object')) {
            throw new CustomError('Couldn\'t detect the headers in the request.', 422);
        }

        if (!request.body.newPassword) {
            throw new CustomError('The new password is not present in the body of the request.', 404);
        }

        /**
         * @type {string}
         */
        const authorization = request?.headers?.['authorization'] ?? '';
        const passwordResetTokenSplitted = authorization.split(' ');

        if (passwordResetTokenSplitted.length !== 2) {
            throw new CustomError('The authorization string is in a invalid format.', 422);
        }

        /**
         * @type {string}
         */
        const passwordResetToken = passwordResetTokenSplitted.at(-1);
        /**
         * @type {import('../../backend/utils/security').TJwtPayload}
         */
        const { exp: expSeconds, email } = (await verifyJwt(passwordResetToken)).payload;

        if (!expSeconds || !email) {
            throw new CustomError('Invalid reset token.', 401);
        }

        const expMiliseconds = expSeconds * 1_000;
        const currentTimeMs = new Date().getMilliseconds();

        if (currentTimeMs > expMiliseconds) {
            throw new CustomError('The password reset token has expired.', 401, 'expiredToken');
        }

        const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb();

        if (!wasConnectionSuccessful) {
            throw new CustomError('Failed to connect to the database.', 500);
        }

        const user = await getUserByEmail(email);

        if (!user) {
            throw new CustomError('The user does not exist.', 404);
        }

        console.log('the user: ', user);
        if (user.provider !== 'credentials') {
            throw new CustomError('Only credentials based user can reset their password.', 401, 'notCredentialsUser');
        }

        const hashedPasswordResult = hashPassword(
            request.body.newPassword,
            createSalt(),
            createIterations()
        );
        const updateUserPasswordResult = await updateUser({ email: email }, { password: hashedPasswordResult });

        if (!updateUserPasswordResult.wasSuccessful) {
            const errMsg = updateUserPasswordResult.errMsg ?? 'Failed to update the password for the target user.';

            throw new CustomError(errMsg, 500);
        }

        console.log('the password has been updated...');

        return response.status(200).json({ msg: 'Password has been updated.' });
    } catch (error) {
        console.log('error: ', error);
        const { status, message, type, code } = error ?? {};
        const errMsg = message ?? `Failed to update password for the target user. Reason: ${error}`;

        console.log('code, error: ', code);

        console.error('An error has occurred: ', errMsg);

        return response.status(status ?? 500).json({ msg: errMsg, errType: type });
    }
}