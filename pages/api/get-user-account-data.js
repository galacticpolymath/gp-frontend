/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */

import { getMailingListContact } from "../../backend/services/emailServices";
import { getUserByEmail } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import { verifyJwt } from "../../backend/utils/security";

export default async function handler(request, response) {
  try {
    const authorization = request?.headers?.['authorization'] ?? '';
    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
      throw new CustomError('The authorization string is in a invalid format.', 422);
    }

    const { email } = (await verifyJwt(authSplit[1])).payload;
    let projections = {
      gradesOrYears: 1,
      reasonsForSiteVisit: 1,
      subjects: 1,
      classroomSize: 1,
      country: 1,
      zipCode: 1,
      occupation: 1,
      isTeacher: 1,
      name: 1,
      _id: 0,
    };

    if (request.query?.custom_projections?.length) {
      const customProjections = request.query?.custom_projections.split(", ");
      projections = Object.fromEntries(
        customProjections
          .filter((projection) => projection)
          .map((projection) => [projection, 1])
      );
      projections = {
        ...projections,
        _id: 0,
      };
    }

    const { wasSuccessful } = await connectToMongodb(
      15_000,
      0,
      true,
    );

    if (!wasSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    const getUserAccountPromise = getUserByEmail(
      email,
      projections
    );
    const getMailingListContactPromise = getMailingListContact(
      email
    );
    let [userAccount, mailingListContact] = await Promise.all([
      getUserAccountPromise,
      getMailingListContactPromise,
    ]);

    if (!userAccount) {
      throw new CustomError("User not found.", 404);
    }

    if (!request.query.willNotRetrieveMailingListStatus) {
      userAccount = {
        ...userAccount,
        isOnMailingList: !!mailingListContact,
      };
    }

    return response.status(200).json(userAccount);
  } catch (error) {
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
