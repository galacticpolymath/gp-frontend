import { getServerSession } from 'next-auth';
import { authOptions } from '../../backend/authOpts/authOptions';

// GOAL #1: 
// -when the user is logged, create a refresh token and store that token into the database for the user to receive

// GOAL #2:
// -create a route that will determine how long the token has until it is expired 

// GOAL #3: 
// -create a route that will handle the user getting a new token

export default async function handler(request, response) {
  const session = await getServerSession(request, response, authOptions);

  console.log('session: ', session);

  return response.status(200).json({
    message: 'Hello World!',
  });
} 