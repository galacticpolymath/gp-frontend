

export default function handler(request, response) {
    console.log('Hey there, request has been received.')

    return response.status(200).json({ msg: "'/insert-lesson' route is live! Listening for tests to insert into the database." })
}