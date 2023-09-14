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






const retrieveLessonsResultObj = async (_id, numID, projectionObj = {}) => {
    try {
        let query = {};
        
        if(_id){
            query._id = _id;
        }
        
        if(numID){
            query.numID = parseInt(numID);
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