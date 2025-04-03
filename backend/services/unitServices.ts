/* eslint-disable no-console */
import { INewUnitSchema } from "../models/Unit/types/unit";
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

const deleteUnit = async (unitId: string) => {
  try {
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    await Unit.deleteOne({ _id: unitId });

    console.log(
      `Lesson with id ${unitId} was successfully deleted from the database!`
    );

    return {
      status: 200,
      msg: `Lesson ${unitId} was successfully deleted from the database!`,
    };
  } catch (error) {
    return {
      status: 500,
      msg: `Failed to delete lesson from the database. Error message: "${error}"`,
    };
  }
};

const createFilterObj = (filterObjKeyAndValPairs: [string, unknown[]][]) => {
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
                ? error.message
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

const retrieveLessons = async (
  filterObj = {},
  projectionObj = {},
  limit = 0,
  sort = {}
) => {
  try {
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    const units = await Unit.find(filterObj, projectionObj)
      .sort(sort)
      .limit(limit)
      .lean();

    return { wasSuccessful: true, data: units };
  } catch (error) {
    const errMsg = `Failed to get the lesson from the database. Error message: ${error}.`;

    console.error("errMsg in the `retrieveLessons` function: ", errMsg);

    return { wasSuccessful: false, errMsg: errMsg };
  }
};

const updateLesson = async (filterObj = {}, updatedLessonsKeysAndValsObj: any) => {
  try {
    // an example of lesson being updated:
    // section.participants[0].name = "John Doe"
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    await Unit.updateMany(filterObj, { $set: updatedLessonsKeysAndValsObj });

    return { wasSuccessful: true };
  } catch (error) {
    const errMsg = `Failed to update the target lesson. Error message: ${error}.`;

    console.error(errMsg);

    return { errMsg: errMsg };
  }
};

export {
  insertUnit,
  deleteUnit,
  retrieveLessons,
  updateLesson,
  createFilterObj,
};
