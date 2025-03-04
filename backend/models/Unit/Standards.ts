import { IRootFieldToRetrieve, RootFieldToRetrieve } from './RootFieldsToRetrieve';
import { IUnitSectionObj, unitSectionObj } from './Section';
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the interface for a single standard
export interface IStandard {
    lessons: string[];
    codes: string;
    grades: string[];
    statements: string;
    alignmentNotes: string;
    subcat: string;
}

// Define the interface for a standards group
export interface IStandardsGroup {
    slug: string;
    name: string;
    standardsGroup: IStandard[];
}

// Define the interface for a dimension
export interface IDimension {
    slug: string;
    name: string;
    standardsGroup: IStandardsGroup[];
}

// Define the interface for a set
export interface ISet {
    slug: string;
    name: string;
    dimensions: IDimension[];
}

// Define the interface for a subject
export interface ISubject {
    subject: string;
    target: boolean;
    sets: ISet[];
}

// Define the interface for the standards schema
export interface IStandards extends IUnitSectionObj {
    Data: ISubject[],
    rootFieldsToRetrieveForUI: IRootFieldToRetrieve[];
}

// Define the schema for a single standard
const StandardSchema = new Schema<IStandard>({
    lessons: [String],
    codes: String,
    grades: [String],
    statements: String,
    alignmentNotes: String,
    subcat: String
}, { _id: false });

// Define the schema for a standards group
const StandardsGroupSchema = new Schema<IStandardsGroup>({
    slug: String,
    name: String,
    standardsGroup: [StandardSchema]
}, { _id: false });

// Define the schema for a dimension
const DimensionSchema = new Schema<IDimension>({
    slug: String,
    name: String,
    standardsGroup: [StandardsGroupSchema]
}, { _id: false });

// Define the schema for a set
const SetSchema = new Schema<ISet>({
    slug: String,
    name: String,
    dimensions: [DimensionSchema]
}, { _id: false });

// Define the schema for a subject
const SubjectSchema = new Schema<ISubject>({
    subject: String,
    target: Boolean,
    sets: [SetSchema]
}, { _id: false });

export const StandardsSchema = new Schema<IStandards>({
    ...unitSectionObj,
    Data: [SubjectSchema],
    rootFieldsToRetrieveForUI: {
        type: [RootFieldToRetrieve],
        default: () => {
            let rootFields = [
                {
                    name: "GradesOrYears",
                    as: "GradesOrYears"
                }
            ]

            return rootFields;
        }
    }
}, { _id: false });

