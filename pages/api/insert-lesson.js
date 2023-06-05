

export default function handler(request, response){
    console.log('Hey there, request has been received.')

    response.send("'/insert-lesson' route is live! Listening for tests to insert into the database.")
}