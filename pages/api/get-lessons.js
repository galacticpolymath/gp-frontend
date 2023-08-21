import { retrieveLessonsResultObj } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';


const getIsObj = val => (val !== null) && (typeof val === 'object') && (Array.isArray(val) === false);

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(404).json({ msg: 'This route only accepts GET requests.' });
  }

  try {
    await connectToMongodb();

    const { _id, numId, projections } = request.query;

    if(_id && (typeof _id !== 'string')){
      throw new Error("The '_id' query param must be a string.");
    }

    if(numId && isNaN(parseInt(numId))){
      throw new Error("The 'numId' must be a number.");
    }

    console.log('projections: ', projections)

    if ((projections !== undefined) && !getIsObj(projections)) {
      throw new Error("The 'projections' query param must be an object.");
    }

    const { wasSuccessful, data, msg } = (projections ? await retrieveLessonsResultObj(_id, numId, projections) : await retrieveLessonsResultObj(_id, numId)) ?? {}

    if (!wasSuccessful && msg) {
      throw new Error(msg);
    }

    if (!wasSuccessful) {
      throw new Error("Failed to retrieve lessons from db.");
    }

    return response.status(200).json({ lessons: data });
  } catch (error) {

    return response.status(500).json({ msg: `Error message: ${error}` });
  }
}
