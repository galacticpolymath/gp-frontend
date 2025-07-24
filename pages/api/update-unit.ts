/* eslint-disable quotes */

import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import {
  TCustomUpdate,
  updateUnit,
} from "../../backend/services/unitServices";
import { INewUnitSchema } from "../../backend/models/Unit/types/unit";

interface IReqBody{
  unitId: string;
  keysAndUpdatedValsObj: string;
  dbType?: Parameters<typeof connectToMongodb>[3];
  customUpdate?: TCustomUpdate
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const { method, body } = request;

    if (method !== "PUT") {
      throw new CustomError("This route only accepts PUT requests.", 404);
    }

    const { unitId, keysAndUpdatedValsObj, customUpdate, dbType } = (body ?? {}) as IReqBody;

    const valsToUpdate: Partial<INewUnitSchema> =
      typeof keysAndUpdatedValsObj === "string"
        ? JSON.parse(keysAndUpdatedValsObj)
        : keysAndUpdatedValsObj;

    if (
      !customUpdate && (valsToUpdate &&
      ((typeof valsToUpdate !== "object" && valsToUpdate === null) ||
        Array.isArray(valsToUpdate) ||
        typeof valsToUpdate !== "object"))
    ) {
      throw new CustomError(
        "`projectionsObj` must be an non-array object.",
        400
      );
    }

    if((typeof customUpdate !== "undefined") && ((typeof customUpdate === "object" && (customUpdate == null)) || typeof customUpdate !== "object")){
      throw new CustomError("customUpdate must be an object", 400);
    }

    const { wasSuccessful: wasConnectionSuccessful } = await connectToMongodb(
      15_000,
      0,
      true,
      dbType
    );

    if (!wasConnectionSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    const { wasSuccessful, errMsg } = await updateUnit(
      { _id: unitId as unknown },
      valsToUpdate,
      customUpdate
    );

    if (!wasSuccessful || errMsg) {
      console.error("Failed to update the target unit. Error message: ", errMsg);
      throw new CustomError(errMsg, 500);
    }

    return response
      .status(200)
      .json({ msg: "Successfully updated the target unit" });
  } catch (error: unknown) {
    console.error("The error object: ", error);

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
          message ?? `An error has occurred on the server. The error object: ${error}`
        }`,
      });
  }
}
