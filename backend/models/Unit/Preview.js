import mongoose from 'mongoose';
import { unitSectionObj } from './Section';

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

export const UnitPreview = new Schema({
    ...unitSectionObj,
    QuickPrep: String,
    Multimedia: [MultimediaSchema],
    InitiallyExpanded: Boolean,
}, { _id: false });