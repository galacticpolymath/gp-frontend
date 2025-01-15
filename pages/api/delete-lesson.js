import { deleteLesson } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';

export default async function handler(request, response) {
  try {
    const { _id: lessonId } = request.query;

    if (!lessonId) {
      throw new CustomError('Must provide a lesson id.', 404);
    }

    const { wasSuccessful } = await connectToMongodb();

    if (!wasSuccessful) {
      throw new CustomError('Failed to connect to the database.', 500);
    }

    const { status, msg } = await deleteLesson(lessonId);

    return response.status(status).json({ msg });
  } catch (error) {
    const { code, message } = error;

    return response.status(code ?? 500).json({ msg: message ?? `Failed to save lesson into the database. Error message: ${error}` });
  }
}