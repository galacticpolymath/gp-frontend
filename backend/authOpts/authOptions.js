/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import getCanUserWriteToDb from '../services/dbAuthService';
import { jwtVerify } from 'jose';
import JwtModel from '../models/Jwt';
import { connectToMongodb } from '../utils/connection';
import { signJwt } from '../utils/auth';
import { getIsPasswordCorrect, hashPassword } from '../utils/security';
import User from '../models/user';
import { createDocument } from '../db/utils';
import { AuthError, SignInError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { createUser, deleteUser, getUser, getUserByEmail, updateUser } from '../services/userServices';
import NodeCache from 'node-cache';

const VALID_FORMS = ['createAccount', 'login'];
const cache = new NodeCache();

/** @return { import("next-auth/adapters").Adapter } */
export default function MyAdapter() {
  return {
    async createUser(user) {
      console.log('createUser, user: ', user);

      // GOAL: save the user into the database when the user signs into google
      // what do I get when the user signs into the google 
      return user;
    },
    async getUser(id) {
      console.log('id, getUser: ', id);

      return;
    },
    async getUserByEmail(email) {
      console.log('getting user by email: ', email);
      const user = await getUserByEmail(email);

      if (!user) {
        return null;
      }

      return user;
    },
    async getUserByAccount({ provider, providerAccountId }) {
      try {
        await connectToMongodb();

        const user = await getUser({ providerAccountId: providerAccountId });

        console.log('user, sup there: ', user);

        if (!user) {
          const { wasSuccessful } = await createUser('PLACEHOLDER', null, provider, ['user'], providerAccountId);

          console.log('"wasSuccessful" in creating the db user with a google account: ', wasSuccessful);

          if (!wasSuccessful) {
            throw new Error('Failed to create the document for the target user in the db.');
          }

          return { providerAccountId, provider, wasUserCreated: true };
        }

        return { providerAccountId, provider, email: user.email, id: user._id, image: user.picture, name: user.name };
      } catch (error) {
        console.error('Failed to create the user doc into the database. Reason: ', error);
        await deleteUser({ providerAccountId: providerAccountId });

        return null;
      }
    },
    async updateUser(user) {
      console.log(user);
      return;
    },
    async deleteUser(userId) {
      console.log(userId);
      return;
    },
    async linkAccount(account) {
      console.log('linkAccount: ', account);
      return;
    },
    async unlinkAccount({ providerAccountId, provider }) {
      console.log('unlinkAccount, params: ', { providerAccountId, provider });
      return;
    },
    async createSession(params) {
      console.log('createSession: ', params);
      return;
    },
    async getSessionAndUser(sessionToken) {
      console.log('getSessionAndUser: ', sessionToken);
      return;
    },
    async updateSession(params) {
      console.log('updateSession: ', params);
      return;
    },
    async deleteSession(sessionToken) {
      console.log('deleteSession: ', sessionToken);

      return;
    },
    async createVerificationToken(params) {
      console.log('createVerificationToken: ', params);
      return;
    },
    async useVerificationToken(params) {
      console.log('useVerificationToken: ', params);
      return;
    },
  };
}

/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
  adapter: MyAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
    }),
    CredentialsProvider({
      async authorize(credentials) {
        try {
          if (
            !credentials.formType ||
            !credentials.email ||
            !credentials.password ||
            !VALID_FORMS.includes(credentials.formType)
          ) {
            throw new AuthError('invalidForm', 500);
          }

          await connectToMongodb();

          const { email, password, formType } = credentials;
          const dbUser = await getUserByEmail(email);

          if (!dbUser && (formType === 'login')) {
            console.log('The user was not found.');
            throw new AuthError('userNotFound', 404, credentials.callbackUrl ?? '');
          }

          // if no password, that means the user has a 'google' for the providers 
          // user must sign in with google to log in.
          if (dbUser && !dbUser?.password && (formType === 'login')) {
            console.log('The user does not have "credentials" for their provider.');

            throw new AuthError('dbUserDoesNotHaveCredentialsProvider', 401, credentials.callbackUrl ?? '');
          }

          const { iterations, salt, hash: hashedPasswordFromDb } = dbUser.password;

          if ((formType === 'login') && !getIsPasswordCorrect({ iterations, salt, password: password }, hashedPasswordFromDb)) {
            console.log('Invalid creds.');

            throw new AuthError('invalidCredentials', 404, credentials.callbackUrl ?? '');
          }

          if ((formType === 'login') && getIsPasswordCorrect({ iterations, salt, password: password }, hashedPasswordFromDb)) {
            console.log('Password is correct, will log the user in.');

            return dbUser;
          }

          console.log('Will create the new user.');

          // the user is being created 
          const userDocumentToCreate = {
            _id: uuidv4(),
            email: email,
            password: hashPassword(password),
            roles: ['user'],
          };
          const newUser = createDocument(userDocumentToCreate, User);

          if (!newUser) {
            throw new AuthError('userCreationFailure', 500, credentials.callbackUrl ?? '');
          }

          await newUser.save();

          return userDocumentToCreate;
        } catch (error) {
          console.log('error object: ', error);
          const { errType, code, redirectUrl } = error ?? {};

          if (!errType || !code) {
            return { errType: 'userAuthFailure', code: 500 };
          }

          return { errType, code, redirectUrl };
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  jwt: {

    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 30,
    encode: async (param) => {
      try {
        console.log('param, session yo, encode: ', param);
        const { token, secret } = param;
        const { email, name } = token?.payload ?? token;
        const canUserWriteToDb = await getCanUserWriteToDb(email);

        // get the user from the db, to get their first name last name, image
        const allowedRoles = canUserWriteToDb ? ['user', 'dbAdmin'] : ['user'];
        const refreshToken = await signJwt({ email: email, roles: allowedRoles, name: name }, secret, '1 day');
        const accessToken = await signJwt({ email: email, roles: allowedRoles, name: name }, secret, '12hr');

        if (!token?.payload && canUserWriteToDb) {
          await connectToMongodb();
          const jwt = new JwtModel({ _id: email, access: accessToken, refresh: refreshToken });

          jwt.save();
        }

        return accessToken;
      } catch (error) {
        throw new Error('Unable to generate JWT. Error message: ', error);
      }
    },
    decode: async ({ secret, token }) => {
      const decodedToken = await jwtVerify(token, new TextEncoder().encode(secret));
      return decodedToken;
    },
  },
  callbacks: {
    async signIn(param) {
      console.log('signin, param: ', param);

      try {
        const { user, account, profile } = param;
        const { errType, code, email, providerAccountId, wasUserCreated } = user ?? {};
        const userEmail = profile?.email ?? email;

        if (errType === 'dbUserDoesNotHaveCredentialsProvider') {
          throw new SignInError(
            'provider-mismatch-error',
            'The provider of the sign in method does not match with the provider stored in the database for the user.',
            code ?? 422
          );
        }

        await connectToMongodb();

        // Finish creating the target user account in the db.
        if (wasUserCreated && (account.provider === 'google')) {
          const { picture, given_name, family_name } = profile ?? {};
          const name = {
            first: given_name,
            last: family_name,
          };
          const { wasSuccessful } = await updateUser({ providerAccountId: providerAccountId }, { email: userEmail, picture: picture ?? '', name: name });

          if (!wasSuccessful) {
            await deleteUser({ providerAccountId: providerAccountId });

            throw new SignInError(
              'user-account-creation-with-google-err',
              'Failed to create the user who signed in with google.',
              500
            );
          }

          return '/account/?show_about_me_form=true';
        }

        const dbUser = (userEmail && !wasUserCreated) ? await getUserByEmail(userEmail) : null;

        if ((dbUser && account) &&
          ('provider' in account) &&
          ('provider' in dbUser) &&
          (dbUser.provider !== account.provider)) {
          throw new SignInError(
            'provider-mismatch-error',
            'The provider of the sign in method is incorrect with the provider stored in the database.',
            422
          );
        }

        if (!dbUser) {
          throw new SignInError(
            'user-not-found',
            'The target user is not found in the db.',
            404
          );
        }

        return true;
      } catch (error) {
        console.error('An error has occurred, couldn\'t sign in the target user. Reason: ', error);

        const { type, msg } = error;

        console.error('Error message: ', msg ?? 'received none.');

        return param?.user?.redirectUrl ? `${param.user.redirectUrl}/?signin-err-type=${type ?? 'sign-in-error'}` : `/?signin-err-type=${type ?? 'sign-in-error'}`;
      }
    },
    async jwt(param) {
      console.log('param, sup there beef, jwt callback: ', param);
      const { token, user, profile } = param;
      const isUserSignedIn = !!user;

      if (isUserSignedIn) {
        token.id = user.id.toString();
      }

      console.log('token, jwt callback: ', token);

      return Promise.resolve(token);
    },
    async session(param) {
      console.log('param, session yo: ', param);
      const { token, session } = param;
      const { email, roles, name } = token.payload;
      const accessToken = await signJwt(
        {
          email: email,
          roles: roles,
          name: name,
        },
        process.env.NEXTAUTH_SECRET,
        '12hours'
      );
      const refreshToken = await signJwt({ email: email, roles: roles, name: name }, process.env.NEXTAUTH_SECRET, '1 day');
      /** @type {{ [key: string]: string }  } */
      const userPics = cache.get('pictures') ?? {};
      let picture = '';

      if (Object.keys(userPics).length && userPics[email]) {
        picture = userPics[email];
      } else {
        const dbUser = await getUser({ email: email }, { picture: 1 });
        picture = dbUser.picture ?? '';

        cache.set('pictures', { ...userPics, [email]: picture });
      }

      console.log('userPic, yo there: ', picture);
      
      session.id = token.id;
      session.token = accessToken;
      session.refresh = refreshToken;
      session.user = {
        email: email,
        name: name,
        image: picture,
      };

      console.log('session yo there, updated: ', session);

      return Promise.resolve(session);
    },
    async redirect(param) {
      const { baseUrl, url } = param;

      return url;
    },
  },
};