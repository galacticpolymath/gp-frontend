/* eslint-disable quotes */
/* eslint-disable indent */
import { CustomError } from "../../backend/utils/errors";
import {
  deleteUserByEmail,
  getUserByEmail,
} from "../../backend/services/userServices";
import { cache } from "../../backend/authOpts/authOptions";
import { connectToMongodb } from "../../backend/utils/connection";
import { NextApiRequest, NextApiResponse } from "next";
import {
  deleteAccount,
  deletePerson,
  getGpPlusMembership,
} from "../../backend/services/outsetaServices";
import { sendEmail } from "../../backend/services/emailServices";
import { z } from 'zod';
import { getJwtPayloadPromise } from "../../nondependencyFns";

const QueryParamsSchema = z.object({
  dbType: z.string().min(1),
  userIds: z.union([
    z.string().min(1),
    z.array(z.string().min(1)).min(1),
  ]).transform(val => Array.isArray(val) ? val : [val]),
});

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method !== "DELETE") {
      throw new CustomError(
        "Incorrect request method. Must be a 'DELETE'.",
        405
      );
    }

    const authorization = request.headers.authorization;
    
    if (!authorization) {
      throw new CustomError("Authorization header is required.", 401);
    }

    const jwtPayload = await getJwtPayloadPromise(authorization);
    
    if (!jwtPayload) {
      throw new CustomError("Invalid or expired token.", 401);
    }
    
    if (!jwtPayload.payload.email) {
      throw new CustomError("Email not found in token.", 401);
    }

    const { email } = jwtPayload.payload;

    const { wasSuccessful: isDbConnected } = await connectToMongodb(
      15_000,
      0,
      true
    );

    if (!isDbConnected) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    const targetUser = await getUserByEmail(email, {
      outsetaAccountEmail: 1,
    });

    console.log("the target user to delete: ", targetUser);

    if (!targetUser) {
      return response.status(404).json({
        msg: "User does not exist in the database.",
        errType: "userNotFound",
      });
    }

    if (targetUser.outsetaAccountEmail) {
      console.log(
        "User has an Outseta account email, proceeding with membership check."
      );

      const userAccountDeletionResult = await deleteUserByEmail(email);

      console.log("userAccountDeletionResult: ", userAccountDeletionResult);

      if(!userAccountDeletionResult.wasSuccessful){
        console.error("Failed to delete the target user.");

        return response.status(404).json({
          msg: "User does not exist in the database.",
          errType: "userDeletionErr",
        });
      }

      const gpPlusMembership = await getGpPlusMembership(
        targetUser.outsetaAccountEmail
      );      
      let didDeleteAccount = false;
      let didDeletePerson = false;

      console.log("gpPlusMembership, sup there: ", gpPlusMembership);

      if (gpPlusMembership.Uid) {
        didDeleteAccount = (await deleteAccount(gpPlusMembership.Uid)).wasSuccessful;        
      }

      if (gpPlusMembership.person?.Uid) {
        didDeletePerson = (await deletePerson(gpPlusMembership.person.Uid)).wasSuccessful;
      }

      console.log(
        `didDeletePerson: ${didDeletePerson}`
      );
      console.log(`didDeleteAccount: ${didDeleteAccount}`);        

      if (!didDeleteAccount || !didDeletePerson) {
        await sendEmail({
          from: "shared@galacticpolymath.com",
          to: "shared@galacticpolymath.com",
          subject: `🚨 Outseta Information Deletion Failed - ${request.query.email}`,
          text: `The user's Outseta information failed to be deleted for ${request.query.email}.`,
          html: `
            <p>The user's Outseta information failed to be deleted for <strong>${
              request.query.email
            }</strong>.</p>
            <p>Deletion results: </p>
            <ul>
                <li>${gpPlusMembership.person?.Email}: ${
            didDeleteAccount ? "success" : "failed"
          }</li>
                <li>${gpPlusMembership.email}: ${
            didDeletePerson ? "success" : "failed"
          }</li>
            </ul>
          `,
        });
      }

      // TODO: get all of their emails that the user used to sign into google drive and remove them from the google group

      console.log("Successfully deleted the target user's Outseta information.");

      return response
        .status(200)
        .json({ msg: "Successfully deleted the user's account from the db." });
    }

    const { wasSuccessful: wasUserDeletedFromDb } = await deleteUserByEmail(email);

    cache.del(email);

    if (!wasUserDeletedFromDb) {
      throw new CustomError("Failed to delete the target user.", 500);
    }

    return response.status(200).json({ msg: "success" });
  } catch (error: any) {
    console.error("An error has occurred while deleting the user: ", error);
    
    const { code, message } = error ?? {};

    return response
      .status(code ?? 500)
      .json({ msg: message ?? "An error has occurred." });
  }
}
