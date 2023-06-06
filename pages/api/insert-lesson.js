import { connect } from 'mongoose'
import { connectToMongodb } from '../../backend/db-connection/connection'
import { insertLesson } from '../../backend/services/lessonsServices'

// GOAL A: insert the test lesson into the database 

// GOAL B: before inserting the test lesson into the database, provide a schema validation for each lesson 

export default async function handler(request, response) {
    try {
        const result = await connectToMongodb();
        
        if(result){

        }
        

    } catch (error) {
        console.error('An error has occurred: ', error)
    }

    response.status(200).json({ msg: 'This is route is live at "/api/insert-lesson."' })
}