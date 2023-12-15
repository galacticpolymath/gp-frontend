import { jwtVerify } from 'jose';
import { CustomError } from '../../backend/utils/errors';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(404).json({ msg: "Invalid request method. Must be a 'POST' request." });
  }

  if (!request.body.accessToken) {
    return response.status(404).json({ msg: 'Access token was not provided.' });
  }

  try {
    const decoded = await jwtVerify(request.body.accessToken, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

    if(!decoded){
      throw new CustomError('Your jwt has expired.', 401);
    }

    const jwtExpDate = new Date(decoded.payload.exp * 1000);
    const day = jwtExpDate.getDate().toString();
    let hours = jwtExpDate.getHours().toString();
    hours = hours.length === 1 ? `0${hours}` : hours;
    let mins = jwtExpDate.getMinutes().toString();
    mins = mins.length === 1 ? `0${mins}` : mins;
    let secs = jwtExpDate.getMinutes().toString();
    secs = secs.length === 1 ? `0${secs}` : secs;
        
    response.status(200).json({ msg: `Your jwt access token will expire at ${hours}:${mins}:${secs} on ${jwtExpDate.getMonth() + 1}/${(day.length === 1) ? `0${day}` : day}/${jwtExpDate.getFullYear()}.` });
  } catch (error){
    const { message, status } = error;

    response.status(status ?? 500).json({ msg: message ?? 'Your jwt has expired.' });
  }
}