import { IRootFieldToRetrieve } from "../RootFieldsToRetrieve";

export interface ITag {
    Value: string;
}

export interface IAccessibility {
    Type: string;
    Description: string;
    Abbrev_Descr: string;
    Link: string;
}

export interface ISubRelease {
    version: string;
    date: string;
    summary: string;
    notes: string;
    acknowledgments: string;
}

export interface IVersion {
    major_release: string;
    sub_releases: ISubRelease[];
}

export interface IOverview {
    LearningSummary: string;
    EstLessonTime: string;
    Text: string;
    SteamEpaulette: string;
    SteamEpaulette_vert: string;
    Accessibility: IAccessibility[];
    Tags: ITag[];
    versions: IVersion[];
    rootFieldsToRetrieveForUI: IRootFieldToRetrieve[];
}
