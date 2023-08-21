import { retrieveLessonsResultObj } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';


const getIsObj = val => (val !== null) && (typeof val === 'object') && (Array.isArray(val) === false);

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(404).json({ msg: 'This route only accepts GET requests.' });
  }

  try {
    await connectToMongodb();

    let { _id, numId, projections } = request.query;

    if(_id && (typeof _id !== 'string')){
      let errorObj = new Error("The '_id' query param must be a string.");
      errorObj.code = 400;
      throw errorObj;
    }

    if(numId && isNaN(parseInt(numId))){
      let errorObj = new Error("The 'numId' must be a number.");
      errorObj.code = 400;
      throw errorObj;
    }

    projections = typeof projections === 'string' ? JSON.parse(projections) : projections;

    if ((projections !== undefined) && !getIsObj(projections)) {
      let errorObj = new Error("The 'projections' query param must be an object.");
      errorObj.code = 400;
      throw errorObj;
    }

    const { wasSuccessful, data, msg } = (projections ? await retrieveLessonsResultObj(_id, numId, projections) : await retrieveLessonsResultObj(_id, numId)) ?? {}

    if (!wasSuccessful && msg) {
      let errorObj = new Error(msg);
      errorObj.code = 500;
      throw errorObj;
    }

    if (!wasSuccessful) {
      let errorObj = new Error("Failed to retrieve lessons from db.");
      errorObj.code = 500;
      throw errorObj;
    }

    return response.status(200).json({ lessons: data });
  } catch (error) {
    console.log('Error obj within catch block: ', error)
    const { code, message } = error;

    return response.status(code ?? 500).json({ msg: `Error message: ${message ?? 'An error has occurred on the server.'}` });
  }
}
