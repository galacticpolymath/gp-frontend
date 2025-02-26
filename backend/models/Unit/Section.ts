import { Schema } from "mongoose";

export interface IUnitSectionObj {
  __component: string | null;
  SectionTitle: string | null;
  sortOrder: number | null;
  InitiallyExpanded: boolean | null
}
export interface IContentObj{
    Content: string | null
} 


export const unitSectionObj = {
  __component: String,
  SectionTitle: String,
  sortOrder: Number,
  InitiallyExpanded: { type: Boolean, default: true },
};
export const GeneralSection = new Schema<IUnitSectionObj & IContentObj>(
  {
    ...unitSectionObj,
    Content: String,
  },
  { _id: false }
);
