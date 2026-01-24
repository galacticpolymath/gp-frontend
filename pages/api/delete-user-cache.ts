 
 

import { NextApiRequest, NextApiResponse } from 'next';
import { CustomError } from "../../backend/utils/errors";
import { deleteUserFromCache } from "../../backend/services/userServices";
import { getJwtPayloadPromise } from '../../nondependencyFns';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    try {
        if (request.method !== 'DELETE') {
            throw new CustomError("Incorrect request method. Must be a 'DELETE'.", 405);
        }

        const { payload } = (await getJwtPayloadPromise(request.headers.authorization)) ?? {};

        if (!payload || !payload.email) {
            throw new Error(
                "The 'authorization' header is not present in the request."
            );
        }

        // Delete user from cache using the service function
        const { wasSuccessful, msg } = await deleteUserFromCache(payload.email);

        if (!wasSuccessful) {
            throw new CustomError(msg || "Failed to delete user from cache.", 500);
        }

        return response.status(200).json({ 
            msg: msg || 'User deleted from cache successfully',
            wasSuccessful: true, 
        });
    } catch (error: any) {
        const { code, message } = error ?? {};

        return response.status(code ?? 500).json({ 
            msg: message ?? 'An error has occurred.',
            wasSuccessful: false, 
        });
    }
} 