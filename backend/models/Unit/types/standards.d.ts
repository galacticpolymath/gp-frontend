import { IUnitSectionObj } from "../Section";

interface IDimensions {
  slug: string;
  name: string;
  standardsGroup: {
    lessons: string[];
    codes: string;
    grades: string | string[];
    statements: string;
    alignmentNotes: string;
    subcat: string | null;
  }[];
}

interface ISet {
  slug: string;
  name: string;
  dimensions: IDimensions[];
}
interface IStandardsSec extends IUnitSectionObj {
  Data: {
    subject: string;
    target: boolean;
    sets: ISet[];
  }[];
}
