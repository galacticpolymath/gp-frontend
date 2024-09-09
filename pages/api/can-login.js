/* eslint-disable no-console */
/* eslint-disable indent */
import { getUserByEmail } from '../../backend/services/userServices';
import { CustomError } from '../../backend/utils/errors';
import { getIsPasswordCorrect } from '../../backend/utils/security';

export default async function handler(request, response) {
    try {

        const { email, password } = request.body;

        if (!email || !password) {
            throw new CustomError(400, 'Both "email" and "password" is required.', 'invalidReq');
        }

        /** 
         * @type { import('../../backend/models/user').TUserSchema}
         */
        const dbUser = await getUserByEmail(email);

        if (!dbUser) {
            return response.status(404).json({ errType: 'userNotFound' });
        }

        if (!dbUser.password) {
            return response.status(404).json({ errType: 'googleLogin' });
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
            return response.status(401).json({ errType: 'invalidCredentials' });
        }

        console.log('The user can log in.');

        return response.status(200).json({ errType: 'none' });
    } catch (error) {
        const { message, code } = error;
        const errMsg = `An error has occurred. Invalid credentials. Cannot log user in. Reason: ${message ?? error}`;

        return response.status(code ?? 401).json({ msg: errMsg, errType: 'invalidCredentials' });
    }

}