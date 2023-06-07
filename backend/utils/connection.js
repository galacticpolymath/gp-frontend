import mongoose from "mongoose";

export async function connectToMongodb() {
    const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME } = process.env;
    const connectionStr = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${MONGODB_DB_NAME}`
    
    return mongoose.connect(connectionStr, { retryWrites: true });
}