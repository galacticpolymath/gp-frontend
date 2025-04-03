import { IRootFieldToRetrieve, RootFieldToRetrieve } from './RootFieldsToRetrieve';
import mongoose from 'mongoose'
import { IOverview } from './types/overview';

const { Schema } = mongoose;

// WHEN RETRIEVING THE UNIT FROM THE DB for the ui, get the following fields from the root of the document:
// -Must get the availLocals for the specific unit, when retrieving the unit from the database
// -get the SponsorLogo, get the first value from the array, the first value, store as sponsorLogoImgUrl
function getOverviewSecPropsFromRoot() {

}

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

const VersionSchema = new Schema<IVersion>({
    major_release: String,
    sub_releases: [SubReleaseSchema]
}, { _id: false });


export const Overview = new Schema<IOverview>({
    __component: String,
    InitiallyExpanded: Boolean,
    SectionTitle: String,
    UnitSummary: String,
    EstUnitTime: String,
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
                    name: "unitBanner",
                    as: "lessonBannerUrl"
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
            ]

            return rootFields;
        }
    },
}, { _id: false });

