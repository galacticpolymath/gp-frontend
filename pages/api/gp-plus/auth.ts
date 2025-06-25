/* eslint-disable quotes */

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { GOOGLE_DRIVE_PROJECT_CLIENT_ID } from "../../../globalVars";

interface IResBody {
  code: string;
}

interface IGDriveServerAuthRes extends Pick<IGoogleDriveAuthResBody, "access_token" | "refresh_token"> {
  refresh_token_expires_in: number;
  expires_in: number
}

export interface IGoogleDriveAuthResBody {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  refresh_token_expires_at: number;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const origin = request.headers.origin;
    const reqBody = request.body as IResBody;
    const redirect_uri = `${origin}/google-drive-auth-result`;
    console.log(
      "process.env.GOOGLE_DRIVE_AUTH_SECRET: ",
      process.env.GOOGLE_DRIVE_AUTH_SECRET
    );

    console.log("redirect_uri: ", redirect_uri);
    const googleDriveAuthReqBody = {
      client_id: GOOGLE_DRIVE_PROJECT_CLIENT_ID,
      client_secret: process.env.GOOGLE_DRIVE_AUTH_SECRET,
      redirect_uri,
      code: reqBody.code,
      grant_type: "authorization_code",
    };
    let { status, data } = await axios.post<Partial<IGDriveServerAuthRes>>(
      "https://oauth2.googleapis.com/token",
      googleDriveAuthReqBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("GP Plus auth response data:", data);

    if (status !== 200) {
      throw new Error(`GP Plus auth failed. Status code: ${status}`);
    }

    if (
      typeof data.access_token !== "string" ||
      typeof data.refresh_token !== "string" ||
      typeof data.refresh_token_expires_in !== "number" ||
      typeof data.expires_in !== "number"
    ) {
      throw new Error(`GP Plus auth failed. Response body received: ${data}`);
    }

    const _data = {
      ...data,
      expires_at: new Date().getTime() + data.expires_in * 1_000,
      refresh_token_expires_at:
        new Date().getTime() + data.refresh_token_expires_in * 1_000,
    };

    return response.status(200).json({ data: _data });
  } catch (error: any) {
    console.error("GP Plus auth failed.", error);
    console.error("Error response: ", error?.response);

    return response.status(500).send({
      errType: "authFailed",
      errMsg: "GP Plus auth failed. Server error.",
    });
  }
  // Body is intentionally left empty
}
