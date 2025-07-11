/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */

import { getMailingListContact } from "../../backend/services/emailServices";
import { getGpPlusIndividualMembershipStatus, getUserByEmail, handleUserDeprecatedV1Fields } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyJwt } from "../../nondependencyFns";
import { IUserSchema, TUserSchemaForClient, TUserSchemaV2 } from "../../backend/models/User/types";

export type TUserAccountData = Pick<ReturnType<typeof handleUserDeprecatedV1Fields>, Exclude<keyof typeof PROJECTIONS, "_id">>

const PROJECTIONS: Partial<Record<keyof (TUserSchemaV2 & IUserSchema), number>> = {
      outsetaPersonEmail: 1,
      gradesOrYears: 1,
      reasonsForSiteVisit: 1,
      subjects: 1,
      classroomSize: 1,
      country: 1,
      zipCode: 1,
      occupation: 1,
      isTeacher: 1,
      firstName: 1,
      lastName: 1,
      name: 1,
      referredByDefault: 1,
      referredByOther: 1,
      schoolTypeDefaultSelection: 1,
      schoolTypeOther: 1,
      classSize: 1,
      subjectsTaughtDefault: 1,
      institution: 1,
      subjectsTaughtCustom: 1,
      siteVisitReasonsCustom: 1,
      siteVisitReasonsDefault: 1,
      isNotTeaching: 1,
      gradesTaught: 1,
      gradesType: 1,
      _id: 0,
    } as const;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const authorization = request?.headers?.['authorization'] ?? '';
    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
      throw new CustomError('The authorization string is in a invalid format.', 422);
    }

    const { email } = (await verifyJwt(authSplit[1])).payload;
    const { wasSuccessful } = await connectToMongodb(
      15_000,
      0,
      true,
    );

    if (!wasSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    const gpPlusMembershipStatusPromise = getGpPlusIndividualMembershipStatus(email);
    const getUserAccountPromise = getUserByEmail<TUserSchemaForClient>(
      email,
      PROJECTIONS
    );
    const getMailingListContactPromise = getMailingListContact(
      email
    );
    let [userAccount, mailingListContact, gpPlusMembershipStatus] = await Promise.all([
      getUserAccountPromise,
      getMailingListContactPromise,
      gpPlusMembershipStatusPromise
    ]);

    if (!userAccount) {
      throw new CustomError("User not found.", 404);
    }

    console.log("gpPlusMembershipStatus: ", gpPlusMembershipStatus);


    if (!request.query.willNotRetrieveMailingListStatus) {
        userAccount = {
          ...userAccount,
          isOnMailingList: !!mailingListContact,
          isGpPlusMember: gpPlusMembershipStatus === "Subscribing",
        };
    }

    return response.status(200).json(handleUserDeprecatedV1Fields(userAccount));
  } catch (error: any) {
    const { code, message } = error ?? {};

    console.error(
      'Failed to get the "About User" form for the target user. Reason: ',
      error
    );

    return response
      .status(code ?? 500)
      .json({
        msg: `Error message: ${message ?? "An error has occurred on the server."
          }`,
      });
  }
}
