/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
import { NextApiRequest, NextApiResponse } from "next";
import { CustomError } from "../../../backend/utils/errors";
import { updateUser, updateUserCustom } from "../../../backend/services/userServices";
import { connectToMongodb } from "../../../backend/utils/connection";

interface IReqBody{
    query: object,
    updates: object
    dbType: Parameters<typeof connectToMongodb>[3]
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    if (typeof request.headers?.authorization !== 'string') {
      throw new Error("'authorization' header is not present in the request.");
    }

    if (request.method !== 'POST') {
      throw new CustomError(`Only POST requests are allowed. Received ${request.method} request.`, 405);
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

    const {
      query,
      updates,
      dbType,
    } = request.body as IReqBody;

    if (!dbType) {
      throw new CustomError(
        "'dbType' field must be either 'development', 'staging', or 'production'.",
        400
      );
    }

    const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
      15_000,
      0,
      true,
      dbType
    );

    console.log("request.body: ", request.body);
    
    if (!wasConnectionSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }


    const updateUserResult = await updateUserCustom(
      query,
      updates,
    );
    const { wasSuccessful, result } = updateUserResult;

    if (!wasSuccessful || result?.modifiedCount === 0)  {
      throw new CustomError("Failed to update user.", 500);
    }

    return response.status(200).json({ msg: "User updated successfully.", result });
  } catch (error: any) {
    console.error(
      "An error has occurred, failed to update user. Reason: ",
      error
    );

    const { code, message } = error ?? {};

    return response
      .status(code ?? 500)
      .json({ msg: message ?? "Failed to update user.", wasSuccessful: false });
  }
}