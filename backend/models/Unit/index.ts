import { Schema, model } from "mongoose";
import { Overview } from "./Overview";
import { UnitPreview } from "./Preview";
import { TeachingMaterialsSchema } from "./TeachingMaterials";
import { GeneralSection } from "./Section";
import { Acknowledgments } from "./Acknowledgments";
import { VersionNotes } from "./VersionNotes";
import { IFeatureLocation, IFeatureName, IFeaturing, ILsnStatus, IUnit } from "./types/unit";
import { StandardsSchema } from "./Standards";

let Units = (model as any)?.units;

if (!Units) {
    const FeatureNameSchema = new Schema<IFeatureName>({
        first: String,
        middle: String,
        last: String,
        prefix: String,
    });
    const FeatureLocationSchema = new Schema<IFeatureLocation>({
        instition: String,
        department: String,
        city: String,
        state: String,
        country: String,
    });
    const FeaturingSchema = new Schema<IFeaturing>({
        name: FeatureNameSchema,
        location: FeatureLocationSchema,
        links: [String],
    });
    const UnitSchema = new Schema<IUnit>({
        _id: { type: String, required: true },
        numID: { type: Number, required: true },
        locale: { type: String, required: true },
        Title: { type: String, required: true },
        TargetStandardsCodes: {
            type: [Object],
            required: true,
        },
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
        TemplateVer: String,
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
        Sections: {
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
        ShortURL: String,
    })

    Units = model('units', UnitSchema);
}

export default Units;