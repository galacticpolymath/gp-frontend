import { insertLesson } from '../../backend/services/lessonsServices'

// GOAL A: insert the test lesson into the database 

// GOAL B: before inserting the test lesson into the database, provide a schema validation for each lesson 

export default function handler(request, response) {
    const bodyParsed = JSON.parse(request.body)

    if((request.method === 'POST') && request?.body){
        const result = insertLesson(request.body.lesson)

        if(wasSuccessful){
            return response.status(200).json({ msg: `'${request.body.lesson.title}' was inserted into the database.` })
        }
    }

    
    response.status(404).json({ msg: "Request info was incorrect. Only accept POST request." })
}