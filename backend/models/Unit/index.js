import { Schema, model } from "mongoose";
import { Overview } from "./Overview";
import { UnitPreview } from "./Preview";
import { TeachingMaterialsSchema } from "./TeachingMaterials";
import { GeneralSection } from "./Section";
import { Acknowledgments } from "./Acknowledgments";
import { VersionNotes } from "./VersionNotes";

let Units = model?.units;

if (!Units) {
    const LsnStatusSchema = new Schema({
        lsn: { type: Number, required: true },
        status: String,
        updated_date: String,
        new_date: String,
        sort_by_date: String,
        unit_release_date: String,
    });
    const FeatureNameSchema = new Schema({
        first: String,
        middle: String,
        last: String,
        prefix: String,
    });
    const FeatureLocationSchema = new Schema({
        instition: String,
        department: String,
        city: String,
        state: String,
        country: String,
    });
    const FeaturingSchema = new Schema({
        name: FeatureNameSchema,
        location: FeatureLocationSchema,
        links: [String],
    });
    const UnitSchema = new Schema({
        _id: { type: String, required: true },
        numID: { type: Number, required: true },
        ShortTitle: String,
        PublicationStatus: String,
        Language: String,
        Country: String,
        DefaultLanguage: String,
        DefaultCountry: String,
        LastUpdated: { type: Date, default: Date.now },
        FirstPublicationDate: { type: Date, default: Date.now },
        featuring: [FeaturingSchema],
        MediumTitle: String,
        lang: String,
        lng: String,
        locale: { type: String, required: true },
        TemplateVer: String,
        TargetStandardsCodes: {
            type: [Object],
            required: true,
        },
        galacticPubsVer: String,
        isTestRepo: Boolean,
        DefaultLocale: String,
        URL: String,
        GPCatalogURL: String,
        GitHubURL: String,
        GdriveHome: String,
        GdriveDirName: String,
        GdriveTeachMatPath: String,
        GdriveTeachMatID: String,
        GdrivePublicID: String,
        GdriveDirID: String,
        GdriveMetaID: String,
        GdriveTeachItID: String,
        GdriveStandardsID: String,
        GdrivePublishedID: String,
        GdriveDirURL: String,
        RebuildAllMaterials: Boolean,
        ReleaseDate: Date,
        Title: { type: String, required: true },
        Subtitle: String,
        SponsorName: [String],
        SponsoredBy: String,
        SponsorLogo: [String],
        LessonBanner: String,
        UnitCard: String,
        TargetSubject: String,
        LessonEnvir: String,
        ForGrades: String,
        GradesOrYears: String,
        SponsorImage: {
            url: [String],
        },
        CoverImage: {
            url: String,
        },
        Section: {
            overview: Overview,
            preview: UnitPreview,
            teachingMaterials: TeachingMaterialsSchema,
            feedback: GeneralSection,
            background: GeneralSection,
            standards: StandardsSchema,
            credits: GeneralSection,
            acknowledgements: Acknowledgments,
            versionNotes: VersionNotes
        },
        LsnStatuses: [LsnStatusSchema],
        ShortURL: String,
    })

    Units = model('units', UnitSchema);
}

export default Units;