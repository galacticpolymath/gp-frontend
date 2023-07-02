import { getDoesUserHaveASpecificRole, verifyIdToken, verifyJwtToken } from '../../backend/services/authServices';
import { insertLesson } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';

export default async function handler(request, response) {
  const { method, headers, body } = request;

  if (method !== 'POST') {
    return response.status(404).json({ msg: 'This route only accepts POST requests.' });
  }

  const token = headers?.authorization?.split('Bearer')?.at(-1)?.trim()

  if (!token) {
    return response.status(401).json({ msg: 'The authorization header is missing.' });
  }

  const { status, data: loginTicket, msg } = verifyIdToken(token);

  if (status === 500) {
    return response.status(status).json({ msg: msg });
  }

  const canUserWriteToDb = getDoesUserHaveASpecificRole(loginTicket.getPayload().email, 'readWrite');

  if (!canUserWriteToDb) {
    return response.status(403).json({ msg: 'The user is not allowed to write to the database.' });
  }


  try {
    await connectToMongodb();
    const { status, msg } = await insertLesson(body);

    return response.status(status).json({ msg: msg });
  } catch (error) {

    return response.status(500).json({ msg: `Failed to save lesson into the database. Error message: ${error}` });
  }
}
