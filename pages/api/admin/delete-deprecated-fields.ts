import { NextApiRequest, NextApiResponse } from 'next';
import { CustomError } from '../../../backend/utils/errors';
import { connectToMongodb } from '../../../backend/utils/connection';
import { TEnvironment } from '../../../types/global';
import { updateUsersDynamically } from '../../../backend/services/userServices';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'DELETE') {
      throw new CustomError(
        'Invalid request method. This route only accepts DELETE requests.',
        405
      );
    }

    const dbType = req.query.dbType as TEnvironment;

    console.log('Database Type:', dbType);

    await connectToMongodb(10_000, 0, true, dbType ?? 'dev');

    const deprecatedFieldsRemovalResult = await updateUsersDynamically(
      {},
      {
        $unset: {
          gradesOrYears: 1,
          name: 1,
          reasonsForSiteVisit: 1,
          subjects: 1,
          classroomSize: 1,
        },
      },
      {
        strict: false,
      }
    );

    if (!deprecatedFieldsRemovalResult.wasSuccessful) {
      console.error(
        'An unexpected error occurred during the user migration operations.'
      );

      return res
        .status(500)
        .json({ error: 'Failed to remove the deprecated fields.', wasSuccessful: false });
    }

    res.status(200).json({ wasSuccessful: false });
  } catch (error: any) {
    console.error('An error has occurred: ', error);
    const { message, status } = error ?? {};
    res.status(status ?? 500).json({ message, wasSuccessful: false });
  }
}