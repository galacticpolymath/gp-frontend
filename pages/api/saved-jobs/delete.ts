import { NextApiRequest, NextApiResponse } from 'next';
import User from '../../../backend/models/User';
import { connectToMongodb } from '../../../backend/utils/connection';
import { CustomError } from '../../../backend/utils/errors';
import { getJwtPayloadPromise } from '../../../nondependencyFns';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method !== 'DELETE') {
      throw new CustomError(
        'Incorrect request method. Must be DELETE.',
        405
      );
    }

    const authorization = request.headers?.authorization;
    if (typeof authorization !== 'string') {
      throw new CustomError(
        "Authorization header is missing or invalid.",
        401
      );
    }

    let payload: { email?: string } | undefined;
    try {
      const jwtResult = await getJwtPayloadPromise(authorization);
      payload = jwtResult?.payload as { email?: string } | undefined;
    } catch (error) {
      console.error("Failed to parse JWT for saved-jobs/delete:", error);
      throw new CustomError("Invalid or expired authorization token.", 401);
    }

    if (!payload?.email) {
      throw new CustomError(
        'You are not authorized. No email found in the token.',
        401
      );
    }

    const email = payload.email;
    const jobIdsToDelete = request.query['jobIdsToDelete']
    const jobIdsToDeleteValidated = typeof jobIdsToDelete === 'string' ? [jobIdsToDelete] : jobIdsToDelete

    if (!jobIdsToDeleteValidated || !jobIdsToDeleteValidated.length) {
      throw new CustomError(
        'No job IDs provided to delete.',
        400
      );
    }

    const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
      15_000,
      0,
      true
    );

    if (!wasConnectionSuccessful) {
      throw new CustomError('Failed to connect to the database.', 500);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select({
      savedJobIds: 1,
    });

    if (!user) {
      throw new CustomError('User not found.', 404);
    }

    const normalizedDeleteIds = jobIdsToDeleteValidated
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean);

    const existingRaw = (user as { savedJobIds?: unknown }).savedJobIds;
    const existingIds = Array.isArray(existingRaw)
      ? existingRaw
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim())
          .filter(Boolean)
      : typeof existingRaw === 'string' && existingRaw.trim()
        ? [existingRaw.trim()]
        : [];

    const nextIds = existingIds.filter((id) => !normalizedDeleteIds.includes(id));

    await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { savedJobIds: nextIds } }
    );

    return response.status(200).json({
      msg: 'Saved job removed successfully.',
      wasSuccessful: true
    });
  } catch (error: unknown) {
    const { code, message } = (error as { code?: number; message?: string }) ?? {};
    const safeStatusCode =
      typeof code === "number" && code >= 400 && code <= 599 ? code : 500;

    console.error(
      'Failed to remove saved job. Reason: ',
      error
    );

    return response.status(safeStatusCode).json({
      msg: message ?? 'An error occurred on the server.',
      wasSuccessful: false
    });
  }
}
