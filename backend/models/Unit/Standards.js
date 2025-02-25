import { RootFieldToRetrieve } from '../RootFieldsToRetrieve';
import { unitSectionObj } from './Section';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for a single standard
const StandardSchema = new Schema({
    lessons: [String],
    codes: String,
    grades: [String],
    statements: String,
    alignmentNotes: String,
    subcat: String
}, { _id: false });

// Define the schema for a standards group
const StandardsGroupSchema = new Schema({
    slug: String,
    name: String,
    standardsGroup: [StandardSchema]
}, { _id: false });

// Define the schema for a dimension
const DimensionSchema = new Schema({
    slug: String,
    name: String,
    standardsGroup: [StandardsGroupSchema]
}, { _id: false });

// Define the schema for a set
const SetSchema = new Schema({
    slug: String,
    name: String,
    dimensions: [DimensionSchema]
}, { _id: false });

// Define the schema for a subject
const SubjectSchema = new Schema({
    subject: String,
    target: Boolean,
    sets: [SetSchema]
}, { _id: false });

export const StandardsSchema = new Schema({
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

            return rootFields.map(({ name, as }) => new RootFieldToRetrieve({
                name, as
            }))
        }
    }
}, { _id: false });

