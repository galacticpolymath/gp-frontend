import Lessons from '../models/lesson'
import { connectToMongodb } from '../utils/connection'

const insertLesson = async lesson => {
    try {
        await connectToMongodb();

        const newLesson = new Lessons(lesson);
        const saveResult = await newLesson.save();

        saveResult.validateSync()

        const { Title, _id } = lesson;

        return { status: 200, msg: `Lesson '${Title}' (${_id}) was successfully saved into the database!` }
    } catch (error) {
        const errMsg = `Failed to save lesson into the database. Error message: ${error}`

        console.error(errMsg)

        return { status: 500, msg: errMsg }
    }
}

const deleteLesson = async lessonId => {
    console.log("Deleting lesson with the following id: ", lessonId);

    try {
        await connectToMongodb();

        await Lessons.deleteOne({ _id: lessonId })

        console.log(`Lesson with id ${lessonId} was successfully deleted from the database!`)

        return { status: 200, msg: 'Lesson was successfully deleted from the database!' }
    } catch (error) {

        return { status: 500, msg: `Failed to delete lesson from the database. Error message: "${error}"` }
    }
}

// GOAL: query the database for the lesson that needs to be updated. Receive the following from the client:
// - the filter object that will be used to update the given lesson
// - the fields that will be updated: "key of the value that will be updated" : "the updated value"
// - use $set to update the given field. 

const createObjFromArr = (keysAndValsForQueryObj, isDbQueryObj) => keysAndValsForQueryObj.reduce((filterObj, keyAndVal) => {
    const [key, val] = keyAndVal
    filterObj[key] = (isDbQueryObj && Array.isArray(val)) ? { $in: val } : val

    return filterObj
}, {});

const retrieveLessonsResultObj = async (keysAndValsForDbQueryObj, projectionObj = {}) => {
    try {
        const filterObj = createObjFromArr(keysAndValsForDbQueryObj, true)
        const lessons = await Lessons.find(filterObj, projectionObj).lean();

        return { wasSuccessful: true, data: lessons }
    } catch (error) {
        const errMsg = `Failed to get the lesson from the database. Error message: ${error}.`;

        console.error(errMsg)

        return { wasSuccessful: false, msg: errMsg }
    }
}

const updateLesson = async (keysAndValsForDbQueryObj, keysAndUpdatedValsArr) => {
    try {
        const filterObj = createObjFromArr(keysAndValsForDbQueryObj, true);
        // an example of lesson being updated: 
        // section.participants[0].name = "John Doe"
        const updatedLessonsKeysAndValsObj = Object.fromEntries(keysAndUpdatedValsArr);

        await Lessons.updateMany(filterObj, { $set: updatedLessonsKeysAndValsObj });

        const projectionForRetrieveLessonsResultObj = Object.fromEntries(keysAndUpdatedValsArr)
            .map(keyAndVal => ([keyAndVal[0], 1]))
            .reduce((projectionForRetrieveLessonsResultObj, fieldAndWillProjectNumArr) => {
                const [fieldName, projectionNum] = fieldAndWillProjectNumArr;
                projectionForRetrieveLessonsResultObj[fieldName] = projectionNum;
                
                return projectionForRetrieveLessonsResultObj;
            }, {})
        const { data: lessons } = await retrieveLessonsResultObj(filterObj, projectionForRetrieveLessonsResultObj)

        return {
            updatedLessonsResults: lessons,
        }
    } catch (error) {
        const errMsg = `Failed to get the lesson from the database. Error message: ${error}.`;

        console.error(errMsg)

        return { wasSuccessful: false, msg: errMsg }
    }
}

export {
    insertLesson,
    deleteLesson,
    retrieveLessonsResultObj,
    updateLesson
}