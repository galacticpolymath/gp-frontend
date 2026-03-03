import { Schema } from 'mongoose';

export interface IUnitSectionObj {
    __component?: string | null;
    SectionTitle: string | null;
    InitiallyExpanded: boolean | null
}

export interface IAuthor {
    first: string
    middle?: string
    last: string
    contribution: string
    Title: string
    Affiliation: string
    Location: string
    Link: string
    GPID?: string
    Email: string
}

export interface IAuthorData {
    Data: IAuthor[] | null
}

export type TGeneralSection = IUnitSectionObj & IAuthorData;

export const unitSectionObj = {
    __component: String,
    SectionTitle: String,
    InitiallyExpanded: { type: Boolean, default: true },
};
export const AuthorsSection = new Schema<IUnitSectionObj & IAuthorData>(
    {
        ...unitSectionObj,
        Data: String,
    },
    { _id: false }
);
