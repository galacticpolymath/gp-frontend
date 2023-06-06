import mongoose, { connect } from 'mongoose'
import { connectToMongodb } from '../../backend/utils/connection'
import { insertLesson } from '../../backend/services/lessonsServices'

// GOAL A: insert the test lesson into the database 

// GOAL B: before inserting the test lesson into the database, provide a schema validation for each lesson 

export default async function handler(request, response) {
    connectToMongodb()
        .then(result => {
            if(result){
                console.log('Successfully connected to mongodb!')
            }
        })
        .catch(error => {
            console.error('An error has occurred in connecting to mongodb: ', error)
        })
    
    mongoose.connection.on('connected', () => {
        console.log('Will route to the appropiate service. Insertion of a lesson.')
    })

    response.status(200).json({ msg: 'This is route is live at "/api/insert-lesson."' })
}