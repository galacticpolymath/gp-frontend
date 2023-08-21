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

// can get the lesson based on the following:
// by the _id of the lesson
// by the numId of the lesson
// both above values
// none of the above values, in that case, get all of the lessons from the db

const retrieveLessonsResultObj = async (_id, numId, projectionObj = {}) => {
    try {
        let query = {};
        
        if(_id){
            query._id = _id;
        }
        
        if(numId){
            query.numId = parseInt(numId);
        }
        
        const lessons = await Lessons.find(query, projectionObj).lean();

        return { wasSuccessful: true, data: lessons }
    } catch (error) {
        const errMsg = `Failed to get the lesson from the database. Error message: ${error}.`;

        console.error(errMsg)

        return { wasSuccessful: false, msg: errMsg  }
    }

}

export { insertLesson, deleteLesson, retrieveLessonsResultObj }