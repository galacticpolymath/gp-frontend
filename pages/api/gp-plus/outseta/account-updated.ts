/* eslint-disable quotes */

import { NextApiRequest, NextApiResponse } from "next";
import { TAccountStageLabel } from "../../../../backend/services/outsetaServices";
import { getUser, updateUserCustom } from "../../../../backend/services/userServices";
import { sendEmail } from "../../../../backend/services/emailServices";
import {
  createGoogleAdminService,
  deleteGoogleGroupMember,
} from "../../../../backend/services/googleGroupServices";
import { TUserSchemaV2 } from "../../../../backend/models/User/types";

interface IPersonAccount {
  Account: {
    Name: string;
    [key: string]: unknown;
  };
}

type TOutsetaReqBody = Partial<{
  PersonAccount: IPersonAccount[];
  AccountStageLabel: TAccountStageLabel;
  Name: string;
}>;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    console.log("Request method:", request.method);
    console.log("Request body: ", request.body);

    const reqBody = request.body as TOutsetaReqBody;

    if (reqBody.AccountStageLabel === "Expired" && reqBody.Name) {
      console.log(
        `User canceled their GP Plus subscription, with email: ${reqBody.Name}`
      );

      const { user } = await getUser(
        { outsetaAccountEmail: reqBody.Name },
        { gdriveAuthEmails: 1, _id: 1 }
      );

      if (!user) {
        console.log("No user found, sending email to confirm account closure.");

        const { wasSuccessful } = await sendEmail({
          from: "shared@galacticpolymath.com",
          to: "shared@galacticpolymath.com",
          subject: "User canceled gp plus sub, outseta email not found.",
          html: `
            <p>A user canceled their GP Plus subscription, but their Outseta email address was not found in our database.</p>
            <p>Here is the email address that was used to sign up for the GP Plus subscription: ${reqBody.Name}</p>
          `,
          text: `
            A user canceled their GP Plus subscription, but their Outseta email address was not found in our database. 
            The email address used to sign up for the GP Plus subscription is: ${reqBody.Name}
          `,
        });

        console.log("Email sending logic result: ", wasSuccessful);

        if (!wasSuccessful) {
          console.error(
            "Error sending email to confirm gp plus subscription cancelation."
          );
        }

        return response.json({});
      }

      if (user.gdriveAuthEmails.length) {
        const drive = await createGoogleAdminService();

        if (!drive) {
          const { wasSuccessful } = await sendEmail({
            from: "shared@galacticpolymath.com",
            to: "shared@galacticpolymath.com",
            subject: "GP Plus subscription cancelation, but no drive auth.",
            html: `
            <p>There was an error canceling a user's GP Plus subscription. They had the following gdrive auth emails: ${user.gdriveAuthEmails.join(
              ", "
            )}</p>
            <p>Can you please cancel their subscription for them?</p>
          `,
            text: `
            There was an error canceling a user's GP Plus subscription. 
            They had the following gdrive auth emails: ${user.gdriveAuthEmails.join(
              ", "
            )}
            Can you please cancel their subscription for them?
          `,
          });

          console.log("Email sending logic result: ", wasSuccessful);

          if (!wasSuccessful) {
            console.error(
              "Error sending email to support about the emails that needs to be canceled from the user.gdriveAuthEmails value"
            );
          }

          return response.json({});
        }

        for (const gdriveAuthEmail of user.gdriveAuthEmails) {
          const deletionResultFromGoogleGroup = await deleteGoogleGroupMember(gdriveAuthEmail, drive);

          console.log("The result of removing the user from the teachers google group: ", deletionResultFromGoogleGroup);
        }

        const updates: Partial<TUserSchemaV2> = {
          gdriveAuthEmails: []
        }
        const userUpdatedResult = await updateUserCustom({ _id: user._id }, {
          $set: updates
        })

        console.log("The user's gdrive auth emails have been successfully updated: ", userUpdatedResult);

        if (!userUpdatedResult) {
          console.error("Error updating user's gdrive auth emails: ", userUpdatedResult);

          return response.status(500).json({});
        }


        return response.json({});
      }

      console.log("The user has no gdrive auth emails.");
    }

    return response.json({});
  } catch (error: any) {
    console.error("Error updating account subscription:", error);

    return response.status(500).json({});
  }
}
