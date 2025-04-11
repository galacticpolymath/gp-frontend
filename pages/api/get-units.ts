/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */

import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import {
  retrieveUnits,
  TProjections,
} from "../../backend/services/unitServices";
import { INewUnitSchema, IUnit } from "../../backend/models/Unit/types/unit";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    console.log("Incoming request:", {
      method: request.method,
      query: request.query,
      headers: request.headers,
      body: request.body,
    });

    const { method, query } = request;

    if (method !== "GET") {
      throw new CustomError("This route only accepts GET requests.", 404);
    }

    const { filterObj, projectionsObj } = (query ?? {}) as {
      filterObj: string;
      projectionsObj: string;
    };

    const dbProjections: unknown =
      typeof projectionsObj === "string"
        ? JSON.parse(projectionsObj)
        : projectionsObj;
    const dbFilter: Record<keyof INewUnitSchema, unknown> | null =
      typeof filterObj === "string" ? JSON.parse(filterObj) : null;

    // print dbFilter
    console.log("dbFilter: ", dbFilter);

    if (
      dbProjections &&
      ((typeof dbProjections !== "object" && dbProjections === null) ||
        Array.isArray(dbProjections) ||
        typeof dbProjections !== "object")
    ) {
      throw new CustomError(
        "`projectionsObj` must be an non-array object.",
        400
      );
    }

    if (
      dbFilter &&
      ((typeof dbFilter !== "object" && dbFilter === null) ||
        Array.isArray(dbFilter) ||
        typeof dbFilter !== "object")
    ) {
      throw new CustomError(
        "`dbFilter` must be an non-array object. Example: { numID: [1,2,3,4] }",
        400
      );
    }

    const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
      15_000,
      0,
      true
    );

    if (!wasConnectionSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    const { data, errMsg } = await retrieveUnits(
      (dbFilter ?? {}) as Record<keyof IUnit, unknown>,
      (dbProjections ?? {}) as TProjections
    );

    if (errMsg) {
      throw new CustomError(errMsg, 500);
    }

    return response.status(200).json({ units: data });
  } catch (error: unknown) {
    const {
      code: errorCode,
      message: errorMessage,
    }: { code?: number; message?: string } = error ?? {};
    const code = errorCode ?? 500;
    const message = errorMessage ?? "An error has occurred on the server.";

    console.error("Error in the `getUnits` API route:", error);

    return response
      .status(code ?? 500)
      .json({
        msg: `Error message: ${
          message ?? "An error has occurred on the server."
        }`,
      });
  }
}
