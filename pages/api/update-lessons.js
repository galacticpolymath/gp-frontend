import { createFilterObj, retrieveLessonsResultObj, updateLesson } from "../../backend/services/lessonsServices";
import { connectToMongodb } from "../../backend/utils/connection";

// example of the filterObj: 
// { numId: [1,2,3,4] }

class CustomError {
    constructor(message, code) {
        this.message = message;
        this.code = code;
    }
}

export default async function handler(request, response) {
    try {
        let { filterObj, keysAndUpdatedValsObj } = request.body;

        if (filterObj && ((typeof filterObj !== 'object') || ((typeof filterObj === 'object') && (filterObj === null)))) {
            throw new CustomError("The value for 'filterObj' field must be an object.", 400);
        }

        if (!keysAndUpdatedValsObj) {
            throw new CustomError("'keysAndUpdatedValsObj' is required.", 400);
        }

        if (
            !keysAndUpdatedValsObj ||
            (typeof keysAndUpdatedValsObj !== 'object') ||
            ((typeof keysAndUpdatedValsObj === 'object') && ((keysAndUpdatedValsObj === null) || Array.isArray(keysAndUpdatedValsObj)))
        ) {
            throw new CustomError("The field 'keysAndUpdatedValsObj' must be an object of all of updated values and their corresponding lesson keys.", 400);
        }

        let filterObjForDbQuery = {};
        filterObj = filterObj ? JSON.parse(JSON.stringify(filterObj)) : null;
        keysAndUpdatedValsObj = JSON.parse(JSON.stringify(keysAndUpdatedValsObj));


        if (filterObj) {
            const { filterObj: _filterObjForUpdatedLessonServiceResult, errMsg: createFilterObjErrMsg } = createFilterObj(Object.entries(filterObj));

            if (createFilterObjErrMsg) {
                throw new CustomError(createFilterObjErrMsg, 400);
            }

            filterObjForDbQuery = _filterObjForUpdatedLessonServiceResult
        }

        await connectToMongodb();

        const { errMsg: updateLessonErrMsg } = await updateLesson(filterObjForDbQuery, keysAndUpdatedValsObj);

        if (updateLessonErrMsg) {
            throw new CustomError(updateLessonErrMsg, 400);
        }

        const projectionForRetrieveUpdatedLessonsResultObj = Object.entries(keysAndUpdatedValsObj)
            .map(keyAndVal => ([keyAndVal[0], 1]))
            .reduce((projectionForRetrieveUpdatedLessonsResultObj, fieldAndProjectionNum) => {
                const [fieldName, projectionNum] = fieldAndProjectionNum;
                projectionForRetrieveUpdatedLessonsResultObj[fieldName] = projectionNum;

                return projectionForRetrieveUpdatedLessonsResultObj;
            }, {});
        const { data: lessons, errMsg: retrieveLessonsResultObjErrorMsg } = await retrieveLessonsResultObj(filterObjForDbQuery, projectionForRetrieveUpdatedLessonsResultObj)

        if (retrieveLessonsResultObjErrorMsg) {
            throw new CustomError(retrieveLessonsResultObjErrorMsg, 500)
        }

        const updatedLessonsResults = lessons.map(lesson => {
            const { _id, ...restOfLessonKeyValPairs } = lesson;

            return {
                _id: _id,
                updatedFieldsObj: Object.keys(restOfLessonKeyValPairs)?.length ? restOfLessonKeyValPairs : null
            }
        })

        return response.status(200).json({ updatedLessonsResults: updatedLessonsResults });
    } catch (error) {
        const { code, message } = error
        console.log('error message: ', message)

        return response.status(code).json({ msg: message });
    }
}

