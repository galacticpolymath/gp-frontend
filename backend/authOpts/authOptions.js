/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import getCanUserWriteToDb from '../services/dbAuthService';
import { jwtVerify } from 'jose';
import JwtModel from '../models/Jwt';
import { connectToMongodb } from '../utils/connection';
import { signJwt } from '../utils/auth';
import { createIterations, createSalt, getIsPasswordCorrect, hashPassword } from '../utils/security';
import User from '../models/user';
import { createDocument } from '../db/utils';
import { AuthError, SignInError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { createUser, deleteUser, getUser, getUserByEmail, updateUser } from '../services/userServices';
import NodeCache from 'node-cache';

const VALID_FORMS = ['createAccount', 'login'];
export const cache = new NodeCache({ stdTTL: 100 });

/** @return { import("next-auth/adapters").Adapter } */
export default function MyAdapter() {
  return {
    async createUser(user) {
      return;
    },
    async getUser(id) {
      return;
    },
    async getUserByEmail(email) {
      return;
    },
    async getUserByAccount({ provider, providerAccountId }) {
      try {
        await connectToMongodb();

        const user = await getUser({ providerAccountId: providerAccountId });

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
        console.log('credentials, yo there: ', credentials);
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

          const { email, password, firstName, lastName, formType } = credentials;
          /** @type { import('../models/user').TUserSchema } */
          const dbUser = await getUserByEmail(email);
          const callbackUrl = credentials.callbackUrl.includes('?') ? credentials.callbackUrl.split('?')[0] : credentials.callbackUrl;

          console.log('what is up there: ', callbackUrl);

          if (!dbUser && (formType === 'login')) {
            console.log('The user was not found.');
            throw new AuthError('userNotFound', 404, callbackUrl ?? '');
          }

          // if no password, that means the user has a 'google' for the providers 
          // user must sign in with google to log in.
          if (dbUser && !dbUser?.password && (formType === 'login')) {
            console.log('The user has "google" for their credentials.');

            throw new AuthError('dbUserDoesNotHaveCredentialsProvider', 401, callbackUrl ?? '');
          }

          if (dbUser && formType === 'createAccount') {
            throw new AuthError('userAlreadyExist', 409, callbackUrl ?? '');
          }

          console.log('If user is logging in, will check if the password is correct.');

          const { iterations, salt, hash: hashedPasswordFromDb } = dbUser?.password ?? {};

          console.log('iterations: ', iterations);
          console.log('typeof iterations: ', typeof iterations);

          if ((formType === 'login') && !getIsPasswordCorrect({ iterations, salt, password }, hashedPasswordFromDb)) {
            console.log('Invalid creds.');

            throw new AuthError('invalidCredentials', 404, callbackUrl ?? '');
          }

          if ((formType === 'login') && getIsPasswordCorrect({ iterations, salt, password: password }, hashedPasswordFromDb)) {
            console.log('Password is correct, will log the user in.');

            return dbUser;
          }

          console.log('Will create the new user.');
          const hashedPassword = hashPassword(password, createSalt(), createIterations());

          console.log('hashedPassword: ', hashedPassword);

          // the user will be created

          const userDocumentToCreate = {
            _id: uuidv4(),
            email: email,
            password: hashedPassword,
            name: {
              first: firstName,
              last: lastName,
            },
            provider: 'credentials',
            roles: ['user'],
          };
          const newUser = createDocument(userDocumentToCreate, User);

          if (!newUser) {
            throw new AuthError('userCreationFailure', 500, callbackUrl ?? '');
          }

          await newUser.save();

          return { ...userDocumentToCreate, wasUserCreated: true };
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

        if (errType === 'userAlreadyExist') {
          throw new SignInError(
            'duplicate-user',
            'This email has already been taken.',
            code ?? 422
          );
        }

        await connectToMongodb();

        const dbUser = userEmail ? await getUserByEmail(userEmail) : null;

        if (dbUser && wasUserCreated) {
          await deleteUser({ providerAccountId: providerAccountId });

          return '/account?account-creation-err-type=duplicate-email&provider-used=google';
        }

        // Finish creating the gogole user account in the db.
        if (wasUserCreated && (account.provider === 'google') && !dbUser) {
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

          return true;
        }

        if (wasUserCreated && (account.provider === 'credentials')) {
          return true;
        }

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
        const { type } = error;
        if (type && param?.user?.redirectUrl) {
          return `${param.user.redirectUrl}/?signin-err-type=${type}`;
        }

        return param?.user?.redirectUrl ? `${param.user.redirectUrl}/?signin-err-type=${type ?? 'sign-in-error'}` : `/?signin-err-type=${type ?? 'sign-in-error'}`;
      }
    },
    async jwt(param) {
      const { token, user, profile } = param;
      const isUserSignedIn = !!user;

      if (isUserSignedIn && (user.id ?? user._id)) {
        token.id = user.id ?? user._id;
      }

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
      /** @type {{ [key:string]: import('../models/user').TUserSchema  }} */
      const targetUser = cache.get(email) ?? {};
      let picture = '';
      let occupation = null;

      console.log('users, cache: ', targetUser);

      if (targetUser && targetUser.picture && targetUser.occupation) {
        picture = targetUser.picture;
        occupation = targetUser.occupation;
      } else {
        // HANDLED CASE WHICH THE USER DOES NOT EXIST
        /** @type {import('../models/user').TUserSchema  } */
        await connectToMongodb();

        const dbUser = await getUser({ email: email }, { picture: 1, occupation: 1 });
        picture = dbUser.picture ?? '';
        occupation = dbUser.occupation ?? null;

        cache.set(email, targetUser, 100);
      }

      session.id = token.id;
      session.token = accessToken;
      session.refresh = refreshToken;
      session.user = {
        email: email,
        name: name,
        image: picture,
        occupation: occupation,
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