import { jwtVerify } from 'jose';
import { CustomError } from '../../backend/utils/errors';
import { signJwt } from '../../backend/utils/auth';


export default async function handler(request, response) {
    if (request.method !== "POST") {
        return response.status(404).json({ msg: "Invalid request method. Must be a 'POST' request." })
    }

    const refreshToken = request.body.refreshToken;

    if (!refreshToken) {
        return response.status(401).json({ mgs: 'Access Denied. No refresh token provided.' });
    }

    try {
        const decoded = await jwtVerify(refreshToken, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

        if (!decoded) {
            throw new CustomError("Invalid refresh token.", 400)
        }

        const accessToken = await signJwt(decoded, process.env.NEXTAUTH_SECRET, Math.floor((Math.floor(Date.now() / 1000) + 24 * 60 * 60) / 2));

        response.status(200).json({ accessToken });
    } catch (error) {
        console.error("Error object: ", error)
        const { message, code } = error;

        return response.status(code ?? 500).json({ msg: message ?? error });
    }


}

