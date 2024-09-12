/* eslint-disable quotes */
import { Credentials } from '../../backend/services/googleDriveServices';
import creds from '../../creds.json';

export default function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ msg: "Incorrect request method. Must be a 'GET'." });
  }

  let credentials = new Credentials();
  credentials = JSON.stringify(credentials);
  let credentialsSplitted = credentials.split('');
  let indexesOfValsToDel = [];

  for (let index = 0; index < credentialsSplitted?.length; index++) {
    const nextVal = credentialsSplitted[index + 1];

    if (nextVal === undefined) {
      break;
    }

    const currentVal = credentialsSplitted[index];

    if ((currentVal === '\\') && (nextVal === '\\')) {
      indexesOfValsToDel.push(index);
    }
  }

  credentialsSplitted = credentialsSplitted.filter((_, index) => !indexesOfValsToDel.includes(index));
  credentials = credentialsSplitted.join('');

  // console.log("SERVICE_ACCOUNT_PRIVATE_KEY: ", process.env.SERVICE_ACCOUNT_PRIVATE_KEY);

  console.log('creds.private_key, yo there: ', creds.private_key);

  // console.log('credentials, yo there: ', credentials);

  return response.json({ environment: process.env.NEXT_PUBLIC_VERCEL_ENV });
}