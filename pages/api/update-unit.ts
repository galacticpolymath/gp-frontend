/* eslint-disable quotes */

import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import {
  createDbFilter,
  updateUnit,
} from "../../backend/services/unitServices";
import { INewUnitSchema } from "../../backend/models/Unit/types/unit";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const { method, query } = request;

    if (method !== "POST") {
      throw new CustomError("This route only accepts GET requests.", 404);
    }

    const { filterObj, keysAndUpdatedValsObj } = (query ?? {}) as {
      filterObj: string;
      keysAndUpdatedValsObj: string;
    };

    const valsToUpdate: Partial<INewUnitSchema> =
      typeof keysAndUpdatedValsObj === "string"
        ? JSON.parse(keysAndUpdatedValsObj)
        : keysAndUpdatedValsObj;
    const dbFilter: unknown =
      typeof filterObj === "string" ? JSON.parse(filterObj) : filterObj;

    if (
      valsToUpdate &&
      ((typeof valsToUpdate !== "object" && valsToUpdate === null) ||
        Array.isArray(valsToUpdate) ||
        typeof valsToUpdate !== "object")
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
    const dbFilterEntries = Object.entries(
      dbFilter as Record<string, unknown[]>
    );
    const dbFilterCreationResult =
      dbFilter && Object.keys(dbFilter).length
        ? createDbFilter(dbFilterEntries)
        : null;

    if (dbFilterCreationResult?.errMsg) {
      throw new CustomError(dbFilterCreationResult.errMsg, 400);
    }

    const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
      15_000,
      0,
      true
    );

    if (!wasConnectionSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    const { wasSuccessful, errMsg } = await updateUnit(
      dbFilterCreationResult?.filterObj as Record<
        keyof INewUnitSchema,
        unknown
      >,
      valsToUpdate
    );

    if (!wasSuccessful || errMsg) {
      throw new CustomError(errMsg, 500);
    }

    return response
      .status(200)
      .json({ msg: "Successfully updated the target unit" });
  } catch (error: unknown) {
    const {
      code: errorCode,
      message: errorMessage,
    }: { code?: number; message?: string } = error ?? {};
    const code = errorCode ?? 500;
    const message = errorMessage ?? "An error has occurred on the server.";

    return response
      .status(code ?? 500)
      .json({
        msg: `Error message: ${
          message ?? "An error has occurred on the server."
        }`,
      });
  }
}
