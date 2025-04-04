/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable no-console */

import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import { deleteUnit } from "../../backend/services/unitServices";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const { _id, key, val } = request.query;
    let queryPair: [string, unknown] | undefined;

    if (typeof key === "string" && typeof val === "string") {
      queryPair = [key, val];
    }

    const numID = typeof _id === "string" ? parseInt(_id as string) : null;

    if (
      typeof _id === "string" &&
      ((typeof numID === "number" && isNaN(numID)) || numID == null)
    ) {
      throw new CustomError(
        `Must provide a valid value for numID of the unit to delete. Required type: number. Retrieved value: ${_id}`,
        400
      );
    }

    const { wasSuccessful } = await connectToMongodb(15_000, 0, true);

    if (!wasSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    console.log("numID, yo there: ", numID);

    const { status, msg } = await deleteUnit(numID, queryPair);

    return response.status(status).json({ msg });
  } catch (error) {
    const { code, message } = error as { code?: number; message?: string };

    return response.status(code ?? 500).json({
      msg:
        message ??
        `Failed to save lesson into the database. Error message: ${error}`,
    });
  }
}
