
export default async function handler(request, response) {
  const { method, headers, body } = request;

  // MAIN GOAL: insert the lesson into the database after the jwt is validated
  
  // GOAL #2: validate the jwt token

  // GOAL #3: get the jwt from the headers of the request

  if (method !== 'POST') {
    return response.status(404).json({ msg: 'This route only accepts POST requests.' });
  }



  return response.status(200).json({ msg: "Lesson was successfully inserted into the db." })
}
