import mongoose from 'mongoose';
import chalk from 'chalk';

let isConnectedToDb = false;

export const connectToMongodb = async () => {
  try {
    if (isConnectedToDb) {
      console.log('Already connected to DB');
      return;
    }

    const { MONGODB_PASSWORD, MONGODB_USER, MONGODB_DB_NAME, MONGODB_DB_PROD_NAME } = process.env;
    const dbName = MONGODB_DB_PROD_NAME ?? MONGODB_DB_NAME;
    
    if(MONGODB_DB_PROD_NAME){
      console.log(chalk.red('YOU ARE ON PRODUCTION.'));
    }

    const connectionStr = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.tynope2.mongodb.net/${dbName}`;
    console.log('connectionStr: ', connectionStr);
    const connectionState = await mongoose.connect(connectionStr, { retryWrites: true });

    isConnectedToDb = connectionState.connections[0].readyState === 1;

    console.log('isConnectedToDb: ', isConnectedToDb);

    return { wasSuccessful: isConnectedToDb };
  } catch (error) {
    console.error('Failed to connect to the db. Error message: ', error);
    
    return { wasSuccessful: false };
  }
};
