/* eslint-disable no-console */
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

let isConnectedToDb = false;
let isMongoDbClientConnectedToDb = false;

const createConnectionUri = () => {
  const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME, MONGODB_DB_PROD } = process.env;
  let dbName = MONGODB_DB_NAME;

  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    dbName = MONGODB_DB_PROD;
  }

  const connectionUri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${dbName}`;

  return connectionUri;
};

export const getDbClientConnectionPromise = () => {
  if(isMongoDbClientConnectedToDb){
    console.log('MongoClient is already connected.')
    return;
  }

  const connectionUri = createConnectionUri();
  const client = new MongoClient(connectionUri);
  isMongoDbClientConnectedToDb = true;

  console.log('will connect from MongoClient...')

  return client.connect();
};

export const connectToMongodb = async () => {
  try {
    if (isConnectedToDb) {
      console.log('Already connected to DB');
      return;
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
