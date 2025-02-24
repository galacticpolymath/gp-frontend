import mongoose from 'mongoose';

const { Schema } = mongoose;

const MultimediaSchema = new Schema({
    order: String,
    type: String,
    forLsn: String,
    title: String,
    description: String,
    lessonRelevance: String,
    by: String,
    byLink: String,
    mainLink: String,
    otherLink: String,
    webAppPreviewImg: String,
    webAppImgAlt: String
}, { _id: false });

// Define the schema for the lesson plan unit preview
export const UnitPreview = new Schema({
    __component: String,
    SectionTitle: String,
    QuickPrep: String,
    Multimedia: [MultimediaSchema],
    InitiallyExpanded: Boolean,
    sortOrder: Number
});