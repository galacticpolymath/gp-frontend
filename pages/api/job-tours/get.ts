 
 

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongodb } from '../../../backend/utils/connection';
import { CustomError } from '../../../backend/utils/errors';
import { retrieveJobTours } from '../../../backend/services/jobTourServices';
import { IJobTour } from '../../../backend/models/JobTour';

type TReqQuery = Partial<{
    filterObj: string;
    projectionsObj: string;
    dbType?: 'dev' | 'production';
    limit: string;
    sort: string;
}>;

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    try {
        console.log('Incoming request:', {
            method: request.method,
            query: request.query,
            headers: request.headers,
            body: request.body,
        });

        const { method, query } = request;

        if (method !== 'GET') {
            throw new CustomError('This route only accepts GET requests.', 404);
        }

        const {
            filterObj,
            projectionsObj,
            dbType,
            limit,
            sort,
        } = (query ?? {}) as TReqQuery;

        const dbProjections: unknown =
            typeof projectionsObj === 'string'
                ? JSON.parse(projectionsObj)
                : projectionsObj;
        const dbFilter: Record<keyof IJobTour, unknown> | null =
            typeof filterObj === 'string' ? JSON.parse(filterObj) : null;

        if (
            dbProjections &&
            ((typeof dbProjections !== 'object' && dbProjections === null) ||
                Array.isArray(dbProjections) ||
                typeof dbProjections !== 'object')
        ) {
            throw new CustomError(
                '`projectionsObj` must be an non-array object.',
                400
            );
        }

        if (
            dbFilter &&
            ((typeof dbFilter !== 'object' && dbFilter === null) ||
                Array.isArray(dbFilter) ||
                typeof dbFilter !== 'object')
        ) {
            throw new CustomError(
                '`dbFilter` must be an non-array object.',
                400
            );
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

        const limitNum = limit ? parseInt(limit, 10) : 0;
        const sortObj = sort ? JSON.parse(sort) : undefined;

        const { data, errMsg } = await retrieveJobTours(
            (dbFilter ?? {}) as Parameters<typeof retrieveJobTours>[0],
            dbProjections ?? {},
            limitNum,
            sortObj
        );

        if (errMsg) {
            throw new CustomError(errMsg, 500);
        }

        return response.status(200).json({ jobTours: data });
    } catch (error: unknown) {
        const {
            code: errorCode,
            message: errorMessage,
        }: { code?: number; message?: string } = error ?? {};
        const code = errorCode ?? 500;
        const message = errorMessage ?? 'An error has occurred on the server.';

        console.error('Error in the `getJobTours` API route:', error);

        return response.status(code ?? 500).json({
            msg: `Error message: ${message ?? 'An error has occurred on the server.'}`,
        });
    }
}
