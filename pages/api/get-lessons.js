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
  try {
    const { method, query } = request;

    if (method !== 'GET') {
      throw new CustomError('This route only accepts GET requests.', 404);
    }

    if(!query){
      throw new CustomError("'query' is not defined.", 404);
    }    

    let { _id, numID, projections } = query;

    if (_id && (typeof _id !== 'string')) {
      throw new CustomError("The '_id' query param must be a string.", 400);
    }

    if (numID && isNaN(parseInt(numID))) {
      throw new CustomError("The 'numID' must be a number.", 400);
    }

    projections = (typeof projections === 'string') ? JSON.parse(projections) : projections;

    if ((projections !== undefined) && !getIsObj(projections)) {
      throw new CustomError("The 'projections' query parameter must be an object.", 400);
    }

    await connectToMongodb();

    const { wasSuccessful, data, msg } = (projections ? await retrieveLessonsResultObj(_id, numID, projections) : await retrieveLessonsResultObj(_id, numID)) ?? {};

    if (!wasSuccessful && msg) {
      throw new CustomError(msg, 500);
    }

    if (!wasSuccessful) {
      throw new CustomError('Failed to retrieve lessons from db.', 500);
    }

    return response.status(200).json({ lessons: data });
  } catch (error) {
    const { code, message } = error;

    return response.status(code ?? 500).json({ msg: `Error message: ${message ?? 'An error has occurred on the server.'}` });
  }
}
