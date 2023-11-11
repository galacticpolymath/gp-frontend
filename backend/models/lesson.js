import Mongoose from 'mongoose';
const { Schema, models, model } = Mongoose;

let Lessons = models?.lessons;

// fields that have dates as the value: ReleaseDate, LastUpdated, FirstPublicationDate

if (!Lessons) {
  const LsnStatusesSchema = new Schema({
    lsn: { type: Number, required: true },
    status: String,
    updated_date: String,
    new_date: String,
    sort_by_date: String
  })
  const LessonSchema = new Schema({
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
    MediumTitle: String,
    lang: String,
    lng: String,
    locale: { type: String, required: true },
    TemplateVer: String,
    galacticPubsVer: String,
    isTestRepo: Boolean,
    defaultLocale: String,
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
    TargetSubject: String,
    LessonEnvir: Schema.Types.Mixed,
    ForGrades: String,
    GradesOrYears: String,
    SponsorImage: {
      url: [String],
    },
    CoverImage: {
      url: String,
    },
    Section: Schema.Types.Mixed,
    LsnStatuses: [LsnStatusesSchema]
  }, { _id: false });

  Lessons = model('lessons', LessonSchema);
}

export default Lessons; 