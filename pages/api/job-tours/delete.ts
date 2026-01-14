/* eslint-disable quotes */
/* eslint-disable no-console */

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongodb } from '../../../backend/utils/connection';
import { CustomError } from '../../../backend/utils/errors';
import { deleteJobTourById } from '../../../backend/services/jobTourServices';

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    try {
        const { ids } = request.query;

        const { wasSuccessful } = await connectToMongodb(15_000, 0, true);

        if (!wasSuccessful) {
            throw new CustomError('Failed to connect to the database.', 500);
        }

        if (!ids) {
            throw new CustomError('No `_id` provided in the query. Cannot delete job tour.', 400);
        }

        const jobIds = typeof ids === 'string' ? [ids] : ids;

        const { status, msg } = await deleteJobTourById(
            jobIds,
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
