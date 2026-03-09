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
    if (request.method !== 'PUT') {
      throw new CustomError(
        'Incorrect request method. Must be POST.',
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
      console.error("Failed to parse JWT for saved-jobs/add:", error);
      throw new CustomError("Invalid or expired authorization token.", 401);
    }

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

    const { jobId } = request.body as { jobId?: unknown };

    if (typeof jobId !== 'string' || !jobId.trim()) {
      throw new CustomError(
        'Request body must include a non-empty string "jobId".',
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

    const normalizedJobId = jobId.trim();
    const user = await User.findOne({ email: email.toLowerCase() }).select({
      savedJobIds: 1,
    });

    if (!user) {
      throw new CustomError('User not found.', 404);
    }

    const existingRaw = (user as { savedJobIds?: unknown }).savedJobIds;
    const existingIds = Array.isArray(existingRaw)
      ? existingRaw
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim())
          .filter(Boolean)
      : typeof existingRaw === 'string' && existingRaw.trim()
        ? [existingRaw.trim()]
        : [];

    const nextIds = Array.from(new Set([...existingIds, normalizedJobId]));

    await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { savedJobIds: nextIds } }
    );

    return response.status(200).json({
      msg: 'Saved job added successfully.',
      jobId: normalizedJobId,
    });
  } catch (error: unknown) {
    const { code, message } = (error as { code?: number; message?: string }) ?? {};
    const safeStatusCode =
      typeof code === "number" && code >= 400 && code <= 599 ? code : 500;

    console.error(
      'Failed to add saved job. Reason: ',
      error
    );

    return response.status(safeStatusCode).json({
      msg: message ?? 'An error occurred on the server.',
    });
  }
}
