import { IRootFieldToRetrieve } from "../RootFieldsToRetrieve";
import { IUnitSectionObj } from "../Section";
import { INewUnitSchema } from "./unit";

export interface IStandard {
    lessons: string[];
    codes: string;
    grades: string[];
    statements: string;
    alignmentNotes: string;
    subcat: string;
}

// Define the interface for a standards group
export interface IStandardsGroup {
    slug: string;
    name: string;
    standardsGroup: IStandard[];
}

// Define the interface for a dimension
export interface IDimension {
    slug: string;
    name: string;
    standardsGroup: IStandardsGroup[];
}

// Define the interface for a set
export interface ISet {
    slug: string;
    name: string;
    dimensions: IDimension[];
}

// Define the interface for a subject
export interface ISubject {
    subject: string;
    target: boolean;
    sets: ISet[];
}

export interface IItem {
  itemTitle: string | null;
  itemDescription: string | null;
  itemCat: string | null;
  links: ILink[] | null;
}

export interface ITargetStandardsCode{
    subject: string,
    code: string,
    set: string,
    dim: string,
}

// Define the interface for the standards schema
export interface IStandards extends IUnitSectionObj {
    Data: ISubject[],
    rootFieldsToRetrieveForUI?: IRootFieldToRetrieve[];
}



export type TStandardsForUI = IStandards & Partial<Pick<INewUnitSchema, "GradesOrYears">> 

export { IStandardsSec, TStandardsForUI }
