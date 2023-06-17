import Mongoose from 'mongoose';
const { Schema, models, model } = Mongoose;

let Lessons = models.lessons;

if (!Lessons) {
    const LessonSchema = new Schema({
        id: { type: Number, required: true },
        UniqueID: String,
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
        GdrivePublicID: Number,
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
        LessonEnvir: String,
        ForGrades: String,
        GradesOrYears: String,
        SponsorImage: {
            url: [String]
        },
        CoverImage: {
            url: String
        },
        Section: Schema.Types.Mixed,
    });
    
    Lessons = model('lessons', LessonSchema);
}

export default Lessons; 