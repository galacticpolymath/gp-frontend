import mongoose from "mongoose";
import axios from 'axios';

export const connectToMongodb = async () => {
    const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME } = process.env;
    const connectionStr = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${MONGODB_DB_NAME}`

    return mongoose.connect(connectionStr, { retryWrites: true });
}

