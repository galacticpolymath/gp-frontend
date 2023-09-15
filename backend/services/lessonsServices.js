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

const updateLesson = async (filterObj, objKeysAndUpdatedValsArr) => {
    try {
        const updatedLessonsKeysAndValsObj = Object.fromEntries(objKeysAndUpdatedValsArr);

        await Lessons.updateMany(filterObj, { $set: updatedLessonsKeysAndValsObj });

        return {
            msg: `The following fields were updated: ${objKeysAndUpdatedValsArr.map(({ key }) => key).join(" ")}`,
            wasSuccessful: true
        }
    } catch (error) {
        const errMsg = `Failed to get the lesson from the database. Error message: ${error}.`;

        console.error(errMsg)

        return { wasSuccessful: false, msg: errMsg }
    }
}

const retrieveLessonsResultObj = async (_id, numID, projectionObj = {}) => {
    try {
        let query = {};

        if (_id) {
            query._id = _id;
        }

        if (numID) {
            query.numID = parseInt(numID);
        }

        const lessons = await Lessons.find(query, projectionObj).lean();

        return { wasSuccessful: true, data: lessons }
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