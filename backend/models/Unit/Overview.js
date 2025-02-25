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

// WHEN RETRIEVING THE UNIT FROM THE DB, get the following fields:
// -Must get the availLocals for the specific unit, when retrieving the unit from the database
// -get the SponsorLogo, get the first value from the array
function getOverviewSecPropsFromRoot() {

}

export const Overview = new Schema({
    ...unitSectionObj,
    LearningSummary: String,
    EstLessonTime: String,
    GradesOrYears: String,
    ForGrades: String,
    TargetSubject: String,
    Text: String,
    SteamEpaulette: String,
    SteamEpaulette_vert: String,
    sponsorLogoImgUrl: String,
    lessonTitle: String,
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
