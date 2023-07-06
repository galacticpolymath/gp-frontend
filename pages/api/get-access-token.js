import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextAuth]';
import { getToken } from 'next-auth/jwt';

export default async (req, res) => {
    try {
        const userCredentials = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET })
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const accessToken = session.user.token;

        res.status(200).json({ accessToken });
    } catch (error) {
        console.error('Something  went wrong in generating the access token. Error message: ', error)

        res.status(500).json({ error: 'Something went wrong in generating the access token.' });
    }
};
