import { Lesson } from '../models/lesson'

async function insertLesson(lesson){
    try {
        const newLesson = new Lesson({ ...lesson })
        await newLesson.save() 

        return { status: 200, msg: 'Lesson was successfully saved into the database!' }
    } catch(error){
        console.error('An error has occurred. Cannot insert lesson into the database. Error message: ', error)

        return { status: 500, msg: `Failed to save lesson into the database. Error message: ${error}` }
    }

}


export {
    insertLesson
}