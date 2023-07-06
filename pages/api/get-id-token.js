import { google } from 'googleapis';
import { getServerSession } from 'next-auth';

async function getAccessToken(request) {
    const session = await getServerSession({ request });

    return session?.accessToken;
};

export default async function handler(request, response) {
    try {
        const accessToken = await getAccessToken(request);

        return response.status(200).json({
            accessToken: accessToken
        });
    } catch (error) {
        console.error('Something went wrong getting the access token: ', error);

        return response.status(500).json({
            error: 'Internal server error. Failed to generate the access token.'
        });
    }
}
