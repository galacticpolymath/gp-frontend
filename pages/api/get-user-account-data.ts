/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */

import { getMailingListContact } from "../../backend/services/emailServices";
import {
  getUserByEmail,
  handleUserDeprecatedV1Fields,
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
import {
  getGpPlusMembership,
  TAccountStageLabel,
} from "../../backend/services/outsetaServices";
import {
  getLatestValidUnitCopyFolderJob,
  updateCopyUnitJobs,
} from "../../backend/services/copyUnitJobResultServices";

const HAS_MEMBERSHIP_STATUSES: Set<TAccountStageLabel> = new Set([
  "Cancelling",
  "Subscribing",
  "Expired",
  "Past due",
] as TAccountStageLabel[]);
const PROJECTIONS: Partial<
  Record<keyof (TUserSchemaV2 & IUserSchema), 0 | 1 | undefined>
> = {
  outsetaAccountEmail: 1,
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
  _id: 1,
} as const;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const authorization = request?.headers?.["authorization"] ?? "";
    const gdriveAccessToken = request?.headers?.["gdrive-token"] ?? "";
    const gdriveRefreshToken = request?.headers?.["gdrive-token-refresh"] ?? "";
    const origin = new URL(request.headers.referer ?? "").origin;
    const authSplit = authorization.split(" ");

    if (authSplit.length !== 2) {
      throw new CustomError(
        "The authorization string is in a invalid format.",
        422
      );
    }

    const jwtVerified = await verifyJwt(authSplit[1]);
    console.log("bacon sauce, jwtVerified: ", jwtVerified);
    const { payload } = jwtVerified;
    const { email, userId } = payload;
    const { wasSuccessful } = await connectToMongodb(15_000, 0, true);

    if (!wasSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }
    const getUserAccountPromise = getUserByEmail<TUserSchemaForClient>(
      email,
      PROJECTIONS
    );
    const getMailingListContactPromise = getMailingListContact(email);
    let [userAccount, mailingListContact] = await Promise.all([
      getUserAccountPromise,
      getMailingListContactPromise,
    ]);

    if (!userAccount) {
      throw new CustomError("User not found.", 404);
    }

    if (userAccount.outsetaAccountEmail) {
      const gpPlusMembership = await getGpPlusMembership(
        userAccount.outsetaAccountEmail
      );
      console.log("gpPlusMembership: ", gpPlusMembership);
      userAccount = {
        ...userAccount,
        isGpPlusMember: HAS_MEMBERSHIP_STATUSES.has(
          gpPlusMembership.AccountStageLabel as TAccountStageLabel
        ),
        gpPlusSubscription: gpPlusMembership,
      };
    }

    // if the user is on a selected unit, then get the google drive folder link
    if (
      typeof request.query.unitId === "string" &&
      typeof request.query.gdriveEmail === "string" &&
      typeof gdriveAccessToken === "string" &&
      typeof gdriveRefreshToken === "string"
    ) {
      const latestValidUnitCopyFolder = await getLatestValidUnitCopyFolderJob(
        request.query.unitId,
        gdriveAccessToken,
        gdriveRefreshToken,
        origin,
        userAccount._id,
        request.query.gdriveEmail
      );

      console.log("latestValidUnitCopyFolder: ", latestValidUnitCopyFolder);

      const { errType, latestUnitFolderCopy, nonexistingFolders } =
        latestValidUnitCopyFolder;

      if (errType) {
        console.log("Failed to retrieve the target folder. Reason: ", errType);
      } else if (latestUnitFolderCopy?.gdriveFolderId) {
        userAccount = {
          ...userAccount,
          viewingUnitFolderCopyId: latestUnitFolderCopy?.gdriveFolderId,
        };
      }

      if(nonexistingFolders?.length){
        const updatesResult = await updateCopyUnitJobs({
          _id: { $in: nonexistingFolders },
        }, {
          doesFolderCopyExistInUserGDrive: false,
        });

        console.log("updatesResult: ", updatesResult);

        if (updatesResult && updatesResult?.modifiedCount === 0 || !updatesResult) {
          console.error("Failed to update documents.");
        } else {
          console.log(`Total documents updated: ${updatesResult.modifiedCount}`);
        }
      }
    }

    if (!request.query.willNotRetrieveMailingListStatus) {
      userAccount = {
        ...userAccount,
        isOnMailingList: !!mailingListContact,
      };
    }

    return response.status(200).json(handleUserDeprecatedV1Fields(userAccount));
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
