import { RootFieldToRetrieve } from '../RootFieldsToRetrieve';
import { unitSectionObj } from './Section';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for a single standard
const standardSchema = new Schema({
    lessons: [String],
    codes: String,
    grades: [String],
    statements: String,
    alignmentNotes: String,
    subcat: String
}, { _id: false });

// Define the schema for a standards group
const standardsGroupSchema = new Schema({
    slug: String,
    name: String,
    standardsGroup: [standardSchema]
}, { _id: false });

// Define the schema for a dimension
const dimensionSchema = new Schema({
    slug: String,
    name: String,
    standardsGroup: [standardsGroupSchema]
}, { _id: false });

// Define the schema for a set
const setSchema = new Schema({
    slug: String,
    name: String,
    dimensions: [dimensionSchema]
}, { _id: false });

// Define the schema for a subject
const subjectSchema = new Schema({
    subject: String,
    target: Boolean,
    sets: [setSchema]
}, { _id: false });

export const lessonPlanStandardsSchema = new Schema({
    ...unitSectionObj,
    Data: [subjectSchema],
    rootFieldsToRetrieve: {
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

