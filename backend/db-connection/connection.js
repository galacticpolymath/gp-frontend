import mongoose from "mongoose";

export async function connectToMongodb() {
    try {
        const result = await mongoose.connect('mongodb://127.0.0.1:27017/test');

        return result;
    } catch (error) {
        console.error('An error has occurred: ', error)
    }
}