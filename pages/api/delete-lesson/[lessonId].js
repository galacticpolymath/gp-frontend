import { getIsReqAuthorizedResult } from '../../../backend/services/authServices';
import { deleteLesson } from '../../../backend/services/lessonsServices';
import { connectToMongodb } from '../../../backend/utils/connection';

export default async function handler(request, response) {
  if (request.method !== 'DELETE') {
    return response.status(404).json({ msg: 'This route only accepts POST requests.' });
  }
  const authorizationResult = await getIsReqAuthorizedResult(request, 'dbAdmin');

  if (!authorizationResult?.isReqAuthorized || !authorizationResult) {
    return response.status(401).json({ msg: authorizationResult?.msg ?? 'You are not authorized to access this service.' });
  }
  
  const { lessonId } = request.query;
  if (!lessonId) {
    console.log('No lesson id was provided.')
    return response.status(404).json({ msg: 'Must provide a lesson id.' });
  }

  const lessonIdParsed = parseInt(lessonId);
  if (isNaN(lessonIdParsed)) {
    console.log('Lesson id is not a number.')
    return response.status(404).json({ msg: 'Lesson id must be a number.' });
  }

  try {
    console.log("Inserting lesson into the database.")

    await connectToMongodb();

    const { status, msg } = await deleteLesson(lessonIdParsed);

    return response.status(status).json({ msg });
  } catch (error) {
    return response.status(500).json({ msg: `Failed to save lesson into the database. Error message: ${error}` });
  }
}
