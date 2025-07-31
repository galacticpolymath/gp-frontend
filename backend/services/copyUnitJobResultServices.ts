import CopyUnitResults from "../models/copyUnitResults"
import { ICopyUnitResult } from "../models/copyUnitResults/types"

export const insertCopyUnitJobResult = async (copyUnitResult: Omit<ICopyUnitResult, "_id">) => {
    try {
        const insertionResult = await CopyUnitResults.insertOne(copyUnitResult, { validateBeforeSave: true  })

        console.log("insertionResult: ", insertionResult);

        return { wasSuccessful: true, insertionResult };
    } catch(error){
        console.error("Failed to insert copy unit job result. Error: ", error);

        return { wasSuccessful: false, errorObj: error };
    }
}
const SORT: Record<keyof Pick<ICopyUnitResult, "datetime">, 1 | -1> = { datetime: -1 };

export const getLatestValidJob = async (unitId: string, invalidJobIds: string[]) => {
    try {
        const query: Partial<Record<keyof ICopyUnitResult, unknown>> = {
            unitId: {
                $eq: unitId,
            },
            _id: {
                $nin: invalidJobIds
            },
            result: "success",
            doesCopyExistInUserGDrive: true,
            gdriveFolderId: {
                $ne: null
            },
            errMsg: {
                $eq: null
            }
        };
        const targetUnit = await CopyUnitResults.findOne<ICopyUnitResult>(query).sort(SORT);

        return {
            wasSuccessful: true,
            targetUnit
        }
    } catch(error){
        console.error("Failed to insert copy unit job result. Error: ", error);

        return { wasSuccessful: false, errorObj: error };
    }
}
