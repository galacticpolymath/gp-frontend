import mongoose from 'mongoose';
import { IUnitSectionObj, unitSectionObj } from './Section';
import { IAcknowledgementsData, IRecord } from './types/acknowledgments';

const RecordSchema = new mongoose.Schema<IRecord>({
    name: String,
    url: String,
    title: String,
    affiliation: String,
    location: String
}, { _id: false });
const AcknowledgementsDataSchema = new mongoose.Schema<IAcknowledgementsData>({
    role: String,
    def: String,
    records: [RecordSchema]
}, { _id: false });

export interface IAcknowledgments extends IUnitSectionObj{
    Data: IAcknowledgementsData[];
};

export const Acknowledgments = new mongoose.Schema<IAcknowledgments>({
    ...unitSectionObj,
    Data: [AcknowledgementsDataSchema]
}, { _id: false });

