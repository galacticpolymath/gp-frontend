/* eslint-disable no-console */

import { DeleteResult } from "mongoose";
import { INewUnitSchema, IUnit } from "../models/Unit/types/unit";
import Unit from "../models/Unit/Unit";

const insertUnit = async (unit: INewUnitSchema) => {
  try {
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    const newUnit = new Unit(unit);
    const saveResult = await newUnit.save();

    saveResult.validateSync();

    const { Title, _id } = unit;

    return {
      status: 200,
      msg: `Unit '${Title}' (${_id}) was successfully saved into the database!`,
    };
  } catch (error) {
    const errMsg = `Failed to save lesson into the database. Error message: ${error}`;

    console.error(errMsg);

    return { status: 500, msg: errMsg };
  }
};

const deleteUnit = async (
  unitId: number | null,
  queryPair?: [string, unknown]
) => {
  try {
    console.log(
      `Attempting to delete unit with id ${unitId} and queryPair ${JSON.stringify(
        queryPair
      )}`
    );
    
    if (!Unit) {

      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    if (!unitId && !queryPair) {
      return {
        status: 500,
        msg: "Both `unitId` and `queryPair` are falsy. At least one of them must have a value.",
      };
    }

    let deletionResult: DeleteResult;

    if (queryPair && queryPair.length > 0) {
      const [key, val] = queryPair;
      deletionResult = await Unit.deleteOne({ [key]: val });
    } else {
      deletionResult = await Unit.deleteOne({ numID: unitId });
    }

    if (deletionResult.deletedCount === 0) {
      return {
        status: 500,
        msg: `Failed to delete unit`,
      };
    }

    console.log("deletionResult: ", deletionResult);

    return {
      status: 200,
      msg: `Unit was successfully deleted from the database!`,
    };
  } catch (error) {
    console.error("`deleteUnit` error: ", error);    

    return {
      status: 500,
      msg: `Failed to delete lesson from the database. Error message: "${error}"`,
    };
  }
};

const createDbFilter = (filterObjKeyAndValPairs: [string, unknown[]][]) => {
  try {
    const areFilterValuesValid = filterObjKeyAndValPairs.every(
      ([, filterVal]) => Array.isArray(filterVal)
    );

    if (!areFilterValuesValid) {
      throw new Error(
        "The value for the querying must be an array. Example: { numID: [1,2,3,4] }"
      );
    }

    return {
      filterObj: filterObjKeyAndValPairs.reduce((filterObj, keyAndVal) => {
        try {
          const [key, val] = keyAndVal;
          filterObj[key] = {
            $in:
              key === "numID"
                ? val
                    .map((lessonNumIdStr) =>
                      typeof lessonNumIdStr === "string"
                        ? parseInt(lessonNumIdStr)
                        : null
                    )
                    .filter(Boolean)
                : val,
          };

          return filterObj;
        } catch (error: unknown) {
          const errMsgStr = `Failed to create the filter object. Error message: ${error}.`;

          return {
            errMsg:
              error && typeof error === "object" && "message" in error
                ? (error.message as string)
                : errMsgStr,
          };
        }
      }, {} as Record<string, unknown>),
    };
  } catch (error: unknown) {
    const errMsgStr = `Failed to create the filter object. Error message: ${error}.`;

    return {
      errMsg:
        error && typeof error === "object" && "message" in error
          ? error.message
          : errMsgStr,
    };
  }
};

type TSort = {
  [key in keyof IUnit]: "asc" | "desc" | "ascending" | "descending" | 1 | -1;
};
export type TProjections = { [key in keyof IUnit]: 0 | 1 };

const retrieveUnits = async (
  filterObj: { [key in keyof IUnit]: unknown },
  projectionObj: TProjections,
  limit: number = 0,
  sort?: TSort
) => {
  try {
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    const units = await Unit.find(filterObj, projectionObj)
      .sort(sort ?? {})
      .limit(limit)
      .lean();

    return { wasSuccessful: true, data: units };
  } catch (error) {
    const errMsg = `Failed to get the lesson from the database. Error message: ${error}.`;

    console.error("errMsg in the `retrieveUnits` function: ", errMsg);

    return { wasSuccessful: false, errMsg: errMsg };
  }
};

const updateUnit = async (
  filterObj: { [key in keyof INewUnitSchema]: unknown },
  updatedProps: Partial<INewUnitSchema>
) => {
  try {
    // an example of lesson being updated:
    // section.participants[0].name = "John Doe"
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    const { modifiedCount } = await Unit.updateMany(filterObj, {
      $set: updatedProps,
    }).lean();

    return { wasSuccessful: modifiedCount === 1 };
  } catch (error) {
    const errMsg = `Failed to update the target lesson. Error message: ${error}.`;

    console.error(errMsg);

    return { errMsg: errMsg };
  }
};

export { insertUnit, deleteUnit, retrieveUnits, updateUnit, createDbFilter };
