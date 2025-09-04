/* eslint-disable quotes */

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { GOOGLE_DRIVE_PROJECT_CLIENT_ID } from "../../../globalVars";

interface IRefreshTokenRequestBody {
  refresh_token: string;
}

interface IRefreshTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method !== "POST") {
      return response.status(405).json({ error: "Method not allowed" });
    }

    const { refresh_token } = request.body as IRefreshTokenRequestBody;

    if (!refresh_token) {
      return response.status(400).json({ 
        error: "Refresh token is required", 
      });
    }

    const refreshTokenRequestBody = {
      client_id: GOOGLE_DRIVE_PROJECT_CLIENT_ID,
      client_secret: process.env.GOOGLE_DRIVE_AUTH_SECRET,
      refresh_token,
      grant_type: "refresh_token",
    };

    const { status, data } = await axios.post<IRefreshTokenResponse>(
      "https://oauth2.googleapis.com/token",
      refreshTokenRequestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (status !== 200) {
      throw new Error(`Token refresh failed. Status code: ${status}`);
    }

    if (!data.access_token || !data.expires_in) {
      throw new Error("Invalid response from Google OAuth");
    }

    const responseData = {
      access_token: data.access_token,
      expires_in: data.expires_in,
      expires_at: new Date().getTime() + data.expires_in * 1_000,
    };

    return response.status(200).json(responseData);
  } catch (error: any) {
    console.error("Token refresh failed:", error);
    
    return response.status(500).json({
      error: "Failed to refresh token",
      details: error?.response?.data || error.message,
    });
  }
} 