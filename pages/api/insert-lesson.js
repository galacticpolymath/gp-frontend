import { connectToMongodb } from '../../backend/utils/connection'
import { insertLesson } from '../../backend/services/lessonsServices'

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(404).json({ msg: "This route only accepts POST requests." })
    }

    try {
        await connectToMongodb()
        console.log('request.body: ', request.body)
        const { status, msg } = await insertLesson(request.body)

        return response.status(status).json({ msg })
    } catch (error) {
        console.error("An error has occurred. Can't insert lesson into the database.")

        return response.status(500).json({ msg: `Failed to save lesson into the database. Error message: ${error}` })
    }
}