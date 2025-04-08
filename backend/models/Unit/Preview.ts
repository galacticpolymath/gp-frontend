import mongoose from 'mongoose';
import { IUnitSectionObj, unitSectionObj } from './Section';
import { IRootFieldToRetrieve, RootFieldToRetrieve } from './RootFieldsToRetrieve';

const { Schema } = mongoose;

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
    rootFieldsToRetrieveForUI?: IRootFieldToRetrieve | null;
}


export interface IUnitPreviewForUI extends Omit<IUnitPreview, "rootFieldsToRetrieveForUI"> {
    QuickPrep: string;
    InitiallyExpanded: boolean;
}

export const UnitPreview = new Schema<IUnitPreview>({
    ...unitSectionObj,
    QuickPrep: String,
    InitiallyExpanded: Boolean,
    rootFieldsToRetrieveForUI: {
        type: [RootFieldToRetrieve],
        default: () => {
            return [
                {
                    name: 'FeaturedMultimedia',
                    as: 'Multimedia'
                }
            ]
        }
    }
}, { _id: false });
