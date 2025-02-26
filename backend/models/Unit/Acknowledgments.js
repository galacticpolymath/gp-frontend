import mongoose from 'mongoose';
import { unitSectionObj, UnitSectionPropsSchema } from './Section';

const { Schema } = mongoose;
const RecordSchema = new Schema({
    name: String,
    url: String,
    title: String,
    affiliation: String,
    location: String
}, { _id: false });
const AcknowledgementsDataSchema = new Schema({
    role: String,
    def: String,
    records: [RecordSchema]
}, { _id: false });

export const Acknowledgments = new Schema({
    ...unitSectionObj,
    Data: [AcknowledgementsDataSchema]
}, { _id: false })
