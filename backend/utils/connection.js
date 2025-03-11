/* eslint-disable no-console */
import mongoose from "mongoose";
import { waitWithExponentialBackOff } from "../../globalFns";

let isConnectedToDb = false;

export const createConnectionUri = (dbType) => {
  const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME, MONGODB_DB_PROD } =
    process.env;
  let dbName = MONGODB_DB_NAME;

  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    dbName = MONGODB_DB_PROD;
  }

  if (dbType === "production") {
    dbName = MONGODB_DB_PROD;
  } else if (dbType === "dev") {
    dbName = MONGODB_DB_NAME;
  }

  const connectionUri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${dbName}`;

  return connectionUri;
};

/**
 * Connects to MongoDB.
 * @param {number} [serverSelectionTimeoutMS=15_000] - The server selection timeout in ms.
 * @param {number} [tries=0] - The number of times the function has been retried.
 * @param {boolean} [isRetryable=false] - Whether the function should retry if connecting to MongoDB fails.
 * @param {"dev" | "production" | undefined} [dbType] - The type of database to connect to. Can be "dev" or "production".
 * @returns {Promise<{wasSuccessful: boolean}>} - A promise that resolves to an object with a "wasSuccessful" property that indicates whether the connection was successful.
 */
export const connectToMongodb = async (
  serverSelectionTimeoutMS = 15_000,
  tries = 0,
  isRetryable = false,
  dbType
) => {
  try {
    if (isConnectedToDb && !dbType) {
      console.log("Already connected to DB.");
      return { wasSuccessful: true };
    }

    if ((mongoose.connection.readyState === 1) && !dbType) {
      console.log("Already connected to DB. Read state is 1.");
      return { wasSuccessful: true };
    }

    const currentDbName = mongoose.connection.db?.databaseName;
    const targetDbNameForConnection =
      ((dbType === "production") || (dbType === 'dev')) ? (dbType === 'production' ? process.env.MONGODB_DB_PROD : process.env.MONGODB_DB_NAME) : null;

    if ((mongoose.connection.readyState === 1) && (currentDbName !== targetDbNameForConnection)) {
      console.log("Will disconnect from DB.");
      await mongoose.disconnect();
    }

    const connectionState = await mongoose.connect(
      createConnectionUri(dbType),
      {
        retryWrites: true,
        serverSelectionTimeoutMS: serverSelectionTimeoutMS,
      }
    );
    isConnectedToDb = connectionState.connection.readyState === 1;

    if (!isConnectedToDb && tries <= 3 && isRetryable) {
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

export const connectToDbWithoutRetries = async (dbType) => {
  let targetDb = undefined;
  let _dbType = dbType;

  if (!_dbType) {
    _dbType =
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "prod" : "dev";
  }

  if (typeof _dbType === "string") {
    targetDb =
      _dbType === "prod"
        ? process.env.MONGODB_DB_PROD
        : process.env.MONGODB_DB_NAME;
  }

  try {
    if (
      typeof targetDb === "string" &&
      mongoose.connection?.db?.databaseName !== targetDb
    ) {
      console.log("Will disconnect from DB.");
      await mongoose.disconnect();
    }

    if (typeof targetDb !== "string" && mongoose.connection.readyState === 1) {
      console.log("Already connected to DB.");
      return true;
    }

    await mongoose.connect(createConnectionUri(_dbType));

    if (mongoose.connection.readyState !== 1) {
      throw new Error("Ready state is not 1.");
    }

    return true;
  } catch (error) {
    console.error("Failed to connect to the database. Reason: ", error);

    return false;
  }
};
