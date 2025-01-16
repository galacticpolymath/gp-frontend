/* eslint-disable no-console */
import mongoose from "mongoose";
import { waitWithExponentialBackOff } from "../../globalFns";

let isConnectedToDb = false;

export const createConnectionUri = () => {
  const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME, MONGODB_DB_PROD } =
    process.env;
  let dbName = MONGODB_DB_NAME;

  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    dbName = MONGODB_DB_PROD;
  }

  const connectionUri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${dbName}`;

  return connectionUri;
};

export const connectToMongodb = async (
  serverSelectionTimeoutMS = 15_000,
  tries = 0,
  isRetryable = false,
  willForceConnection = false
) => {
  try {
    console.log("will connect to MongoDB...");
    if (isConnectedToDb && !willForceConnection) {
      console.log("Already connected to DB.");
      return { wasSuccessful: true };
    }

    const connectionState = await mongoose.connect(createConnectionUri(), {
      retryWrites: true,
      serverSelectionTimeoutMS: serverSelectionTimeoutMS,
    });
    isConnectedToDb = connectionState.connection.readyState === 1;

    if (!isConnectedToDb && (tries <= 3) && isRetryable) {
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
