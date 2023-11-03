import mongoose from 'mongoose';

let isConnectedToDb = false;

export const connectToMongodb = async () => {
  try {
    if (isConnectedToDb) {
      console.log('Already connected to DB');
      return;
    }

    const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME } = process.env;
    const connectionStr = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${MONGODB_DB_NAME}`;

    const connectionState = await mongoose.connect(connectionStr, { retryWrites: true });

    isConnectedToDb = connectionState.connections[0].readyState === 1;

    return { wasSuccessful: isConnectedToDb };
  } catch (error) {
    console.error('Failed to connect to the db. Error message: ', error);
    
    return { wasSuccessful: false };
  }
};
