/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
import { cache } from "../../backend/authOpts/authOptions";
import {
  addUserToEmailList,
  deleteUserFromMailingList,
} from "../../backend/services/emailServices";
import { updateUser } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import { getJwtPayloadPromise } from "../../nondependencyFns";

export default async function handler(request, response) {
  try {
    if (typeof request.headers?.authorization !== 'string') {
      throw new Error("'authorization' header is not present in the request.");
    }

    const { payload } = await getJwtPayloadPromise(request.headers.authorization) ?? {};

    if (!payload) {
      throw new Error(
        "The 'authorization' header is not present in the request."
      );
    }

    if (!request.body || (request.body && typeof request.body !== "object")) {
      throw new CustomError(
        "Received either a incorrect data type for the body of the request or its value is falsey.",
        400
      );
    }

    if (Object.keys(request.body).length <= 0) {
      throw new CustomError(
        "The request body is empty. Must include the 'user' field.",
        404
      );
    }

    if (
      !request.body.willUpdateMailingListStatusOnly &&
      (!("updatedUser" in request.body) ||
        typeof request.body.updatedUser !== "object" ||
        !Object.values(request.body.updatedUser).length)
    ) {
      throw new CustomError(
        "The user field is empty or contains the incorrect data type (must be a non-array object).",
        404
      );
    }

    const {
      updatedUser,
      clientUrl,
      willUpdateMailingListStatusOnly,
      willSendEmailListingSubConfirmationEmail,
    } = request.body;
    const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
      15_000,
      0,
      true,
      true
    );

    if (!wasConnectionSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    if (
      willSendEmailListingSubConfirmationEmail === true &&
      typeof clientUrl === "string"
    ) {
      console.log("Will add the user to mailing list...");

      const { wasSuccessful } = await addUserToEmailList(payload.email, clientUrl);

      console.log("Was user added to mailing list: ", wasSuccessful);
    } else if (willSendEmailListingSubConfirmationEmail === false) {
      console.log("will delete the user  from the mailing list...");
      const { wasSuccessful } = await deleteUserFromMailingList(payload.email);

      console.log("Was user successfully deleted? ", wasSuccessful);
    }

    if (willUpdateMailingListStatusOnly) {
      return response.status(200).json({ msg: "User updated successfully." });
    }

    console.log("payload.email: ", payload.email);
    const { updatedUser: updatedUserFromDb, wasSuccessful } = await updateUser(
      { email: payload.email },
      updatedUser,
      ["password"]
    );

    if (!wasSuccessful || !updatedUserFromDb) {
      throw new CustomError("Failed to update user.", 500);
    }

    console.log("updated user, sup there: ", updatedUserFromDb);

    cache.set(payload.email, updatedUserFromDb);

    return response.status(200).json({ msg: "User updated successfully." });
  } catch (error) {
    console.error(
      "An error has occurred, failed to update user. Reason: ",
      error
    );
    const { code, message } = error ?? {};

    return response
      .status(code ?? 500)
      .json({ msg: message ?? "Failed to update user." });
  }
}
