import { RootFieldToRetrieve } from '../RootFieldsToRetrieve';

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
});

// Define the schema for a standards group
const standardsGroupSchema = new Schema({
    slug: String,
    name: String,
    standardsGroup: [standardSchema]
});

// Define the schema for a dimension
const dimensionSchema = new Schema({
    slug: String,
    name: String,
    standardsGroup: [standardsGroupSchema]
});

// Define the schema for a set
const setSchema = new Schema({
    slug: String,
    name: String,
    dimensions: [dimensionSchema]
});

// Define the schema for a subject
const subjectSchema = new Schema({
    subject: String,
    target: Boolean,
    sets: [setSchema]
});

export const lessonPlanStandardsSchema = new Schema({
    SectionTitle: String,
    __component: String,
    InitiallyExpanded: Boolean,
    sortOrder: Number,
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
});

