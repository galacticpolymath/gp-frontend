import { createFilterObj, retrieveLessons, updateLesson } from '../../backend/services/lessonsServices';
import { connectToMongodb } from '../../backend/utils/connection';
import { CustomError } from '../../backend/utils/errors';

export default async function handler(request, response) {
  try {
    const { filterObj, keysAndUpdatedValsObj } = request.body;

    if (filterObj && ((typeof filterObj !== 'object') || ((typeof filterObj === 'object') && (filterObj === null)))) {
      throw new CustomError("The value for 'filterObj' field must be an object.", 400);
    }

    if (!keysAndUpdatedValsObj || (typeof keysAndUpdatedValsObj !== 'object') || ((typeof keysAndUpdatedValsObj === 'object') && ((keysAndUpdatedValsObj === null) || Array.isArray(keysAndUpdatedValsObj)))) {
      throw new CustomError("The field 'keysAndUpdatedValsObj' must be an object of all of the updated values and their corresponding lesson keys.", 400);
    }

    let filterObjForDbQuery = {};
    const parsedFilterObj = filterObj ? JSON.parse(JSON.stringify(filterObj)) : null;
    const parsedKeysAndUpdatedValsObj = JSON.parse(JSON.stringify(keysAndUpdatedValsObj));

    if (parsedFilterObj) {
      const {
        filterObj: _filterObjForUpdatedLessonServiceResult,
        errMsg: createFilterObjErrMsg,
      } = createFilterObj(Object.entries(parsedFilterObj));

      if (createFilterObjErrMsg) {
        throw new CustomError(createFilterObjErrMsg, 400);
      }

      filterObjForDbQuery = _filterObjForUpdatedLessonServiceResult;
    }

    const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
      15_000,
      0,
      true,
      true
    );

    if (!wasConnectionSuccessful) {
      throw new CustomError('Failed to connect to the database.', 500);
    }

    const { errMsg: updateLessonErrMsg } = await updateLesson(
      filterObjForDbQuery,
      parsedKeysAndUpdatedValsObj,
    );

    if (updateLessonErrMsg) {
      throw new CustomError(updateLessonErrMsg, 500);
    }

    const projectionForRetrieveUpdatedLessonsResultObj = Object.entries(
      parsedKeysAndUpdatedValsObj,
    )
      .map(keyAndVal => [keyAndVal[0], 1])
      .reduce((acc, fieldAndProjectionNum) => {
        const [fieldName, projectionNum] = fieldAndProjectionNum;
        acc[fieldName] = projectionNum;

        return acc;
      }, {});

    const {
      data: lessons,
      errMsg: retrieveLessonsResultObjErrorMsg,
    } = await retrieveLessons(
      filterObjForDbQuery,
      projectionForRetrieveUpdatedLessonsResultObj,
    );

    if (retrieveLessonsResultObjErrorMsg) {
      throw new CustomError(retrieveLessonsResultObjErrorMsg, 500);
    }

    const updatedLessonsResults = lessons.map(lesson => {
      const { _id, ...restOfLessonKeyValPairs } = lesson;

      return {
        _id: _id,
        updatedFieldsObj: Object.keys(restOfLessonKeyValPairs).length
          ? restOfLessonKeyValPairs
          : null,
      };
    });

    return response.status(200).json({ updatedLessonsResults });
  } catch (error) {
    const { code, message } = error;

    return response.status(code).json({ msg: message });
  }
}
