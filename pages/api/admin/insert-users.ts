import { NextApiRequest, NextApiResponse } from 'next';
import { insertUsers } from '../../../backend/services/userServices';
import { CustomError } from '../../../backend/utils/errors';
import { IUserSchema } from '../../../backend/models/User/types';
import { connectToMongodb } from '../../../backend/utils/connection';
import { TEnvironment } from '../../../types/global';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method !== 'POST') {
      throw new CustomError('This route only accepts POST requests.', 405);
    }

    const body = JSON.parse(request.body);
    const dbType = body?.dbType as TEnvironment | undefined;
    const users = body?.users as Partial<IUserSchema>[];

    if (!users || !Array.isArray(users)) {
      throw new CustomError(
        'The request body must contain a \'users\' array.',
        400
      );
    }

    const isDbConnected = await connectToMongodb(
      15_000,
      0,
      true,
      dbType ?? 'dev'
    );

    if (!isDbConnected) {
      throw new CustomError('Failed to connect to the database.', 500);
    }

    const result = await insertUsers(users);

    if (result.errMsg) {
      return response.status(500).json({ errMsg: result.errMsg });
    }

    return response.status(200).json({ wasSuccessful: result.wasSuccessful });
  } catch (error: any) {
    console.log('Error, hey there: ', error);
    const errMsg = `Failed to insert users into the db. Reason: ${error}`;

    return response.status(error?.code ?? 500).json({ errMsg });
  }
}