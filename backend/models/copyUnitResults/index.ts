import { models, Model, Schema, model } from 'mongoose'
import { ICopyUnitResult } from './types';

let CopyUnitResults = models.copyUnitResults as Model<ICopyUnitResult, {}, {}, {}, any, any>;

if(!CopyUnitResults){
    const CopyUnitResult = new Schema<ICopyUnitResult>({
        datetime: { type: Date, required: true },
        userId: { type: String, required: true },
        unitId: { type: String, required: true },
        result: { type: String, required: true },
        gdriveFolderId: { type: String, required: true },
        errMsg: String,
    });

    CopyUnitResults = model("CopyUnitResults", CopyUnitResult)
}

export default CopyUnitResults;