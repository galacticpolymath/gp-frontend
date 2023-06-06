import { connectToMongodb } from '../../backend/db-connection/connection'
import { insertLesson } from '../../backend/services/lessonsServices'

// GOAL A: insert the test lesson into the database 

// GOAL B: before inserting the test lesson into the database, provide a schema validation for each lesson 

connectToMongodb()
    .then(result => {
        console.log('Successfully connected to the mongoDB: ', result)
    }).catch(error => {
        console.error('Failed to connect to mongoDB. Error message: ', error)
    })


export default function handler(request, response) {
    try {

    } catch (error) {

    }
}