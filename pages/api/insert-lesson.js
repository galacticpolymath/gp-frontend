import { insertLesson } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';

export default async function handler(request, response) {
  try {
    if (
      !request?.body?.lesson ||
      (request?.body?.lesson && (typeof request?.body?.lesson === 'object') && !Object.keys(request?.body?.lesson)?.length) ||
      (typeof request?.body?.lesson !== 'object')
    ) {
      return response.status(400).json({ msg: 'The `request.body.lesson` is empty or the wrong data type.' });
    }

    const { wasSuccessful } = await connectToMongodb(
      15_000,
      0,
      true,
      true
    );

    if (!wasSuccessful) {
      throw new CustomError('Failed to connect to the database.', 500);
    }

    const { status, msg } = await insertLesson(request.body.lesson);

    if (status !== 200) {
      throw new CustomError(msg, status);
    }

    return response.status(status).json({ msg: msg });
  } catch (error) {
    const { code, message } = error;

    return response.status(code ?? 500).json({ msg: message ?? 'Failed to insert lesson into the db.' });
  }
}
