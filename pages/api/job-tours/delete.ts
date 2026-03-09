 
 

import { NextApiRequest, NextApiResponse } from 'next';
import JobTour from '../../../backend/models/JobTour';
import { getUserByEmail } from '../../../backend/services/userServices';
import { connectToMongodb } from '../../../backend/utils/connection';
import { CustomError } from '../../../backend/utils/errors';
import { deleteJobTourById } from '../../../backend/services/jobTourServices';
import { verifyJwt } from '../../../nondependencyFns';

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    try {
        if (request.method !== 'DELETE') {
            throw new CustomError('This route only accepts DELETE requests.', 404);
        }

        const { id } = request.query;

        const { wasSuccessful } = await connectToMongodb(15_000, 0, true);

        if (!wasSuccessful) {
            throw new CustomError('Failed to connect to the database.', 500);
        }

        if (!id || typeof id !== 'string' || !id.trim()) {
            throw new CustomError('No `_id` provided in the query. Cannot delete job tour.', 400);
        }
        const jobId = id.trim();

        const authorization = request?.headers?.authorization ?? '';
        const authToken = authorization.split(' ').at(-1);
        if (!authToken) {
            throw new CustomError('Unable to extract user from JWT', 401);
        }

        const jwtVerified = await verifyJwt(authToken);
        const userEmail = jwtVerified.payload?.email;
        if (!userEmail) {
            throw new CustomError('No email found in JWT payload.', 401);
        }

        const targetUser = await getUserByEmail(userEmail);
        if (!targetUser?._id) {
            throw new CustomError('No user found for the provided email address.', 404);
        }

        const targetTourResult = await JobTour.findById(jobId).lean();
        const targetTour = Array.isArray(targetTourResult)
            ? targetTourResult[0]
            : targetTourResult;
        if (!targetTour?._id) {
            throw new CustomError('No matching job tour was found in the database.', 404);
        }
        if (String(targetTour.userId) !== String(targetUser._id)) {
            throw new CustomError('You do not have permission to delete this tour.', 403);
        }

        const { status, msg } = await deleteJobTourById(
            jobId,
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
