/* eslint-disable quotes */

import { NextApiRequest, NextApiResponse } from "next";
import { insertLesson } from "../../backend/services/lessonsServices";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import { INewUnitSchema } from "../../backend/models/Unit/types/unit";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (
      !request?.body?.unit ||
      (request?.body?.unit &&
        typeof request?.body?.unit === "object" &&
        !Object.keys(request?.body?.unit)?.length) ||
      typeof request?.body?.unit !== "object"
    ) {
      console.error(
        "Invalid request: The `request.body.unit` is either empty or not of the correct data type."
      );

      return response
        .status(400)
        .json({
          msg: "The `request.body.unit` is empty or the wrong data type.",
        });
    }

    const newUnit: INewUnitSchema = request?.body?.unit;
    const { wasSuccessful } = await connectToMongodb(15_000, 0, true);

    if (!wasSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    const { status, msg } = await insertLesson(newUnit);

    if (status !== 200) {
      throw new CustomError(msg, status);
    }

    return response.status(status).json({ msg: msg });
  } catch (error: unknown) {
    const { code, message } = error as { code: number; message: string };

    return response
      .status(code ?? 500)
      .json({ msg: message ?? "Failed to insert lesson into the db." });
  }
}
