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

    const jwtResult = await getJwtPayloadPromise(authorization);
    const payload = jwtResult?.payload;

    if (!payload?.email) {
      throw new CustomError(
        'You are not authorized. No email found in the token.',
        401
      );
    }

    const email = payload.email;

    if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
      throw new CustomError(
        'Request body must be a non-array object.',
        400
      );
    }

    const { jobIds: _jobIds } = request.body as { jobIds?: unknown };

    if (!_jobIds || !(_jobIds && Array.isArray(_jobIds) && _jobIds.length && _jobIds.every(jobId => typeof jobId === 'string'))) {
      throw new CustomError(
        'Request body must include a non-empty string "jobId".',
        400
      );
    }

    let jobIds = _jobIds as string[];
    const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
      15_000,
      0,
      true
    );

    if (!wasConnectionSuccessful) {
      throw new CustomError('Failed to connect to the database.', 500);
    }

    const updateResult = await User.updateOne(
      { email: email.toLowerCase() },
      { $pull: { savedJobIds: { $in: jobIds } } }
    );

    if (updateResult.matchedCount === 0) {
      throw new CustomError('User not found.', 404);
    }

    return response.status(200).json({
      msg: 'Saved job removed successfully.',
      wasSuccessful: true
    });
  } catch (error: unknown) {
    const { code, message } = (error as { code?: number; message?: string }) ?? {};

    console.error(
      'Failed to remove saved job. Reason: ',
      error
    );

    return response.status(code ?? 500).json({
      msg: message ?? 'An error occurred on the server.',
      wasSuccessful: false
    });
  }
}
