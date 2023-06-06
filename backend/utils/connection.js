import mongoose from "mongoose";

export async function connectToMongodb() {
    const connectionStr = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/?retryWrites=true&w=majority`
    
    return mongoose.connect(connectionStr);
}