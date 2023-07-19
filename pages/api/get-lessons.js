import { connectToMongodb } from '../../backend/utils/connection';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(404).json({ msg: 'This route only accepts POST requests.' });
  }

  try {
    const connection = await connectToMongodb();

    console.log('connection: ', connection)

    return response.status(200).json({ msg: 'Lessons are retrieved.', lessons: [] });
  } catch (error) {

    return response.status(500).json({ msg: `Failed to get the lessons from the database. Error message: ${error}` });
  }
}
