/* eslint-disable no-console */
/* eslint-disable indent */
import { getUserByEmail } from '../../backend/services/userServices';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';
import { getIsPasswordCorrect } from '../../backend/utils/security';

export default async function handler(request, response) {
    try {

        const { email, password } = request.body;

        if (!email || !password) {
            throw new CustomError(400, 'Both "email" and "password" is required.', 'invalidReq');
        }

        const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
            15_000,
            0,
            true,
        );

        if (!wasConnectionSuccessful) {
            throw new CustomError('Failed to connect to the database.', 500);
        }

        const dbUser = await getUserByEmail(email);

        if (!dbUser) {
            return response.status(404).json({ canLogin: false, errType: 'userNotFound' });
        }

        if (!dbUser.password) {
            return response.status(404).json({ canLogin: false, errType: 'googleLogin' });
        }

        const { hash: hashedPassword, iterations, salt } = dbUser?.password ?? {};
        const isPasswordCorrect = getIsPasswordCorrect(
            {
                password,
                iterations,
                salt,
            },
            hashedPassword
        );

        if (!dbUser || !isPasswordCorrect) {
            return response.status(401).json({ canLogin: false, errType: 'invalidCredentials' });
        }

        console.log('The user can log in.');

        return response.status(200).json({ canLogin: true });
    } catch (error) {
        const { message, code } = error;
        const errMsg = `An error has occurred. Invalid credentials. Cannot log user in. Reason: ${message ?? error}`;

        return response.status(code ?? 401).json({ msg: errMsg, errType: 'invalidCredentials', canLogin: false });
    }

}