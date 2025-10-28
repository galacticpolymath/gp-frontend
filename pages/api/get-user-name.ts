/* eslint-disable quotes */
/* eslint-disable no-console */

import {
  getUserByEmail,
} from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyJwt } from "../../nondependencyFns";
import {
  IUserSchema,
  TUserSchemaForClient,
  TUserSchemaV2,
} from "../../backend/models/User/types";

const PROJECTIONS: Partial<
  Record<keyof (TUserSchemaV2 & IUserSchema), 0 | 1 | undefined>
> = {
  firstName: 1,
  lastName: 1,
  _id: 0,
} as const;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const authorization = request?.headers?.["authorization"] ?? "";
    const authSplit = authorization.split(" ");

    if (authSplit.length !== 2) {
      throw new CustomError(
        "The authorization string is in a invalid format.",
        422
      );
    }

    const jwtVerified = await verifyJwt(authSplit[1]);
    const { payload } = jwtVerified;
    const { email } = payload;
    const { wasSuccessful } = await connectToMongodb(15_000, 0, true);

    if (!wasSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    const userAccount = await getUserByEmail<TUserSchemaForClient>(
      email,
      PROJECTIONS
    );

    if (!userAccount) {
      throw new CustomError("User not found.", 404);
    }

    return response.status(200).json({ firstName: userAccount.firstName, lastName: userAccount.lastName });
  } catch (error: any) {
    const { code, message } = error ?? {};

    console.error(
      'Failed to get the "About User" form for the target user. Reason: ',
      error
    );

    return response.status(code ?? 500).json({
      msg: `Error message: ${
        message ?? "An error has occurred on the server."
      }`,
    });
  }
}
