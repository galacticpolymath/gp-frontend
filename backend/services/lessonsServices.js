import Lessons from '../models/lesson'

const insertLesson = async lesson => {
    try {
        const newLesson = new Lessons({ ...lesson })
        const saveResult = await newLesson.save()

        saveResult.validateSync()

        return { status: 200, msg: `Lesson '${lesson.Title}' was successfully saved into the database!` }
    } catch (error) {
        const errMsg = `Failed to save lesson into the database. Error message: ${error}`

        console.error(errMsg)

        return { status: 500, msg: errMsg }
    }
}

const deleteLesson = async lessonId => {
    try {
        await Lessons.findByIdAndDelete(lessonId)

        console.log(`Lesson with id ${lessonId} was successfully deleted from the database!`)

        return { status: 200, msg: 'Lesson was successfully deleted from the database!' }
    } catch (error) {
        return { status: 500, msg: `Failed to delete lesson from the database. Error message: "${error}"` }
    }
}

export { insertLesson, deleteLesson }