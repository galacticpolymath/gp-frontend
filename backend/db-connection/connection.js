import mongoose from "mongoose";

export async function connectToMongodb() {
    try {
        const connectionStr = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/?retryWrites=true&w=majority`
        const result = await mongoose.connect(connectionStr);

        return result;
    } catch (error) {
        console.error('An error has occurred: ', error)
    }
}