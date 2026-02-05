 

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongodb } from '../../../backend/utils/connection';
import { CustomError } from '../../../backend/utils/errors';
import { IJobTour } from '../../../backend/models/JobTour';
import { insertJobTour, TJobTourToInsert } from '../../../backend/services/jobTourServices';
import { verifyJwt } from '../../../nondependencyFns';
import { getUser, getUserByEmail } from '../../../backend/services/userServices';

const VALID_GP_USERS = process.env.GP_JOB_TOURS_USERS
    ? new Set(process.env.GP_JOB_TOURS_USERS.split(","))
    : null;
const GP_EMAIL_DOMAIN = "@galacticpolymath.com";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {

    try {
        if (
            !request?.body?.jobTour ||
            (request?.body?.jobTour &&
                typeof request?.body?.jobTour === 'object' &&
                !Object.keys(request?.body?.jobTour)?.length) ||
            typeof request?.body?.jobTour !== 'object'
        ) {
            console.error(
                'Invalid request: The `request.body.jobTour` is either empty or not of the correct data type.'
            );

            return response.status(400).json({
                msg: 'The `request.body.jobTour` is empty or the wrong data type.',
            });
        }

        // Get user email from JWT token to check if it's matt@galacticpolymath.com
        const authorization = request?.headers?.authorization ?? '';
        const authToken = authorization.split(' ').at(-1);

        if (!authToken) {
            throw new CustomError('Unable to extract user from JWT', 401);
        }

        const jwtVerified = await verifyJwt(authToken);

        if (!jwtVerified.payload?.email) {
            throw new CustomError('No email found in JWT payload.', 401);
        }

        const userEmail = jwtVerified.payload.email;
        const newJobTour: Omit<TJobTourToInsert, "userId"> = request?.body?.jobTour;

        const isGpEmail = userEmail.toLowerCase().endsWith(GP_EMAIL_DOMAIN);
        const isAllowlisted = VALID_GP_USERS?.has(userEmail) ?? false;

        if (!isGpEmail) {
            if (!VALID_GP_USERS) {
                return response.status(500).json({
                    msg: 'Valid GP job tour users are not set on the server. The environment variable `GP_JOB_TOURS_USERS` is missing or empty. Cannot create job tour.'
                });
            }

            if (!VALID_GP_USERS?.size) {
                return response.status(500).json({
                    msg: 'Valid GP job tour users are not set on the server. The array has a length of zero. Cannot create job tour.'
                });
            }

            if (!isAllowlisted) {
                return response.status(403).json({
                    msg: 'Only GP team members can create JobViz tours.'
                });
            }
        }

        if (isGpEmail || isAllowlisted) {
            newJobTour.isGP = true;
        }

        const { wasSuccessful } = await connectToMongodb(
            15_000,
            0,
            true,
            request.body.dbType
        );

        if (!wasSuccessful) {
            throw new CustomError('Failed to connect to the database.', 500);
        }

        const targetUser = await getUserByEmail(userEmail);

        if (!targetUser?._id) {
            throw new CustomError('No user found for the provided email address.', 404);
        }

        const resolvedOwnerName = (() => {
            const first = targetUser.firstName ?? "";
            const last = targetUser.lastName ?? "";
            const full = `${first} ${last}`.trim();
            return full.length ? full : undefined;
        })();

        const _newJobTour: TJobTourToInsert = {
            ...newJobTour,
            userId: String(targetUser._id),
            ownerName: resolvedOwnerName,
        }
        const { status, msg, _id } = await insertJobTour(_newJobTour);

        if (status !== 200) {
            throw new CustomError(msg, status);
        }

        return response.status(status).json({ msg: msg, jobTourId: _id });
    } catch (error: unknown) {
        const { code, message } = error as { code: number; message: string };

        return response
            .status(code ?? 500)
            .json({ msg: message ?? 'Failed to insert job tour into the db.' });
    }
}
