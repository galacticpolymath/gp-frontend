import { insertLesson } from '../../backend/services/lessonsServices'

export default function handler(request, response) {
    console.log('Hey there, request has been received.')
    console.log('request?.body: ', request?.body.lesson)
    const bodyParsed = JSON.parse(request.body)
    console.log('bodyParsed: ', bodyParsed)

    if((request.method === 'POST') && request?.body){
        const { wasSuccessful, errMsg } = insertLesson(request.body.lesson)

        if(wasSuccessful){
            return response.status(200).json({ msg: `'${request.body.lesson.title}' was inserted into the database.` })
        }
    }

    
    response.status(404).json({ msg: "Request info was incorrect. Only accept POST request." })
}