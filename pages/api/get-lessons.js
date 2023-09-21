import { createFilterObj, retrieveLessons } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';


export default async function handler(request, response) {
  try {
    const { method, query } = request;

    if (method !== 'GET') {
      throw new CustomError('This route only accepts GET requests.', 404);
    }

    console.log('query: ', query)
    let { filterObj, projectionsObj } = query ?? {};

    projectionsObj = (typeof projectionsObj === 'string') ? JSON.parse(projectionsObj) : projectionsObj;
    filterObj = (typeof filterObj === 'string') ? JSON.parse(filterObj) : filterObj;

    if(projectionsObj && ((typeof projectionsObj !== 'object') && (projectionsObj === null) || Array.isArray(projectionsObj) || (typeof projectionsObj !== 'object'))){
      throw new CustomError('`projectionsObj` must be an object and cannot be an array.' , 400)
    }

    if(filterObj && ((typeof filterObj !== 'object') && (filterObj === null) || Array.isArray(filterObj) || (typeof filterObj !== 'object'))){
      throw new CustomError('`filterObj` must be an object and cannot be an array.', 400)
    }

    const filterObjCreationResult = (filterObj && Object.keys(filterObj).length) ? createFilterObj(Object.entries(filterObj)) : {};

    if (filterObjCreationResult.errMsg) {
      throw new CustomError(filterObjCreationResult.errMsg, 400);
    }

    await connectToMongodb();

    const { data, errMsg } = await retrieveLessons(filterObj ?? {}, projectionsObj ?? {})

    if (errMsg) {
      throw new CustomError(errMsg, 500)
    }

    return response.status(200).json({ lessons: data });
  } catch (error) {
    console.log('error: ', error)
    const { code, message } = error;

    return response.status(code ?? 500).json({ msg: `Error message: ${message ?? 'An error has occurred on the server.'}` });
  }
}
