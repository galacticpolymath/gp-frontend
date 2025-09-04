import { NextApiRequest, NextApiResponse } from "next";
import {
  deleteAccount,
  deletePerson,
  getGpPlusMembership,
} from "../../../../backend/services/outsetaServices";
import { sendEmail } from "../../../../backend/services/emailServices";

export type TReqQueryResetOutsetaEmail = {
  userInputEmail?: string;
};
export type TSuccessType = { successType:  "userNotFound" | "userDeleted"}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    console.log("Got request to reset outseta email");
    
    const reqQuery = request.query as TReqQueryResetOutsetaEmail;

    if (!reqQuery.userInputEmail) {
      throw new Error("No userInputEmail provided");
    }

    const gpPlusMembership = await getGpPlusMembership(reqQuery.userInputEmail);

    if (
      gpPlusMembership.Uid &&
      gpPlusMembership.person?.Uid &&
      gpPlusMembership.AccountStageLabel === "Expired"
    ) {
      const accountDeletionResult = await deleteAccount(gpPlusMembership.Uid);
      const personDeletionResult = await deletePerson(
        gpPlusMembership.person?.Uid
      );

      console.log("outseta account deletion result: ", accountDeletionResult);
      console.log("outseta person deletion result: ", personDeletionResult);

      if (
        !personDeletionResult.wasSuccessful ||
        !accountDeletionResult.wasSuccessful
      ) {
        const { wasSuccessful } = await sendEmail({
          from: "shared@galacticpolymath.com",
          to: "shared@galacticpolymath.com",
          subject: "Failed to delete expired GP+ Outseta account.",
          html: `
            <p>Failed to delete Outseta account with email: ${reqQuery.userInputEmail}</p>
            <p>This is an error, since the user canceled their GP+ subscription, and their account should have been deleted in Outseta.</p>
          `,
          text: `
            Failed to delete Outseta account with email: ${reqQuery.userInputEmail}
            This is an error, since the user canceled their GP+ subscription, and their account should have been deleted in Outseta.
          `,
        });

        if (!wasSuccessful) {
          throw new Error(
            "Failed to send email to shared@galacticpolymath.com"
          );
        }

        const body: TSuccessType = {
            successType: "userDeleted"
        }

        return response.status(200).json(body);
      }
    }

    const body: TSuccessType = {
        successType: "userNotFound"
    }

    return response.status(200).json(body);
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      error:
        "An error has occurred. Failed to check if the target email exist on outseta.",
    });
  }
}
