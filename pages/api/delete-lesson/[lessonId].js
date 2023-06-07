import { deleteLesson } from '../../../backend/services/lessonsServices'
import { connectToMongodb } from '../../../backend/utils/connection';

export default async function handler(request, response) {
    if (request.method !== 'DELETE') {
        return response.status(404).json({ msg: "This route only accepts POST requests." })
    }

    const { lessonId } = request.query;

    if (!lessonId) {
        console.error("No lesson id was provided.")

        return response.status(404).json({ msg: "Must provide a lesson id." })
    }

    const lessonIdParsed = parseInt(lessonId)

    if(lessonIdParsed === NaN) {
        console.error("Lesson id must be a number.")

        return response.status(404).json({ msg: "Lesson id must be a number." })
    }

    
    try {
        await connectToMongodb()
        
        console.log('Connected to mongodb.')

        const { status, msg } = await deleteLesson(lessonIdParsed)

        return response.status(status).json({ msg: msg })
    } catch (error) {
        console.error("An error has occurred. Can't insert lesson into the database.")

        return response.status(500).json({ msg: `Failed to save lesson into the database. Error message: ${error}` })
    }
}