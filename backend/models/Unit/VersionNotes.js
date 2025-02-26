import { Schema } from "mongoose";
const mongoose = require('mongoose');
const { Schema } = mongoose;
const SubReleaseSchema = new Schema({
    version: String,
    date: String,
    summary: String,
    notes: String,
    acknowledgments: String
}, { _id: false });
const ReleaseSchema = new Schema({
    major_release: String,
    sub_releases: [SubReleaseSchema] // Array of SubReleaseSchema subdocuments
}, { _id: false });


export const VersionNotes = new Schema({
    ...unitSectionObj,
    Data: [ReleaseSchema]
}, { _id: false })
