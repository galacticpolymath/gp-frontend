const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for a tag
const TagSchema = new Schema({
    Value: String
}, { _id: false });

// Define the schema for accessibility
const AccessibilitySchema = new Schema({
    Type: String,
    Description: String,
    Abbrev_Descr: String,
    Link: String
}, { _id: false });

// Define the schema for a sub-release
const SubReleaseSchema = new Schema({
    version: String,
    date: String,
    summary: String,
    notes: String,
    acknowledgments: String
}, { _id: false });

// Define the schema for a version
const VersionSchema = new Schema({
    major_release: String,
    sub_releases: [SubReleaseSchema]
}, { _id: false });

// WHEN RETRIEVING THE UNIT FROM THE DB for the ui, get the following fields from the root of the document:
// -Must get the availLocals for the specific unit, when retrieving the unit from the database
// -get the SponsorLogo, get the first value from the array, the first value, store as sponsorLogoImgUrl
function getOverviewSecPropsFromRoot() {

}

export const Overview = new Schema({
    ...unitSectionObj,
    LearningSummary: String,
    EstLessonTime: String,
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
                    name: "LessonBanner",
                    as: "lessonBannerUrl"
                },
                {
                    name: "Title",
                    as: "lessonTitle"
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

            return rootFields.map(({ name, as }) => new RootFieldToRetrieve({
                name, as
            }))
        }
    },
}, { _id: false });
