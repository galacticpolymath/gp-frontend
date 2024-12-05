/* eslint-disable no-console */
import mongoose from 'mongoose';

let isConnectedToDb = false;

export const createConnectionUri = () => {
  const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME, MONGODB_DB_PROD } = process.env;
  let dbName = MONGODB_DB_NAME;

  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    dbName = MONGODB_DB_PROD;
  }

  const connectionUri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${dbName}`;

  return connectionUri;
};

export const connectToMongodb = async () => {
  try {
    console.log('will connect to MongoDB...');
    if (isConnectedToDb) {
      console.log('Already connected to DB');
      return { wasSuccessful: true };
    }

    const connectionUri = createConnectionUri();
    const connectionState = await mongoose.connect(connectionUri, { retryWrites: true });

    isConnectedToDb = connectionState.connections[0].readyState === 1;

    return { wasSuccessful: isConnectedToDb };
  } catch (error) {
    console.error('Failed to connect to the db. Error message: ', error);

    return { wasSuccessful: false };
  }
};
