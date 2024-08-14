/* eslint-disable indent */
import { getUserByEmail, updateUser } from '../../backend/services/userServices';
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

        if(!request.body.newPassword){
            throw new CustomError('The new password is not present in the body of the request.', 404);
        }

        /**
         * @type {string}
         */
        const authorization = request?.headers?.['Authorization'] ?? '';
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
        const { exp, email } = (await verifyJwt(passwordResetToken)).payload;

        if (!exp || !email) {
            throw new CustomError('Invalid reset token.', 401);
        }

        const currentTimeMs = new Date().getMilliseconds();

        if (currentTimeMs > exp) {
            throw new CustomError('The password reset token has expired.', 401);
        }

        const doesUserExist = !!getUserByEmail(email);

        if(!doesUserExist){
            throw new CustomError('The user does not exist.', 404);
        }

        const hashedPasswordResult = hashPassword(request.body.newPassword, createSalt(), createIterations());
        const updateUserPasswordResult = await updateUser({ email: email }, { password: hashedPasswordResult });

        if (!updateUserPasswordResult.wasSuccessful){
            const errMsg = updateUserPasswordResult.errMsg ?? 'Failed to update the password for the target user.';

            throw new CustomError(errMsg, 500);
        }

        return response.status(200).json({ msg: 'Password has been udpated.' });
    } catch (error) {
        const { status, message } = error ?? {};
        const errMsg = message ?? `Failed to update password for the target user. Reason: ${error}`;

        return response.status(status).json({ msg: errMsg });
    }
}