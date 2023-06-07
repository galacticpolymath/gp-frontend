import { deleteLesson } from '../../../backend/services/lessonsServices';
import { connectToMongodb } from '../../../backend/utils/connection';

export default async function handler(request, response) {
  if (request.method !== 'DELETE') {
    return response.status(404).json({ msg: 'This route only accepts POST requests.' });
  }

  const { lessonId } = request.query;
  if (!lessonId) {
    return response.status(404).json({ msg: 'Must provide a lesson id.' });
  }

  const lessonIdParsed = parseInt(lessonId);
  if (isNaN(lessonIdParsed)) {
    return response.status(404).json({ msg: 'Lesson id must be a number.' });
  }

  try {
    await connectToMongodb();

    const { status, msg } = await deleteLesson(lessonIdParsed);
    return response.status(status).json({ msg });
  } catch (error) {
    return response.status(500).json({ msg: `Failed to save lesson into the database. Error message: ${error}` });
  }
}
