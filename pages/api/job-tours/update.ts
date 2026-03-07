 

import { NextApiRequest, NextApiResponse } from 'next';
import JobTour from '../../../backend/models/JobTour';
import { connectToMongodb } from '../../../backend/utils/connection';
import { CustomError } from '../../../backend/utils/errors';
import { updateJobTour } from '../../../backend/services/jobTourServices';
import { getUserByEmail } from '../../../backend/services/userServices';
import { IJobTour } from '../../../backend/models/JobTour';
import { verifyJwt } from '../../../nondependencyFns';

export type TJobUpdates = Partial<Omit<IJobTour, "_id" | "userId" | "isGP" | "lastEdited" | "createdDate">>;

interface IReqBody {
    jobTourId: string;
    updates: TJobUpdates;
    dbType?: Parameters<typeof connectToMongodb>[3];
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    try {
        const { method, body } = request;

        if (method !== 'PATCH') {
            throw new CustomError('This route only accepts PUT requests.', 404);
        }

        const { jobTourId, updates, dbType } = (body ?? {}) as IReqBody;

        if (typeof jobTourId !== 'string') {
            throw new CustomError('No `jobTourId` provided. Cannot update job tour.', 400);
        }

        if (!Object.keys(updates).length) {
            throw new CustomError('No updates provided; the `updates` object must have at least one property.', 400);
        }

        if ("_id" in updates || "userId" in updates || "isGp" in updates || "lastEdited" in updates || "createdDate" in updates || "ownerName" in updates) {
            throw new CustomError('Modifying the fields `_id`, `userId`, `isGp`, `ownerName`, `lastEdited`, or `createdDate` is not allowed.', 400);
        }

        const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
            15_000,
            0,
            true,
            dbType
        );

        if (!wasConnectionSuccessful) {
            throw new CustomError('Failed to connect to the database.', 500);
        }

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

        const targetTour = await JobTour.findById(jobTourId).lean();

        if (!targetTour?._id) {
            throw new CustomError('No matching job tour was found in the database.', 404);
        }

        if (String(targetTour.userId) !== String(targetUser._id)) {
            throw new CustomError('You do not have permission to update this tour.', 403);
        }

        const { wasSuccessful, errMsg } = await updateJobTour(
            { _id: jobTourId },
            updates
        );

        if (!wasSuccessful || errMsg) {
            console.error('Failed to update the target job tour. Error message: ', errMsg);
            throw new CustomError(errMsg, 500);
        }

        return response
            .status(200)
            .json({ msg: 'Successfully updated the target job tour' });
    } catch (error: unknown) {
        console.error('The error object: ', error);

        const {
            code: errorCode,
            message: errorMessage,
        }: { code?: number; message?: string } = error ?? {};
        const code = errorCode ?? 500;
        const message = errorMessage ?? 'An error has occurred on the server.';

        return response.status(code ?? 500).json({
            msg: `Error message: ${message ?? 'An error has occurred on the server.'}`,
        });
    }
}
