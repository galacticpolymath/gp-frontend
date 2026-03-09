import { Schema } from 'mongoose';

export interface IUnitSectionObj {
    __component?: string | null;
    SectionTitle: string | null;
    InitiallyExpanded: boolean | null
}

export interface IAuthor {
    First: string
    Middle?: string | null
    Last: string
    Contribution?: string | null
    Title?: string | null
    Affiliation?: string | null
    Location?: string | null
    Link?: string | null
    GPID?: string | null
    Email?: string | null
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

const AuthorSchema = new Schema<IAuthor>(
    {
        First: { type: String, required: true, trim: true },
        Middle: { type: String, default: null, trim: true },
        Last: { type: String, required: true, trim: true },
        Contribution: { type: String, default: null, trim: true },
        Title: { type: String, default: null, trim: true },
        Affiliation: { type: String, default: null, trim: true },
        Location: { type: String, default: null, trim: true },
        Link: { type: String, default: null, trim: true },
        GPID: { type: String, default: null, trim: true },
        Email: { type: String, default: null, trim: true },
    },
    { _id: false }
);

export const AuthorsSection = new Schema<IUnitSectionObj & IAuthorData>(
    {
        ...unitSectionObj,
        Data: { type: [AuthorSchema], default: null },
    },
    { _id: false }
);
