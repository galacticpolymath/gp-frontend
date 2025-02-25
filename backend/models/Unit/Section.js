import { Schema } from "mongoose"

export const unitSectionObj = {
    __component: String,
    SectionTitle: String,
    sortOrder: Number,
    InitiallyExpanded: { type: Boolean, default: true }
}
export const GeneralSection = new Schema({
    ...unitSectionObj,
    Content: String
}, { _id: false });

