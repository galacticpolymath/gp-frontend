import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongodb } from '../../../backend/utils/connection';
import { getUsers } from '../../../backend/services/userServices';
import { TEnvironment } from '../../../types/global';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('req.query: ', req.query);
    const dbType = req.query.dbType as TEnvironment;

    console.log('Database Type:', dbType);

    await connectToMongodb(10_000, 0, true, dbType ?? 'dev');

    const users = await getUsers({}, {}, true);

    console.log('Retrieved Users: ', users.users?.length);

    return res.status(200).json({ users: users.users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errMsg: 'Failed to retrieve all users' });
  }
}