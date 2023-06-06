import { connectToMongodb } from "../db-connection/connection"

async function insertLesson(lesson){
    const wasSuccessful = await connectToMongodb();

    if(!wasSuccessful){
        console.error("Failed to connect the database.")
        return 
    }
}


export {
    insertLesson
}