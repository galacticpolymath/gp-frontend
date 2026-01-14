/* eslint-disable quotes */

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongodb } from '../../../backend/utils/connection';
import { CustomError } from '../../../backend/utils/errors';
import { updateJobTour } from '../../../backend/services/jobTourServices';
import { IJobTour } from '../../../backend/models/JobTour';

export type TJobUpdates = Partial<Omit<IJobTour, "_id" | "userId" | "isGP">>;

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


        if (!Object.keys(updates).length) {
            throw new CustomError('No updates provided; the `updates` object must have at least one property.', 400);
        }

        if ("_id" in updates || "userId" in updates || "isGp" in updates) {
            throw new CustomError('Modifying `_id`, `userId`, or "isGp" is not allowed.', 400);
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
