import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';
import { deleteUnit } from '../../backend/services/unitServices';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const { _id } = request.query;

    if (!_id || typeof _id !== 'string') {
      throw new CustomError('Must provide a lesson id.', 404);
    }

    const { wasSuccessful } = await connectToMongodb(
      15_000,
      0,
      true,
    );

    if (!wasSuccessful) {
      throw new CustomError('Failed to connect to the database.', 500);
    }

    const { status, msg } = await deleteUnit(_id);

    return response.status(status).json({ msg });
  } catch (error) {
    const { code, message } = error as { code?: number; message?: string };

    return response.status(code ?? 500).json({ msg: message ?? `Failed to save lesson into the database. Error message: ${error}` });
  }
}