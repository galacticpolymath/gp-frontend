/* eslint-disable quotes */
/* eslint-disable no-console */

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongodb } from '../../../backend/utils/connection';
import { CustomError } from '../../../backend/utils/errors';
import { deleteJobTour } from '../../../backend/services/jobTourServices';

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    try {
        const { _id, key, val } = request.query;
        // log the parameters
        console.log({
            _id,
            key,
            val,
        });
        let queryPair: [string, unknown] | undefined;

        if (typeof key === 'string' && typeof val === 'string') {
            queryPair = [key, val];
        }

        const { wasSuccessful } = await connectToMongodb(15_000, 0, true);

        if (!wasSuccessful) {
            throw new CustomError('Failed to connect to the database.', 500);
        }

        const { status, msg } = await deleteJobTour(
            _id as string | undefined,
            queryPair
        );

        return response.status(status).json({ msg });
    } catch (error) {
        const { code, message } = error as { code?: number; message?: string };

        return response.status(code ?? 500).json({
            msg:
                message ??
                `Failed to delete job tour from the database. Error message: ${error}`,
        });
    }
}
