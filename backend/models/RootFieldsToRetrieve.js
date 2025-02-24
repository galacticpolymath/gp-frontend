import { Schema } from "mongoose";

export const RootFieldToRetrieve = new Schema({
    name: String,
    as: String
}, { _id: false });