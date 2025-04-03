import { IRootFieldToRetrieve } from "../RootFieldsToRetrieve";
import { IUnitSectionObj } from "../Section";

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

export interface IOverview extends IUnitSectionObj {
  UnitSummary: string;
  EstUnitTime: string;
  Text: string;
  SteamEpaulette: string;
  SteamEpaulette_vert: string;
  Accessibility: IAccessibility[];
  Tags: ITag[];
  versions: IVersion[];
  rootFieldsToRetrieveForUI: IRootFieldToRetrieve[];
}

interface IVerions {
  major_release: string | null;
  sub_releases: {
    version: string | null;
    date: string | null;
    summary: string | null;
    notes: string | null;
    acknowledgments: string | null;
  };
}
interface IAccessibility {
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
  Accessibility:
    IAccessibility[]
    | null;
  Tags:
    | {
        Value: string | null;
      }[]
    | null;
  versions: IVerions[] | null;
}
