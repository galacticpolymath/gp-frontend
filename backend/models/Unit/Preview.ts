import mongoose from 'mongoose';
import { IUnitSectionObj, unitSectionObj } from './Section';

const { Schema } = mongoose;

function getMultiMediaWebAppPreviewImgs() {
    // There fields will be as follows:
    // webAppPreviewImg: String,
    // webAppImgAlt: String
}

export interface IMultimedia {
    order: string;
    type: string;
    forLsn: string;
    title: string;
    description: string;
    lessonRelevance: string;
    by: string;
    byLink: string;
    mainLink: string;
    otherLink: string;
}

const MultimediaSchema = new Schema<IMultimedia>({
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
}, { _id: false });

export interface IUnitPreview extends IUnitSectionObj {
    QuickPrep: string;
    InitiallyExpanded: boolean;
}

export const UnitPreview = new Schema<IUnitPreview>({
    ...unitSectionObj,
    QuickPrep: String,
    InitiallyExpanded: Boolean,
}, { _id: false });
