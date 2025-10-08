/* eslint-disable quotes */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable indent */
import axios, { AxiosError, AxiosHeaders } from "axios";
import cookies from "js-cookie";
import {
  TGpPlusSubscriptionForClient,
  TUserSchemaV2,
} from "../../backend/models/User/types";
import { IErr, IUpdatedUserReqBody } from "../../types/global";
import { IGoogleDriveAuthResBody } from "../../pages/api/gp-plus/auth";
import { IPlan } from "../../backend/services/outsetaServices";
import Cookies from "js-cookie";
import {
  TReqQueryResetOutsetaEmail,
  TSuccessType,
} from "../../pages/api/gp-plus/outseta/reset-outseta-email";

export const updateUser = async (
  query?: Omit<Partial<TUserSchemaV2>, "password">,
  updatedUser: Omit<Partial<TUserSchemaV2>, "password"> = {},
  additionalReqBodyProps: Record<string, unknown> &
    Partial<IUpdatedUserReqBody> = {},
  token: string = ''
) => {
  try {
    if (!token) {
      throw new Error('The "token" parameter is required and cannot be empty.');
    }


    if (query &&
      Object.keys(query).length <= 0 ||
      (Object.keys(updatedUser).length <= 0 &&
        Object.keys(additionalReqBodyProps).length <= 0)
    ) {
      throw new Error(
        'The "query" and "updatedUser" parameters cannot be empty objects.'
      );
    }

    if (!token) {
      throw new Error('The "token" parameter cannot be empty.');
    }

    if (query &&
      (("id" in query && typeof query.id !== "string") ||
      ("email" in query && typeof query.email !== "string") ||
      ("emali" in query && "id" in query))
    ) {
      throw new Error(
        'The "id" and "email" parameters must be strings. Both cannot be present.'
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const responseBody = { ...(query ?? {}), updatedUser, ...additionalReqBodyProps };
    const response = await axios.put<{ wasSuccessful: boolean; msg: string }>(
      "/api/update-user",
      responseBody,
      { headers }
    );

    if (response.status !== 200) {
      throw new Error("Failed to update user.");
    }

    return response.data;
  } catch (error) {
    console.error(
      "An error has occurred, failed to update user. Reason: ",
      error
    );

    return null;
  }
};

export const sendDeleteUserReq = async (token: string) => {
  try {
    if (!token) {
      throw new Error('The "token" parameter cannot be empty.');
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.delete(`/api/delete-user`, {
      headers,
    });

    console.log("Response: ", response);

    if (response.status !== 200) {
      throw new Error("Failed to delete the target user.");
    }

    return { wasSuccessful: true };
  } catch (error: any) {
    if (error.response?.data?.errType === "userNotFound") {
      return { wasSuccessful: false, errType: "userNotFound" };
    }

    console.error("Failed to delete the target user. Reason: ", error);

    return { wasSuccessful: false, errType: "userDeletionErr" };
  }
};

/**
 * Makes a delete request to the server to delete the user from cache.
 * @param token The authentication token.
 * @throws An error has occurred if the server responds with a status code that is not 200 or the wrong parameter type is passed.
 */
export const deleteUserFromServerCache = async (token: string) => {
  try {
    if (!token) {
      throw new Error('The "token" parameter cannot be empty.');
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.delete("/api/delete-user-cache", { headers });

    if (response.status !== 200) {
      throw new Error("Failed to delete the user from cache.");
    }

    console.log("Response data: ", response.data);

    return {
      wasSuccessful: true,
    };
  } catch (error) {
    console.error("Failed to delete the user from cache. Reason: ", error);

    return {
      wasSuccessful: false,
      msg: "Failed to delete user from cache",
      errObj: error,
    };
  }
};

export class CustomHeaders extends AxiosHeaders {
  Authorization: string;
  "gdrive-token": string;
  "gdrive-token-refresh": string;

  constructor(appAccessToken: string) {
    super();
    this.Authorization = `Bearer ${appAccessToken}`;
    const gdriveAccessToken = Cookies.get("gdrive-token");

    if (gdriveAccessToken) {
      this["gdrive-token"] = gdriveAccessToken;
    }

    const gdriveRefreshToken = Cookies.get("gdrive-token-refresh");

    if (gdriveRefreshToken) {
      this["gdrive-token-refresh"] = gdriveRefreshToken;
    }
  }
}

export const authenticateUserWithGDrive = async (
  code: string,
  accessToken: string
) => {
  try {
    if (!accessToken) {
      throw new Error(
        "No access token provided. Cannot authenticate user with Google Drive"
      );
    }

    const headers = new CustomHeaders(accessToken);

    console.log("headers: ", headers);

    const { status, data } = await axios.post<
      IErr | { data: Partial<IGoogleDriveAuthResBody> }
    >("/api/gp-plus/auth", { code }, { headers });

    if (status !== 200) {
      throw new Error(
        `Failed to authenticate user with Google Drive. Status code: ${status}. Data: ${data}`
      );
    }

    if ("errType" in data) {
      throw new Error(
        data.errMsg || "Failed to authenticate user with Google Drive."
      );
    }

    return { ...data.data };
  } catch (error) {
    console.error(
      "Failed to authenticate user with Google Drive. Reason: ",
      error
    );

    return null;
  }
};

export const refreshGDriveToken = async (refreshToken: string) => {
  try {
    const { status, data } = await axios.post("/api/gp-plus/refresh-token", {
      refresh_token: refreshToken,
    });

    if (status !== 200) {
      throw new Error(
        `Failed to refresh Google Drive token. Status code: ${status}`
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to refresh Google Drive token. Reason: ", error);
    return null;
  }
};

export const getIndividualGpPlusSubscription = async (token: string) => {
  try {
    const response = await axios.get<{
      membership?: TGpPlusSubscriptionForClient;
    }>("/api/gp-plus/get-is-individual-member", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response object: ", response);
    console.log("Response, sup there: ", response.data);
    console.log("Response status: ", response.status);

    if (response.status !== 200) {
      throw new Error(
        `Failed to get individual GP+ subscription. Status code: ${response.status}`
      );
    }

    console.log("Will return the data sup there...");

    return response.data;
  } catch (error) {
    console.error("An error has ocurrred. Failed to get subscription: ", error);

    return null;
  }
};

export type IPlanDetails = NonNullable<
  Awaited<ReturnType<typeof getUserPlanDetails>>
>;

export const getUserPlanDetails = async (
  appAuthToken: string,
  willGetUserPlan: boolean
) => {
  try {
    const url = `${window.location.origin}/api/gp-plus/get-user-plan-details`;
    const response = await axios.get<{
      currentUserPlan?: IPlan;
      percentageSaved?: number;
    }>(url, {
      headers: {
        Authorization: `Bearer ${appAuthToken}`,
      },
      params: {
        willGetUserPlan,
        willComputeSavings: true,
      },
    });

    console.log("Response: ", response.data);
    console.log("Response status: ", response.status);

    if (response.status !== 200) {
      throw new Error(
        `Failed to get individual GP+ subscription. Status code: ${response.status}`
      );
    }

    console.log("Will return the data sup there...");

    return response.data;
  } catch (error) {
    console.error("An error has ocurrred. Failed to get subscription: ", error);

    return null;
  }
};

export const deleteUserOutsetaEmail = async (
  email: string,
  appAuthToken: string
) => {
  try {
    const params: TReqQueryResetOutsetaEmail = {
      userInputEmail: email,
    };
    const response = await axios.delete<TSuccessType>(
      `${window.location.origin}/api/gp-plus/outseta/reset-outseta-email`,
      {
        headers: {
          Authorization: `Bearer ${appAuthToken}`,
        },
        params,
      }
    );

    console.log("Response, outseta account deletion: ", response.data);
    console.log("Response status: ", response.status);

    if (response.status !== 200) {
      throw new Error(
        `Failed to delete the Outseta email. Status code: ${response.status}`
      );
    }

    return response.data;
  } catch (error) {
    console.error("Failed to delete the Outseta email: ", error);

    return { wasSuccessful: false };
  }
};
