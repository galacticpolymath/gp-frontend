import { getServerSession } from 'next-auth';
import { getDoesUserHaveASpecificRole, verifyIdToken, verifyJwtToken } from '../../backend/services/authServices';
import { insertLesson } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';
import { authOptions } from './auth/[...nextAuth]';

export default async function handler(request, response) {
  const { method, headers, body } = request;

  if (method !== 'POST') {
    return response.status(404).json({ msg: 'This route only accepts POST requests.' });
  }

  const session = await getServerSession(request, response, authOptions);

  console.log("session: ", session)

  return response.status(200).json({ msg: "Lesson was successfully inserted into the db." })
}
