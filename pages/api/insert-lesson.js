import { getDoesUserHaveASpecificRole, verifyJwtToken } from '../../backend/services/authServices';
import { insertLesson } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';

export default async function handler(request, response) {
  const { method, headers } = request;

  if (method !== 'POST') {
    return response.status(404).json({ msg: 'This route only accepts POST requests.' });
  }

  if(headers.authorization === undefined){
    return response.status(401).json({ msg: 'The authorization header is missing.' });
  }

  const token = headers.authorization.split(' ')[1];
  const { status, data: user, msg } = verifyJwtToken(token);

  if(msg === 'Token is invalid.'){
    return response.status(status).json({ msg: msg });
  }

  const canUserWriteToDb = getDoesUserHaveASpecificRole(user.roles, 'readWrite');
  
  if(!canUserWriteToDb){
    return response.status(403).json({ msg: 'The user is not allowed to write to the database.' });
  }

  response.redirect()

  try {
    await connectToMongodb();
    const { status, msg } = await insertLesson(request.body);

    return response.status(status).json({ msg: msg });
  } catch (error) {

    return response.status(500).json({ msg: `Failed to save lesson into the database. Error message: ${error}` });
  }
}
