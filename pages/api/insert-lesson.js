import { getIsReqAuthorizedResult } from "../../backend/services/authServices";

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(404).json({ msg: 'This route only accepts POST requests.' });
  }

  if (!request?.headers?.authorization) {
    return response.status(401).json({ msg: 'You are not authorized to access this route.' });
  }

  const authorizationResult = await getIsReqAuthorizedResult(request);

  console.log('authorizationResult: ', authorizationResult)

  // MAIN GOAL: insert the lesson into the database after the jwt is validated

  // GOAL #2: validate the jwt token

  // GOAL #3: get the jwt from the headers of the request





  return response.status(200).json({ msg: "Lesson was successfully inserted into the db." })
}
