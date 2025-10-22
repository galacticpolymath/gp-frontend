import { IRootFieldToRetrieve } from "../RootFieldsToRetrieve";
import { IUnitSectionObj } from "../Section";
import { IRelease } from "../VersionNotes";

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

// deprecate this interface
export interface IOverview extends IUnitSectionObj {
  UnitSummary: string;
  EstUnitTime: string;
  Text: string;
  SteamEpaulette: string;
  SteamEpaulette_vert: string;
  Accessibility: IAccessibility[];
  Tags: string[];
  versions: IVersion[];
  rootFieldsToRetrieveForUI: IRootFieldToRetrieve[];
}

export interface IUnitVersions {
  major_release: string | null;
  sub_releases: {
    version: string | null;
    date: string | null;
    summary: string | null;
    notes: string | null;
    acknowledgments: string | null;
  }[];
}
export interface IUnitAccessibility {
  Type: string | null;
  Description: string | null;
  Abbrev_Descr: string | null;
  Link: string | null;
}

export interface IUnitOverview {
  __component: string | null;
  TheGist: string | null;
  EstUnitTime: string | null;
  GradesOrYears: string | null;
  ForGrades: string | null;
  TargetSubject: string | null;
  Text: string | null;
  SteamEpaulette: string | null;
  SteamEpaulette_vert: string | null;
  Accessibility: IUnitAccessibility[] | null;
  Tags: string[] | null;
  versions: IRelease[] | null;
  rootFieldsToRetrieveForUI?: IRootFieldToRetrieve | null;
}

export type TUnitOverviewPropsForUI = Partial<{
  unitBanner: INewUnitSchema["UnitBanner"];
  unitTitle: INewUnitSchema["Title"];
  ForGrades: INewUnitSchema["ForGrades"];
  TargetSubject: INewUnitSchema["TargetSubject"];
  GradesOrYears: INewUnitSchema["GradesOrYears"];
  numID: INewUnitSchema["numID"];
  locale: INewUnitSchema["locale"];
  Subtitle: INewUnitSchema["Subtitle"];
  availLocs: string[];
}>;

export type TOverviewForUI = Partial<IUnitOverview & TUnitOverviewPropsForUI>;
