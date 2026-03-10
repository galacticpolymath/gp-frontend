import mongoose from 'mongoose';
import { waitWithExponentialBackOff } from '../../globalFns.js';

let isConnectedToDb = false;
let connectionQueue = Promise.resolve();

const normalizeDbType = (dbType) => {
  if (typeof dbType !== 'string') {
    return null;
  }

  const normalized = dbType.trim().toLowerCase();

  if (normalized === 'prod' || normalized === 'production') {
    return 'production';
  }

  if (
    normalized === 'dev' ||
    normalized === 'development' ||
    normalized === 'preview'
  ) {
    return 'dev';
  }

  return null;
};

const resolveDefaultDbType = () => {
  const vercelEnv = normalizeDbType(
    process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV
  );

  if (vercelEnv) {
    return vercelEnv;
  }

  return process.env.NODE_ENV === 'production' ? 'production' : 'dev';
};

const resolveTargetDbType = (dbType) => normalizeDbType(dbType) ?? resolveDefaultDbType();

const resolveTargetDbName = (dbType) => {
  const normalizedDbType = resolveTargetDbType(dbType);

  return normalizedDbType === 'production'
    ? process.env.MONGODB_DB_PROD
    : process.env.MONGODB_DB_NAME;
};

export const createConnectionUri = (dbType) => {
  const { MONGODB_PASSWORD, MONGODB_USER } = process.env;
  const dbName = resolveTargetDbName(dbType);

  console.log('dbName: ', dbName);

  return `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${dbName}`;
};

const queueConnectionTask = async (task) => {
  const nextTask = connectionQueue.then(task, task);

  connectionQueue = nextTask.then(
    () => undefined,
    () => undefined
  );

  return nextTask;
};

const connectWithResolvedDb = async (serverSelectionTimeoutMS, dbType) => {
  const targetDbName = resolveTargetDbName(dbType);

  if (typeof targetDbName !== 'string' || !targetDbName.length) {
    throw new Error('Target MongoDB database name is not configured.');
  }

  const currentDbName = mongoose.connection.db?.databaseName;

  if (
    mongoose.connection.readyState === 1 &&
    currentDbName === targetDbName
  ) {
    isConnectedToDb = true;
    return { wasSuccessful: true };
  }

  if (mongoose.connection.readyState === 1 && currentDbName !== targetDbName) {
    console.log('Will disconnect from DB.');
    await mongoose.disconnect();
  }

  const connectionState = await mongoose.connect(createConnectionUri(dbType), {
    retryWrites: true,
    serverSelectionTimeoutMS,
  });

  isConnectedToDb = connectionState.connection.readyState === 1;

  return { wasSuccessful: isConnectedToDb };
};

/**
 * Connects to MongoDB.
 * @param {number} [serverSelectionTimeoutMS] - The server selection timeout in ms.
 * @param {number} [tries] - The number of times the function has been retried.
 * @param {boolean} [isRetryable] - Whether the function should retry if connecting to MongoDB fails.
 * @param {"dev" | "production" | "prod" | undefined} [dbType] - The target database type.
 * @returns {Promise<{wasSuccessful: boolean}>}
 */
export const connectToMongodb = async (
  serverSelectionTimeoutMS = 15_000,
  tries = 0,
  isRetryable = false,
  dbType
) => {
  try {
    return await queueConnectionTask(async () => {
      const targetDbType = resolveTargetDbType(dbType);
      const targetDbName = resolveTargetDbName(targetDbType);

      if (
        isConnectedToDb &&
        mongoose.connection.readyState === 1 &&
        mongoose.connection.db?.databaseName === targetDbName
      ) {
        console.log('Already connected to DB.');
        return { wasSuccessful: true };
      }

      return await connectWithResolvedDb(serverSelectionTimeoutMS, targetDbType);
    });
  } catch (error) {
    console.error('Failed to connect to the db. Error message: ', error);

    if (tries <= 3 && isRetryable) {
      console.log('Failed to connect to DB. Will try again.');
      const triesUpdated = await waitWithExponentialBackOff(tries);

      return connectToMongodb(
        serverSelectionTimeoutMS,
        triesUpdated,
        true,
        dbType
      );
    }

    isConnectedToDb = false;
    return { wasSuccessful: false };
  }
};

export const connectToDbWithoutRetries = async (dbType) => {
  try {
    const { wasSuccessful } = await connectToMongodb(15_000, 0, false, dbType);
    return wasSuccessful;
  } catch (error) {
    console.error('Failed to connect to the database. Reason: ', error);
    return false;
  }
};
