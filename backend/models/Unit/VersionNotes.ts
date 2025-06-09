import { Schema } from 'mongoose';
import { IUnitSectionObj, unitSectionObj } from './Section';

const SubReleaseSchema = new Schema<ISubRelease>({
    version: String,
    date: String,
    summary: String,
    notes: String,
    acknowledgments: String
}, { _id: false });

interface ISubRelease {
    version: string | null;
    date: string | null;
    summary: string | null;
    notes: string | null;
    acknowledgments: string | null;
}

export interface IRelease {
    major_release: string;
    sub_releases: ISubRelease[];
}

export interface IVersionNotes extends IUnitSectionObj {
    Data: IRelease[];
}

const ReleaseSchema = new Schema<IRelease>({
    major_release: String,
    sub_releases: [SubReleaseSchema]
}, { _id: false });

export const VersionNotes = new Schema<IVersionNotes>({
    ...unitSectionObj,
    Data: [ReleaseSchema]
}, { _id: false });
