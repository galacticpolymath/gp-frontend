import { Schema } from "mongoose";

export interface IUnitSectionObj {
  __component: string | null;
  SectionTitle: string | null;
  initiallyExpanded: boolean | null
}
export interface IContentObj{
    Content: string | null
} 

export type TGeneralSection = IUnitSectionObj & IContentObj;

export const unitSectionObj = {
  __component: String,
  SectionTitle: String,
  InitiallyExpanded: { type: Boolean, default: true },
};
export const GeneralSection = new Schema<IUnitSectionObj & IContentObj>(
  {
    ...unitSectionObj,
    Content: String,
  },
  { _id: false }
);
