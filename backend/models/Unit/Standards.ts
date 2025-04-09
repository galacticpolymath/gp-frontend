import { ICustomProp, IRootFieldToRetrieve, RootFieldToRetrieve } from './RootFieldsToRetrieve';
import { IUnitSectionObj, unitSectionObj } from './Section';
import mongoose from 'mongoose';
import { IDimension, ISet, IStandard, IStandards, IStandardsGroup, ISubject } from './types/standards';

const { Schema } = mongoose;

// Define the schema for a single standard
const StandardsGroupSchema = new Schema<IStandard>({
    lessons: [String],
    codes: String,
    grades: [String],
    statements: String,
    alignmentNotes: String, 
    subcat: String
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

const SubjectSchema = new Schema<ISubject>({
    subject: String,
    target: Boolean,
    sets: [SetSchema]
}, { _id: false });

export const StandardsSchema = new Schema<Omit<IStandards, "rootFieldsToRetrieveForUI"> & { rootFieldsToRetrieveForUI: ICustomProp<IRootFieldToRetrieve[]> }>({
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

