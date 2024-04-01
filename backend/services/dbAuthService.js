/* eslint-disable no-console */
import urllib from 'urllib';

const getCanUserWriteToDb = async clientEmail => {
  try {
    const { MONGODB_PROJECT_ID, MONGODB_PROJECT_PRIVATE_KEY, MONGODB_PROJECT_PUBLIC_KEY } = process.env;
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${MONGODB_PROJECT_ID}/users`;
    const options = { digestAuth: `${MONGODB_PROJECT_PUBLIC_KEY}:${MONGODB_PROJECT_PRIVATE_KEY}` };
    const response = await urllib.request(url, options);

    if (response.status !== 200) {
      throw new Error('Failed to get the emails from the db project manager users.');
    }

    let data = response?.data?.toString();
    data = JSON.parse(data);
    const canUserWriteToDb = !!data?.results?.find(({ emailAddress }) => emailAddress === clientEmail);

    return canUserWriteToDb;
  } catch (error) {
    console.error('An error has occurred getting the project managers users from the db. The user cannot write to the db. Error message: ', error);

    return false;
  }
};

export default getCanUserWriteToDb;