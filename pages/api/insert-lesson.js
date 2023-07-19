import { getIsReqAuthorizedResult } from '../../backend/services/authServices';
import { insertLesson } from '../../backend/services/lessonsServices';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(404).json({ msg: 'This route only accepts POST requests.' });
  }

  if (!request?.headers?.authorization) {
    return response.status(401).json({ msg: 'You are not authorized to access this route.' });
  }

  const authorizationResult = await getIsReqAuthorizedResult(request, 'dbAdmin');

  if (!authorizationResult?.isReqAuthorized || !authorizationResult) {
    return response.status(403).json({ msg: authorizationResult?.msg ?? 'You are not authorized to access this service.' });
  }

  if (!Object.keys(request?.body)?.length) {
    return response.status(400).json({ msg: 'The request body is empty.' });
  }

  const lessonInsertationResult = await insertLesson(request.body);

  return response.status(lessonInsertationResult.status).json({ msg: lessonInsertationResult.msg });
}
