import { Schema } from "mongoose";
export interface IRootFieldToRetrieve {
    name: string;
    as: string;
}

export const RootFieldToRetrieve = new Schema<IRootFieldToRetrieve>({
    name: String,
    as: String
}, { _id: false });