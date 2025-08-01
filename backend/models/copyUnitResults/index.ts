import { models, Model, Schema, model } from 'mongoose'
import { ICopyUnitResult } from './types';

console.log("models.copyunitresults, sup there: ", models.copyunitresults)

let CopyUnitResults = models.copyunitresults as Model<ICopyUnitResult, {}, {}, {}, any, any>;

if(!models.copyunitresults){
    const CopyUnitResult = new Schema<ICopyUnitResult>({
        datetime: { type: Date, required: true },
        userId: { type: String, required: true },
        unitId: { type: String, required: true },
        result: { type: String, required: true },
        gdriveFolderId: { type: String, required: false, unique: true },
        doesFolderCopyExistInUserGDrive: { type: Boolean, required: true },
        errMsg: String,
    });

    CopyUnitResults = model("copyunitresults", CopyUnitResult)
}

export default CopyUnitResults;