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