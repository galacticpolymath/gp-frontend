import { retrieveLessonsResultObj } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';


const getIsObj = val => (val !== null) && (typeof val === 'object') && (Array.isArray(val) === false);

class CustomError {
  constructor(message, code) {
    this.message = message;
    this.code = code;
  }
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(404).json({ msg: 'This route only accepts GET requests.' });
  }

  try {
    await connectToMongodb();

    let { _id, numId, projections } = request.query;

    if(_id && (typeof _id !== 'string')){
      throw new CustomError("The '_id' query param must be a string.", 400);
    }

    if(numId && isNaN(parseInt(numId))){
      throw new CustomError("The 'numId' must be a number.", 400);      
    }

    projections = typeof projections === 'string' ? JSON.parse(projections) : projections;

    if ((projections !== undefined) && !getIsObj(projections)) {
      throw new CustomError("The 'projections' query param must be an object.", 400)
    }

    const { wasSuccessful, data, msg } = (projections ? await retrieveLessonsResultObj(_id, numId, projections) : await retrieveLessonsResultObj(_id, numId)) ?? {}

    if (!wasSuccessful && msg) {
      throw new CustomError(msg, 500);
    }

    if (!wasSuccessful) {
      throw new CustomError("Failed to retrieve lessons from db.", 500)
    }

    return response.status(200).json({ lessons: data });
  } catch (error) {
    console.error('Error obj within catch block: ', error)
    const { code, message } = error;

    return response.status(code ?? 500).json({ msg: `Error message: ${message ?? 'An error has occurred on the server.'}` });
  }
}
