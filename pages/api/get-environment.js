/* eslint-disable quotes */

import { addUserToMailingList } from "../../backend/services/emailServices";

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ msg: "Incorrect request method. Must be a 'GET'." });
  }

  await addUserToMailingList("gtorionnotion@gmail.com", "Gabriel", "Torion", "http://localhost:3000");

  return response.json({ environment: process.env.NEXT_PUBLIC_VERCEL_ENV });
}