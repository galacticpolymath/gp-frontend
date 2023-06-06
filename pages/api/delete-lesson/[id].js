import mongoose, { connect } from 'mongoose'
import { deleteLesson } from '../../../backend/services/lessonsServices'
import { connectToMongodb } from '../../../backend/utils/connection'

export default async function handler(request, response) {
    if (request.method !== 'DELETE') {
        return response.status(404).json({ msg: "This route only accepts POST requests." })
    }

    const { lessonId } = request.query;

    if(!lessonId){
        return response.status(404).json({ msg: "Must provide a lesson id." })
    }
    
    try {
        await connectToMongodb()
        const { status, msg } = await deleteLesson(lessonId)

        return response.status(status).json({ msg })
    } catch (error) {
        console.error("An error has occurred. Can't insert lesson into the database.")
        
        return response.status(500).json({ msg: `Failed to save lesson into the database. Error message: ${error}` })
    }
}