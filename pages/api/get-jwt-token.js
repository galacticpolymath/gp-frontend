import JwtModel from '../../backend/models/Jwt';
import getCanUserWriteToDb from '../../backend/services/dbAuthService';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      throw new CustomError("Invalid request method. Must be a 'POST'.", 405);
    }

    const canUserWriteToDb = await getCanUserWriteToDb(request.body.email);

    if (!canUserWriteToDb) {
      throw new CustomError('You are not authorized to access this service.', 403);
    }

    await connectToMongodb();

    const jwtDoc = await JwtModel.findOne({ _id: request.body.email }).lean();

    if (!jwtDoc) {
      return response.status(404).json({
        msg: 'There is no jwtToken for this email. You may have received it already or the jwt storage has expired.',
      });
    }

    await JwtModel.deleteOne({ _id: request.body.email });

    return response.status(200).json({ access: jwtDoc.access, refresh: jwtDoc.refresh });
  } catch (error) {
    const { message, status } = error;
    
    return response.status(status ?? 500).json({ msg: message ?? 'Internal server error.' });
  }
}