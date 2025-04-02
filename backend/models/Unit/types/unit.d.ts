import { IAcknowledgments } from "../Acknowledgments";
import { IUnitPreview } from "../Preview";
import { TGeneralSection } from "../Section";
import { IStandard } from "../Standards";
import { ITeachingMaterials } from "../TeachingMaterials";
import { IVersionNotes } from "../VersionNotes";
import { IOverview, IUnitOverview } from "./overview";
import { IPreview } from "./preview";
import { IStandardsSec } from "./standards";
import { IUnitTeachingMaterials } from "./teachingMaterials";

export interface ILsnStatus {
    lsn: number;
    status: string;
    updated_date: string;
    new_date: string;
    sort_by_date: string;
    unit_release_date: string;
}

export interface IFeatureName {
    first: string;
    middle: string;
    last: string;
    prefix: string;
}

export interface IFeatureLocation {
    instition: string;
    department: string;
    city: string;
    state: string;
    country: string;
};

export interface IFeaturing {
    name: IFeatureName;
    location: IFeatureLocation;
    links: string[];
};

export interface IUnitOld {
    _id: string;
    numID: number;
    ShortTitle: string | null;
    PublicationStatus: string | null;
    Language: string | null;
    Country: string | null;
    DefaultLanguage: string | null;
    DefaultCountry: string | null;
    LastUpdated: Date | null;
    FirstPublicationDate: Date | null;
    featuring: IFeaturing[] | null;
    MediumTitle: string | null;
    lang: string | null;
    lng: string | null;
    locale: string;
    TemplateVer: string | null;
    TargetStandardsCodes: object[] | null;
    galacticPubsVer: string | null;
    isTestRepo: boolean | null;
    DefaultLocale: string | null;
    URL: string | null;
    GPCatalogURL: string | null;
    GitHubURL: string | null;
    GdriveHome: string | null;
    GdriveDirName: string | null;
    GdriveTeachMatPath: string | null;
    GdriveTeachMatID: string | null;
    GdrivePublicID: string | null;
    GdriveDirID: string | null;
    GdriveMetaID: string | null;
    GdriveTeachItID: string | null;
    GdriveStandardsID: string | null;
    GdrivePublishedID: string | null;
    GdriveDirURL: string | null;
    RebuildAllMaterials: boolean | null;
    ReleaseDate: Date | null;
    Title: string;
    Subtitle: string | null;
    SponsorName: string[] | null;
    SponsoredBy: string | null;
    SponsorLogo: string[] | null;
    LessonBanner: string | null;
    UnitCard: string | null;
    TargetSubject: string | null;
    LessonEnvir: string | null;
    ForGrades: string | null;
    GradesOrYears: string | null;
    SponsorImage: {
        url: string[] | null;
    } | null;
    CoverImage: {
        url: string | null;
    } | null;
    Sections: {
        overview: IOverview | null;
        preview: IUnitPreview | null;
        teachingMaterials: ITeachingMaterials | null;
        feedback: TGeneralSection | null;
        background: TGeneralSection | null;
        bonusContent: TGeneralSection | null;
        standards: IStandard | null;
        credits: TGeneralSection | null;
        acknowledgements: IAcknowledgments | null;
        versionNotes: IVersionNotes | null;
    } | null;
    LsnStatuses: LsnStatusSchema[] | null;
    ShortURL: string | null;
}

export interface IUnit extends Omit<IUnitOld, "LsnStatuses"> {}

interface INewUnitSchema {
    _id: string;
    numID: number;
    ShortTitle: string;
    PublicationStatus: string;
    Language: string;
    Country: string;
    DefaultLanguage: string;
    DefaultCountry: string;
    LastUpdated: string;
    LastUpdated_web: string | null;
    ReleaseDate: string;
    isTestRepo: boolean;
    FirstPublicationDate: string;
    LsnCount: number;
    FeaturedPeople: null;
    FeaturedMultimedia: {
        code: string;
        type: string;
        order: string;
        forLsn: string | null;
        title: string;
        lessonRelevance: string;
        description: string | null;
        by: string | null;
        byLink: string | null;
        mainLink: string;
        otherLink: string | null;
    }[];
    MediumTitle: string;
    lang: string;
    lng: string;
    locale: string;
    DefaultLocale: string;
    TemplateVer: string;
    galacticPubsVer: string;
    URL: string;
    ShortURL: string;
    GdriveHome: string;
    GdriveDirName: string;
    GdriveTeachMatPath: string;
    GdriveTeachMatID: string | null;
    GdrivePublicID: string;
    GdriveDirID: string;
    GdriveMetaID: string;
    GdriveTeachItID: string;
    GdriveStandardsID: string;
    GdrivePublishedID: string;
    GdriveTeachItPermissions: string;
    GdriveDirURL: string;
    RebuildAllMaterials: boolean;
    Title: string;
    Subtitle: string;
    SponsorName: string[];
    SponsoredBy: string;
    SponsorLogo: string[];
    UnitBanner: string;
    UnitCard: string;
    QRcode: string;
    TargetSubject: string;
    TargetStandardsCodes: {
        subject: string;
        code: string;
        set: string;
        dim: string;
    }[];
    LessonEnvir: string;
    ForGrades: string;
    GradesOrYears: string;
    Section: {
        overview: IUnitOverview;
        preview: IPreview;
        teachingMaterials: IUnitTeachingMaterials;
        feedback: TGeneralSection;
        extensions: TGeneralSection;
        bonus: TGeneralSection;
        background: TGeneralSection;
        standards: IStandardsSec;
        credits: TGeneralSection;
        acknowledgments: TAcknowledgments;
    };
}