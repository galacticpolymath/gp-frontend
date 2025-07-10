/* eslint-disable quotes */

import { NextApiRequest, NextApiResponse } from "next";
import {
  getGpPlusMembershipStatus,
  getUser,
  getUserByEmail,
} from "../../../backend/services/userServices";
import { verifyJwt } from "../../../nondependencyFns";
import cache from "../../../backend/utils/cache";
import { TUserSchemaForClient, TUserSchemaV2 } from "../../../backend/models/User/types";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "GET") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("yo there meng!");

    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      return response.status(401).json({
        errType: "Unauthorized",
        message: "Authorization header not found",
      });
    }

    const token = authHeader?.split(" ")[1];
    const jwtVerificationResult = await verifyJwt(token);

    if (!jwtVerificationResult) {
      return response
        .status(401)
        .json({ errType: "Unauthorized", message: "Invalid token" });
    }

    if (!jwtVerificationResult.payload.email) {
      return response.status(404).json({
        errType: "emailNotFound",
        message: "Token does not contain email",
      });
    }

    const userCached = cache.get<TUserSchemaV2>(
      jwtVerificationResult.payload.email
    );

    if (userCached && "outsetaPersonEmail" in userCached) {
      const membership = await getGpPlusMembershipStatus(userCached.outsetaPersonEmail);

      console.log("membership: ", membership);
    }

    let user = await getUserByEmail<TUserSchemaForClient>(jwtVerificationResult.payload.email, {
      outsetaPersonEmail: 1,
      _id: 0,
    });

    if (!user) {
      return response
        .status(404)
        .json({ message: "User not found", errType: "userNotFound" });
    }

    if(!user.outsetaPersonEmail){
      const membership = await getGpPlusMembershipStatus(user.outsetaPersonEmail);

      console.log("membership: ", membership);
    }

    user = {
      ...user,
      isGpPlusMember: !!user.isGpPlusMember,
    };

    cache.set(jwtVerificationResult.payload.email, user, 60 * 3);

    response.status(200).json({ isGpPlusMember: user?.isGpPlusMember });
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ message: "Internal server error", errType: "serverError" });
  }
}
