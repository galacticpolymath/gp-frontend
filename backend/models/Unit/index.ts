import { Model, Schema, model, models } from "mongoose";
import { UnitOverview } from "./Overview";
import { UnitPreview } from "./Preview";
import { TeachingMaterialsSchema } from "./TeachingMaterials";
import { GeneralSection } from "./Section";
import { Acknowledgments } from "./Acknowledgments";
import { VersionNotes } from "./VersionNotes";
import {
  IFeaturedMultimedia,
  IFeatureLocation,
  IFeatureName,
  IFeaturing,
  INewUnitSchema,
} from "./types/unit";
import { StandardsSchema } from "./Standards";
import { ITargetStandardsCode } from "./types/standards";

type TUnitSections = {
  overview: typeof UnitOverview;
  preview: typeof UnitPreview;
  teachingMaterials: typeof TeachingMaterialsSchema;
  standards: typeof StandardsSchema;
  acknowledgments: typeof Acknowledgments;
  background: typeof GeneralSection;
  feedback: typeof GeneralSection;
  credits: typeof GeneralSection;
  extensions: typeof GeneralSection;
  bonus: typeof GeneralSection;
  versions: typeof VersionNotes;
};

let Units = models.units as Model<INewUnitSchema, {}, {}, {}, any, any>;

if (!Units) {
  const FeatureNameSchema = new Schema<IFeatureName>(
    {
      first: String,
      middle: String,
      last: String,
      prefix: String,
    },
    { _id: false }
  );
  const FeaturedMultimedia = new Schema<IFeaturedMultimedia>(
    {
      code: String,
      type: String,
      order: String,
      forLsn: String,
      title: String,
      lessonRelevance: String,
      description: String,
      by: String,
      byLink: String,
      mainLink: String,
      otherLink: String,
    },
    { _id: false }
  );
  const FeatureLocationSchema = new Schema<IFeatureLocation>(
    {
      instition: String,
      department: String,
      city: String,
      state: String,
      country: String,
    },
    { _id: false }
  );
  const FeaturingSchema = new Schema<IFeaturing>(
    {
      name: FeatureNameSchema,
      location: FeatureLocationSchema,
      links: [String],
    },
    { _id: false }
  );
  const TargetStarndardsCodeSchema = new Schema<ITargetStandardsCode>(
    {
      code: String,
      subject: String,
      set: String,
      dim: String,
    },
    { _id: false }
  );
  const Sections: TUnitSections = {
    overview: UnitOverview,
    preview: UnitPreview,
    teachingMaterials: TeachingMaterialsSchema,
    standards: StandardsSchema,
    acknowledgments: Acknowledgments,
    background: GeneralSection,
    feedback: GeneralSection,
    credits: GeneralSection,
    extensions: GeneralSection,
    bonus: GeneralSection,
    versions: VersionNotes,
  };
  const Unit = new Schema<INewUnitSchema>({
    _id: { type: String, required: true },
    numID: { type: Number, required: true },
    locale: { type: String, required: true },
    Title: { type: String, required: true },
    TargetStandardsCodes: [TargetStarndardsCodeSchema],
    ShortTitle: String,
    PublicationStatus: String,
    Language: String,
    Country: String,
    DefaultLanguage: String,
    DefaultCountry: String,
    LastUpdated: { type: Date, default: Date.now },
    FirstPublicationDate: { type: Date, default: Date.now },
    FeaturedPeople: [FeaturingSchema],
    MediumTitle: String,
    lang: String,
    lng: String,
    TemplateVer: String,
    galacticPubsVer: String,
    isTestRepo: Boolean,
    DefaultLocale: String,
    URL: String,
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
    UnitCard: String,
    UnitBanner: String,
    LastUpdated_web: Date,
    FeaturedMultimedia: [FeaturedMultimedia],
    LsnCount: Number,
    QRcode: String,
    GdriveTeachItPermissions: String,
    TargetSubject: String,
    LessonEnvir: String,
    ForGrades: String,
    GradesOrYears: String,
    Sections,
    ShortURL: String,
  });

  Units = model("units", Unit);
}

export default Units;
