import { insertLesson } from '../../backend/services/lessonsServices';

export default async function handler(request, response) {
  if (!request?.body || !Object.keys(request?.body)?.length) {
    return response.status(400).json({ msg: 'The request body is empty.' });
  }

  const { status, msg } = await insertLesson(request.body);

  return response.status(status).json({ msg: msg });
}
