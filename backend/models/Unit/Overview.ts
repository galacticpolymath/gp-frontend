import mongoose from 'mongoose'
import { IOverview, IUnitAccessibility, IUnitOverview, IUnitVersions } from './types/overview';
import { ICustomProp, IRootFieldToRetrieve, RootFieldToRetrieve } from './RootFieldsToRetrieve';

const { Schema } = mongoose;

// Define the schema for a tag
export interface ITag {
    Value: string;
}

const TagSchema = new Schema<ITag>({
    Value: String
}, { _id: false });

export interface IAccessibility {
    Type: string;
    Description: string;
    Abbrev_Descr: string;
    Link: string;
}

const AccessibilitySchema = new Schema<IAccessibility>({
    Type: String,
    Description: String,
    Abbrev_Descr: String,
    Link: String
}, { _id: false });
const UnitAccessibilitySchema = new Schema<IUnitAccessibility>({
    Type: String,
    Description: String,
    Abbrev_Descr: String,
    Link: String
}, { _id: false });

export interface ISubRelease {
    version: string;
    date: string;
    summary: string;
    notes: string;
    acknowledgments: string;
}

const SubReleaseSchema = new Schema<ISubRelease>({
    version: String,
    date: String,
    summary: String,
    notes: String,
    acknowledgments: String
}, { _id: false });

// Define the schema for a version
export interface IVersion {
    major_release: string;
    sub_releases: ISubRelease[];
}

const VersionSchema = new Schema<IUnitVersions>({
    major_release: String,
    sub_releases: [SubReleaseSchema]
}, { _id: false });


export const UnitOverview = new Schema<Omit<IUnitOverview, "rootFieldsToRetrieveForUI"> & { rootFieldsToRetrieveForUI: ICustomProp<IRootFieldToRetrieve[]> }>({
    __component: String,
    TheGist: String,
    EstUnitTime: String,
    GradesOrYears: String,
    ForGrades: String,
    TargetSubject: String,
    Text: String,
    SteamEpaulette: String,
    SteamEpaulette_vert: String,
    Accessibility: [AccessibilitySchema],
    Tags: [TagSchema],
    versions: [VersionSchema],
    rootFieldsToRetrieveForUI: {
        type: [RootFieldToRetrieve],
        default: () => {
            let rootFields = [
                {
                    name: "UnitBanner",
                    as: "unitBanner"
                },
                {
                    name: "Title",
                    as: "unitTitle"
                },
                {
                    name: "ForGrades",
                    as: "ForGrades"
                },
                {
                    name: "TargetSubject",
                    as: "TargetSubject"
                },
                {
                    name: "GradesOrYears",
                    as: "GradesOrYears"
                },
                {
                    name: "numID",
                    as: "numID"
                },
                {
                    name: "locale",
                    as: "locale"
                },
                {
                    name: "Subtitle",
                    as: "Subtitle"
                },
                {
                    name: "SponsorLogo",
                    as: "sponsorLogoImgUrl"
                },
                {
                    name: "SponsoredBy",
                    as: "SponsoredBy"
                },
                {
                    name: "TargetStandardsCodes",
                    as: "TargetStandardsCodes"
                },
            ]

            return rootFields;
        }
    },
}, { _id: false })
