import { NextApiRequest } from 'next';
import { getUser, updateUser } from '../../../backend/services/userServices';

interface IReqBody {
  PrimaryContact: {
    Email: string;
  };
  [key: string]: unknown;
}

export default async function handler(req: NextApiRequest) {
  try {
    // TODO: make this route secure, authorize the request

    if (req.method !== 'POST') {
      console.error('Method not allowed.');
      return;
    }

    console.log('req.body: ', req.body);

    const body = req.body as IReqBody;
    const targetUser = await getUser(
      { outsetaPersonEmail: body.PrimaryContact.Email },
      { isGpPlusMember: 1, _id: 1 }
    );

    if (!targetUser || targetUser.errType || !targetUser.user) {
      console.error(
        'Target user not found in database. Can\'t track subscription started event.'
      );
      return;
    }

    if (!targetUser.user) {
      console.error('Target user is missing in database. Can\'t track subscription started event.');
      return;
    }

    if (targetUser.user.isGpPlusMember) {
      console.log(
        'The user is already a GP+ member. Can\'t track subscription started event.'
      );
      return;
    }

    const updateUserResult = await updateUser(
      { _id: targetUser.user._id },
      { isGpPlusMember: true }
    );

    if(!updateUserResult.wasSuccessful || updateUserResult.errMsg){
      console.error(
        updateUserResult.errMsg ?? 'An error has occurred. Can\'t update user to be a GP+ member. Reason: '
      );
      return;
    }

    console.log('User successfully updated to be a GP+ member.');
  } catch (error) {
    console.error(
      'An error has occurred. Can\'t track subscription started event. Reason: ',
      error
    );
  }
}