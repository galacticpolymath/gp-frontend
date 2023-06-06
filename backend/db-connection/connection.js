import mongoose from "mongoose";

export function connectToMongodb() {
    mongoose.connect('mongodb://127.0.0.1:27017/test')
}