/* eslint-disable quotes */

import { NextApiRequest, NextApiResponse } from "next";
import {
  getUserByEmail,
} from "../../../backend/services/userServices";
import { verifyJwt } from "../../../nondependencyFns";
import cache from "../../../backend/utils/cache";
import {
  TUserSchemaForClient,
  TUserSchemaV2,
} from "../../../backend/models/User/types";
import { connectToMongodb } from "../../../backend/utils/connection";
import { getBillingType, getGpPlusIndividualMembershipStatus, TAccountStageLabel, TGpPlusMembershipRetrieved } from "../../../backend/services/outsetaServices";

const HAS_MEMBERSHIP_STATUSES: Set<TAccountStageLabel> = new Set([
  "Cancelling",
  "Subscribing",
  "Expired",
  "Past due",
] as TAccountStageLabel[]);

export type TGpPlusMembershipForClient = TGpPlusMembershipRetrieved;

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
    let membership: TGpPlusMembershipRetrieved | undefined = undefined;

    if (userCached && "outsetaPersonEmail" in userCached) {
      membership = (await getGpPlusIndividualMembershipStatus(
        userCached.outsetaPersonEmail
      )) as TGpPlusMembershipRetrieved;

      console.log("membership: ", membership);
      // make a earlier return here.
    }

    console.log(
      "jwtVerificationResult.payload.email: ",
      jwtVerificationResult.payload.email
    );

    const { wasSuccessful } = await connectToMongodb(15_000, 0, true);

    if (!wasSuccessful) {
      console.error("Failed to connect to the database.");

      return response.status(500).json({
        errType: "DbConnectionErr",
        message: "Failed to connect to the database",
      });
    }

    let user = await getUserByEmail<TUserSchemaForClient>(
      jwtVerificationResult.payload.email,
      {
        outsetaPersonEmail: 1,
        _id: 0,
      }
    );

    if (!user) {
      return response
        .status(404)
        .json({ message: "User not found", errType: "userNotFound" });
    }

    if (user.outsetaPersonEmail) {
      console.log(
        "The user has a outseta person email: ",
        user.outsetaPersonEmail
      );

      membership = (await getGpPlusIndividualMembershipStatus(
        user.outsetaPersonEmail
      )) as TGpPlusMembershipRetrieved;
    }

    console.log("membership: ", membership);

    user = {
      ...user,
      isGpPlusMember:
        typeof membership?.AccountStageLabel === "string"
          ? HAS_MEMBERSHIP_STATUSES.has(membership?.AccountStageLabel)
          : false,
      gpPlusSubscription: membership,
    };

    cache.set(jwtVerificationResult.payload.email, user, 60 * 3);

    const membershipForClient = {
      ...membership,
      BillingRenewalTerm: membership?.BillingRenewalTerm
        ? getBillingType(membership?.BillingRenewalTerm)?.[0]
        : null,
    };

    response.status(200).json({ membership: membershipForClient });
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ message: "Internal server error", errType: "serverError" });
  }
}
