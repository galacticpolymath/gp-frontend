/* eslint-disable quotes */

import { NextApiRequest, NextApiResponse } from "next";
import { TAccountStageLabel } from "../../../../backend/services/outsetaServices";

interface IPersonAccount{
  Account: {
    Name: string,
    [key: string]: unknown
  }
}

interface IOutsetaReqBody{
  PersonAccount: IPersonAccount[],
  AccountStageLabel: TAccountStageLabel
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    console.log("sup there, request: ", request);
    console.log("Request method:", request.method);
    console.log("Request body: ", request.body);
    console.log("Request headers:", request.headers);
    console.log("Request query:", request.query);
    
    const reqBody = request.body as IOutsetaReqBody;

    if(reqBody.AccountStageLabel === "Expired"){
      
    }

    return response.json({})
  } catch (error: any) {
    console.error("Error updating account subscription:", error);

    return response.status(500).json({})
  }
}
