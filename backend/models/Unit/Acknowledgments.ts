import mongoose from 'mongoose';
import { IUnitSectionObj, unitSectionObj } from './Section';

interface IRecord {
    name: string;
    url: string;
    title: string;
    affiliation: string;
    location: string;
}
interface IAcknowledgementsData {
    role: string;
    def: string;
    records: IRecord[];
}

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

