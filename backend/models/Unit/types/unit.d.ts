import { IAcknowledgments } from "../Acknowledgments";
import { IUnitPreview } from "../Preview";
import { TGeneralSection } from "../Section";
import { IStandard } from "../Standards";
import { ITeachingMaterials } from "../TeachingMaterials";
import { IVersionNotes } from "../VersionNotes";
import { IOverview } from "./overview";

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