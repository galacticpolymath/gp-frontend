import mongoose from 'mongoose';

let isConnectedToDb = false;

export const connectToMongodb = async () => {
  try {
    if (isConnectedToDb) {
      console.log('Already connected to DB');
      return;
    }

    const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME, MONGODB_DB_PROD } = process.env;
    let dbName = MONGODB_DB_NAME;

    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      dbName = MONGODB_DB_PROD;
    }

    dbName = 'GP-Catalog';

    console.log('dbName meng: ', dbName);

    const connectionStr = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${dbName}`;
    const connectionState = await mongoose.connect(connectionStr, { retryWrites: true });

    isConnectedToDb = connectionState.connections[0].readyState === 1;

    return { wasSuccessful: isConnectedToDb };
  } catch (error) {
    console.error('Failed to connect to the db. Error message: ', error);

    return { wasSuccessful: false };
  }
};
