/* eslint-disable quotes */

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    console.log("Request method:", request.method);
    console.log("Request body:", request.body);
    console.log("Request headers:", request.headers);
    console.log("Request query:", request.query);
  } catch (error: any) {
    console.error("Error updating account subscription:", error);
  }
}
