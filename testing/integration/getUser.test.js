const axios = require('axios');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const signJwt = async (
  jwtPayload,
  secret,
) => {

  const token = jwt.sign(
    {
      ...jwtPayload,
    },
    secret,
    { algorithm: 'HS256' }
  );

  return token;
};

/**
 * Makes a request to the server to get all users from the database, including their
 * mailing list status. The request is made with a JWT token that is signed with the
 * NEXTAUTH_SECRET environment variable and has a payload of the TESTING_EMAIL env
 * variable, the roles "dbAdmin" and "user", and the name "Gabe". The request is made
 * to the /api/get-users endpoint with the query parameter dbType set to "production".
 *
 * @returns {Promise<{
 *   usersOnMailingList: number;
 *   notOnListUsers: number;
 *   usersWithDoubleOptSent: number;
 *   totalUsers: number;
 *   emailsOnMailingList: string[];
 *   mailingListStatuses: ("onList" | "notOnList" | "doubleOptEmailSent")[];
 *   users: {
 *     email: string;
 *     mailingListStatus: "onList" | "notOnList" | "doubleOptEmailSent";
 *   }[];
 * }>} - An object with the number of users on the mailing list, the number of users
 *        not on the mailing list, the number of users with double opt-in sent, the
 *        total number of users, an array of emails on the mailing list, an array of
 *        mailing list statuses, and an array of all users.
 */
const getUserResults = async () => {
  const { NEXTAUTH_SECRET, TESTING_EMAIL } = process.env;
  const accessToken = await signJwt(
    {
      TESTING_EMAIL,
      roles: ['dbAdmin', 'user'],
      name: 'Gabe',
    },
    NEXTAUTH_SECRET,
    '12hr'
  );
  const headers = new Headers();

  headers.append('Authorization', `Bearer ${accessToken}`);

  try {
    // https://dev.galacticpolymath.com/
    // http://localhost:3000/api/get-users
    // https://dev.galacticpolymath.com/api/get-users
    const url = new URL('http://localhost:3000/api/get-users');
    const auth = `Bearer ${accessToken}`;
    const { status, data } = await axios.get(url.href, {
      headers: { Authorization: auth },
      params: {
        dbType: 'production',
      },
    });

    if (status !== 200) {
      throw new Error('Received a non 200 response from the server.');
    }

    const usersOnMailingList = data.users.filter(
      (user) => user.mailingListStatus === 'onList'
    );
    const usersWithDoubleOptSent = data.users.filter(
      (user) => user.mailingListStatus === 'doubleOptEmailSent'
    );
    const notOnListUsers = data.users.filter(
      (user) => user.mailingListStatus === 'notOnList'
    );

    return {
      usersOnMailingList: usersOnMailingList?.length,
      notOnListUsers: notOnListUsers?.length,
      usersWithDoubleOptSent: usersWithDoubleOptSent?.length,
      totalUsers: data?.users?.length,
      emailsOnMailingList: usersOnMailingList.map((user) => user.email),
      mailingListStatuses: data.users.map(
        (user) => user.mailingListStatus
      ),
      users: data.users,
    };
  } catch (error) {
    console.error('Failed to get users. Reason: ', error);

    return {};
  }
};

test.skip(
  "Will check if the responses from the `get-users` route are constant.",
  async () => {
    const getUserResultsPromises = new Array(10)
      .fill(0)
      .map(() => getUserResults());
    const userResults = await Promise.all(getUserResultsPromises);
    const firstResult = userResults[0];

    if (!Object.keys(firstResult).length) {
      console.error('Failed to get users.');
      expect(false).toBe(true);
      return;
    }

    const areResultsConstant = userResults.every((result) => {
      return (
        result.usersOnMailingList === firstResult.usersOnMailingList &&
        result.totalUsers === firstResult.totalUsers &&
        result.notOnListUsers === firstResult.notOnListUsers &&
        result.usersWithDoubleOptSent === firstResult.usersWithDoubleOptSent
      );
    });
    const doAllUsersHaveMailingListStatusField = userResults.every(
      (userResult) => {
        const doesTargetPropExist = userResult.users.every((user) => {
          const doesPropExist = 'mailingListStatus' in user;

          return doesPropExist;
        });

        return doesTargetPropExist;
      }
    );

    delete userResults[0].users;

    const userResult = userResults[0];

    expect(areResultsConstant).toBe(true);
    expect(doAllUsersHaveMailingListStatusField).toBe(true);
  },
  1_000 * 60 * 3
);
