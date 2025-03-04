import { Schema } from 'mongoose';
import { IUnitSectionObj, unitSectionObj } from './Section';

interface ISubRelease {
    version: string;
    date: string;
    summary: string;
    notes: string;
    acknowledgments: string;
}

const SubReleaseSchema = new Schema<ISubRelease>({
    version: String,
    date: String,
    summary: String,
    notes: String,
    acknowledgments: String
}, { _id: false });

interface IRelease {
    major_release: string;
    sub_releases: ISubRelease[];
}

const ReleaseSchema = new Schema<IRelease>({
    major_release: String,
    sub_releases: [SubReleaseSchema]
}, { _id: false });

export interface IVersionNotes extends IUnitSectionObj {
    Data: IRelease[];
}

export const VersionNotes = new Schema<IVersionNotes>({
    ...unitSectionObj,
    Data: [ReleaseSchema]
}, { _id: false });

