/* eslint-disable no-console */
import mongoose from "mongoose";
import { waitWithExponentialBackOff } from "../../globalFns";
import { ConversationsAgentOnlinePingPostRequest } from "@getbrevo/brevo";

let isConnectedToDb = false;

export const createConnectionUri = (dbType) => {
  const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME, MONGODB_DB_PROD } =
    process.env;
  let dbName = MONGODB_DB_NAME;

  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    dbName = MONGODB_DB_PROD;
  }

  if (dbType === "prod") {
    dbName = MONGODB_DB_PROD;
  } else if (dbType === "dev") {
    dbName = MONGODB_DB_NAME;
  }

  const connectionUri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${dbName}`;

  return connectionUri;
};

export const connectToMongodb = async (
  serverSelectionTimeoutMS = 15_000,
  tries = 0,
  isRetryable = false,
  willForceConnection = false,
  dbType
) => {
  try {
    console.log("will connect to MongoDB...");
    if (isConnectedToDb && !willForceConnection) {
      console.log("Already connected to DB.");
      return { wasSuccessful: true };
    }

    if (mongoose.connection.readyState === 1 && (dbType && mongoose.connection.host.includes(dbType))) {
      console.log("Already connected to DB.");
      return { wasSuccessful: true };
    }

    if ((mongoose.connection.readyState === 1) && ((dbType === "preview") || (dbType === "production"))) {
      await mongoose.disconnect()
    }

    const connectionState = await mongoose.connect(createConnectionUri(dbType), {
      retryWrites: true,
      serverSelectionTimeoutMS: serverSelectionTimeoutMS,
    });
    isConnectedToDb = connectionState.connection.readyState === 1;

    if (!isConnectedToDb && (tries <= 3) && isRetryable) {
      console.log("Failed to connect to DB. Will try again.");
      const triesUpdated = await waitWithExponentialBackOff(tries);

      return await connectToMongodb(
        serverSelectionTimeoutMS,
        triesUpdated,
        true
      );
    }

    return { wasSuccessful: isConnectedToDb };
  } catch (error) {
    console.error("Failed to connect to the db. Error message: ", error);

    return { wasSuccessful: false };
  }
};

export const connectToDbWithoutRetries = async () => {
  try {
    await mongoose.connect(createConnectionUri());

    if (mongoose.connection.readyState !== 1) {
      throw new Error("Ready state is not 1.");
    }

    console.log("Connection status: ", mongoose.connection);

    return true;
  } catch (error) {
    console.error("Failed to connect to the database. Reason: ", error);

    return false;
  }
}