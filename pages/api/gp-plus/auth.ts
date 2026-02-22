 

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { GOOGLE_DRIVE_PROJECT_CLIENT_ID } from "../../../globalVars";
import {
  createGoogleAdminService,
  getGoogleGroupMember,
  insertGoogleGroupMember,
} from "../../../backend/services/googleGroupServices";
import { CustomError } from "../../../backend/utils/errors";
import { updateUserCustom } from "../../../backend/services/userServices";
import { TUserSchemaV2 } from "../../../backend/models/User/types";
import { getJwtPayloadPromise } from "../../../nondependencyFns";

const getGoogleDriveClientId = () =>
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_PROJECT_CLIENT_ID_TEST ||
  GOOGLE_DRIVE_PROJECT_CLIENT_ID ||
  process.env.AUTH_CLIENT_ID ||
  "";

const getGoogleDriveClientSecret = () =>
  process.env.GOOGLE_DRIVE_AUTH_SECRET || process.env.AUTH_CLIENT_SECRET;

interface IResBody {
  code: string;
  redirectUri?: string;
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
    this.client_id = getGoogleDriveClientId();
    this.client_secret = getGoogleDriveClientSecret() as string;
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
  refresh_token?: string;
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
    console.log("Request headers: ", request.headers);

    const { payload } =
      (await getJwtPayloadPromise(request.headers.authorization)) ?? {};

    const reqBody = request.body as IResBody;
    if (!reqBody?.code || typeof reqBody.code !== "string") {
      throw new CustomError("Missing Google authorization code.", 400);
    }

    const clientSecret = getGoogleDriveClientSecret();
    const clientId = getGoogleDriveClientId();

    if (!clientSecret) {
      throw new CustomError("Google Drive auth secret is not configured.", 500);
    }
    const forwardedProto = request.headers["x-forwarded-proto"];
    const proto =
      typeof forwardedProto === "string"
        ? forwardedProto.split(",")[0]
        : "http";
    const host = request.headers.host;
    const fallbackOrigin = host ? `${proto}://${host}` : undefined;
    const refererOrigin = request.headers.referer
      ? new URL(request.headers.referer).origin
      : undefined;
    const bodyRedirectUri =
      typeof reqBody?.redirectUri === "string" ? reqBody.redirectUri : undefined;

    const redirect_uri =
      bodyRedirectUri ||
      (request.headers.origin
        ? `${request.headers.origin}/google-drive-auth-result`
        : undefined) ||
      (refererOrigin ? `${refererOrigin}/google-drive-auth-result` : undefined) ||
      (fallbackOrigin ? `${fallbackOrigin}/google-drive-auth-result` : undefined);

    if (!redirect_uri) {
      throw new CustomError("Unable to resolve Google redirect URI.", 400);
    }

    const googleDriveAuthReqBody = {
      client_id: clientId,
      client_secret: clientSecret,
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

    if (userInfoRes?.status !== 200) {
      throw new Error(
        "Retrieved a non-200 response from the google drive server."
      );
    }

    if (!userInfoRes.data?.email) {
      throw new CustomError("No user email found in the response.", 404);
    }

    try {
      const googleAdminService = await createGoogleAdminService();

      if (googleAdminService) {
        const userGroupMember = await getGoogleGroupMember(
          userInfoRes.data.email,
          googleAdminService
        );

        console.log("Retrieved google group member: ", userGroupMember);

        if (!userGroupMember) {
          const insertionResult = await insertGoogleGroupMember(
            userInfoRes.data.email,
            googleAdminService
          );
          if (payload?.email) {
            const userDbUpatedResult = await updateUserCustom(
              { email: payload.email },
              {
                $addToSet: {
                  gdriveAuthEmails: userInfoRes.data.email,
                } as Record<keyof Pick<TUserSchemaV2, "gdriveAuthEmails">, string>,
              },
              {
                upsert: true,
              }
            );

            console.log("User DB updated result: ", userDbUpatedResult);
          } else {
            console.warn(
              "No validated app JWT payload during Google auth callback; skipping user DB gdriveAuthEmails update."
            );
          }
          console.log("Insertion of a google group member: ", insertionResult);
        }
      } else {
        console.warn("Google Admin service unavailable during GP+ auth; skipping group sync.");
      }
    } catch (groupSyncError) {
      console.error("Google group sync failed during GP+ auth:", groupSyncError);
    }

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

    const customStatus =
      typeof error?.code === "number" ? error.code : undefined;
    const upstreamStatus =
      typeof error?.response?.status === "number"
        ? error.response.status
        : undefined;
    const statusCode = customStatus || upstreamStatus || 500;
    const upstreamMessage =
      error?.response?.data?.error_description ||
      error?.response?.data?.error?.message ||
      error?.response?.data?.error;
    const upstreamData = error?.response?.data;
    const errMsg =
      error?.message ||
      upstreamMessage ||
      "GP Plus auth failed. Server error.";

    return response.status(statusCode).send({
      errType: "authFailed",
      errMsg,
      details: upstreamData ?? upstreamMessage ?? null,
    });
  }
}
