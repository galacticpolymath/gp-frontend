import { updateLesson } from "../../backend/services/lessonsServices";

export default async function handler(request, response) {
    try {
        const { filterObj, keysAndUpdatedValsArr } = request.body;

        if (!keysAndUpdatedValsArr) {
            return response.status(400).json({ msg: "The field 'keysAndUpdatedValsArr' must be present." });
        }

        if (!Array.isArray(areObjKeysAndUpdatedValsArrValid)) {
            return response.status(400).json({ msg: "The field 'keysAndUpdatedValsArr' must be an array." });
        }

        const areObjKeysAndUpdatedValsArrValid = keysAndUpdatedValsArr.every(keyAndVal => {
            if (!keyAndVal ||
                (((typeof keyAndVal === 'object') && (keyAndVal !== null)) && (!("key" in keyAndVal) || !("value" in keyAndVal)))
            ) {
                return false;
            }

            return true;
        })

        if (!areObjKeysAndUpdatedValsArrValid) {
            return response.status(400).json({ msg: "At least one object in 'keysAndUpdatedValsArr' array is invalid. Must have 'key' and 'value' field." });
        }

        const updatedLessonsKeysAndValsObj = Object.fromEntries(keysAndUpdatedValsArr);
        const { errMsg } = await updateLesson(filterObj, updatedLessonsKeysAndValsObj);

        if (errMsg) {
            return response.status(500).json({ msg: errMsg });
        }

        const projectionForRetrieveUpdatedLessonsResultObj = Object.fromEntries(keysAndUpdatedValsArr)
            .map(keyAndVal => ([keyAndVal[0], 1]))
            .reduce((projectionForRetrieveUpdatedLessonsResultObj, fieldAndProjectionNum) => {
                const [fieldName, projectionNum] = fieldAndProjectionNum;
                projectionForRetrieveUpdatedLessonsResultObj[fieldName] = projectionNum;

                return projectionForRetrieveUpdatedLessonsResultObj;
            }, {});
        const { data: lessons } = await retrieveLessonsResultObj(filterObj, projectionForRetrieveUpdatedLessonsResultObj)

        return response.status(200).json({ updatedLessonsResults: lessons });
    } catch (error) {
        const errMsg = `Something went wrong in updating the target lesson(s). Error message: ${error}`
        console.error(errMsg)

        return response.status(500).json({ msg: errMsg });
    }
}
