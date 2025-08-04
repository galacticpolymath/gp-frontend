/* eslint-disable quotes */

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { GOOGLE_DRIVE_PROJECT_CLIENT_ID } from "../../../globalVars";

interface IResBody {
  code: string;
}

interface IGDriveServerAuthRes
  extends Pick<IGoogleDriveAuthResBody, "access_token" | "refresh_token"> {
  refresh_token_expires_in: number;
  expires_in: number;
}

export class GoogleAuthReqBody {
  private client_id: string;
  private client_secret: string;
  private redirect_uri: string;
  private refresh_token?: string;
  private code?: string;
  private grant_type: "authorization_code" | "refresh_token";

  constructor(redirectUri: string, code: string, refreshToken: string) {
    this.client_id = GOOGLE_DRIVE_PROJECT_CLIENT_ID;
    this.client_secret = process.env.GOOGLE_DRIVE_AUTH_SECRET as string;
    this.redirect_uri = redirectUri;

    if (code) {
      this.code = code;
      this.grant_type = "authorization_code";
      return;
    }

    this.refresh_token = refreshToken;
    this.grant_type = "refresh_token";
  }
}

export interface IGoogleDriveAuthResBody {
  access_token: string;
  refresh_token: string;
  email: string;
  expires_at: number;
  refresh_token_expires_at: number;
}

export interface IUserInfo {
  email: string;
  [key: string]: string;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const origin = request.headers.origin;
    const reqBody = request.body as IResBody;
    const redirect_uri = `${origin}/google-drive-auth-result`;
    const googleDriveAuthReqBody = {
      client_id: GOOGLE_DRIVE_PROJECT_CLIENT_ID,
      client_secret: process.env.GOOGLE_DRIVE_AUTH_SECRET,
      redirect_uri,
      code: reqBody.code,
      grant_type: "authorization_code",
    };
    console.log("googleDriveAuthReqBody: ", googleDriveAuthReqBody);
    const res = await axios.post<Partial<IGDriveServerAuthRes>>(
      "https://oauth2.googleapis.com/token",
      googleDriveAuthReqBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Google drive auth res: ");
    console.log(res);

    const { status, data } = res;

    if (status !== 200) {
      throw new Error(`GP Plus auth failed. Status code: ${status}`);
    }

    if (
      typeof data.access_token !== "string" ||
      typeof data.refresh_token !== "string" ||
      typeof data.expires_in !== "number"
    ) {
      console.error(
        "Failed to get Google Drive access token. Data retrieved: "
      );
      console.error(data);
      throw new Error(
        `GP Plus auth failed. Response body received: ${JSON.stringify(data)}`
      );
    }

    const userInfoRes = await axios.get<Partial<IUserInfo>>(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      }
    );

    if(userInfoRes?.status !== 200){
      throw new Error("Retrieved a non-200 response from the google drive server.");
    }

    if(!userInfoRes.data?.email){
      throw new Error("The email is not present in the user info response.");
    }

    console.log("userInfoRes.data: ", userInfoRes.data);

    const _data: Partial<IGoogleDriveAuthResBody> = {
      ...data,
      email: userInfoRes.data?.email,
      expires_at: new Date().getTime() + data.expires_in * 1_000,
    };

    return response.status(200).json({ data: _data });
  } catch (error: any) {
    console.error("GP Plus auth failed. Error object: ");
    console.error(error);
    console.error("Error response: ");
    console.error(error?.response);

    return response.status(500).send({
      errType: "authFailed",
      errMsg: "GP Plus auth failed. Server error.",
      errorObj: error,
    });
  }
}
