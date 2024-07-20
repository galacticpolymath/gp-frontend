/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import getCanUserWriteToDb from '../services/dbAuthService';
import { jwtVerify } from 'jose';
import JwtModel from '../models/Jwt';
import { connectToMongodb } from '../utils/connection';
import { signJwt } from '../utils/auth';
import { HashedPassword, getIsPasswordCorrect, hashPassword } from '../utils/security';
import User from '../models/user';
import { createDocument } from '../db/utils';
import { AuthError, SignInError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { createUser, getUserByEmail } from '../services/userServices';

const VALID_FORMS = ['createAccount', 'login'];

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
      console.log(id);
      return;
    },
    async getUserByEmail(email) {
      console.log('getUserByEmail, param: ', email);
      return {
        name: 'Gabriel Torion',
        email: 'gtorion97@gmail.com',
        image: 'https://lh3.googleusercontent.com/a/ACg8ocLQWnyB3uuTWGK1pSvbLbViEXx0_vz_g1OoQf0_yjVwWuKCrw=s96-c',
        emailVerified: null,
      };
    },
    async getUserByAccount(params) {
      console.log('getUserByAccount: ', params);

      return {
        name: 'Gabriel Torion',
        email: 'gtorion97@gmail.com',
        image: 'https://lh3.googleusercontent.com/a/ACg8ocLQWnyB3uuTWGK1pSvbLbViEXx0_vz_g1OoQf0_yjVwWuKCrw=s96-c',
        emailVerified: null,
      };
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
      console.log(account);
      return;
    },
    async unlinkAccount({ providerAccountId, provider }) {
      console.log('unlinkAccount, params: ', { providerAccountId, provider });
      return;
    },
    async createSession(params) {
      console.log(params);
      return;
    },
    async getSessionAndUser(sessionToken) {
      console.log(sessionToken);
      return;
    },
    async updateSession(params) {
      console.log(params);
      return;
    },
    async deleteSession(sessionToken) {
      console.log(sessionToken);
      return;
    },
    async createVerificationToken(params) {
      console.log(params);
      return;
    },
    async useVerificationToken(params) {
      console.log(params);
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
            throw new AuthError('userNotFound', 404);
          }

          // if no password, that means the user has a 'google' for the providers 
          // user must sign in with google to log in.
          if (dbUser && !dbUser?.password && (formType === 'login')) {
            console.log('The user does not have "credentials" for their provider.');
            throw new AuthError('dbUserDoesNotHaveCredentialsProvider', 401);
          }

          const { iterations, salt, hash: hashedPasswordFromDb } = dbUser.password;

          if ((formType === 'login') && !getIsPasswordCorrect({ iterations, salt, password: password }, hashedPasswordFromDb)) {
            console.log('Invalid creds.');
            throw new AuthError('invalidCredentials', 404);
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
            throw new AuthError('userCreationFailure', 500);
          }

          await newUser.save();

          return userDocumentToCreate;
        } catch (error) {
          console.log('error object: ', error);
          const { errType, code } = error ?? {};

          if (!errType || !code) {
            return { errType: 'userAuthFailure', code: 500 };
          }

          return { errType, code };
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
    encode: async ({ secret, token }) => {
      try {
        const { email, name } = token?.payload ?? token;
        const pic = token.picture ?? token.pic;
        const canUserWriteToDb = await getCanUserWriteToDb(email);
        const allowedRoles = canUserWriteToDb ? ['user', 'dbAdmin'] : ['user'];
        const refreshToken = await signJwt({ email: email, roles: allowedRoles, name: name, pic }, secret, '1 day');
        const accessToken = await signJwt({ email: email, roles: allowedRoles, name: name, pic }, secret, '12hr');

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
        const { user, account } = param;
        const { errType, code, email } = user ?? {};

        if (errType === 'dbUserDoesNotHaveCredentialsProvider') {
          throw new SignInError(
            'provider-mismatch-error',
            'The provider of the sign in method does not match with the provider stored in the database for the user.',
            code ?? 422
          );
        }

        await connectToMongodb();

        const dbUser = email ? await getUserByEmail(email) : null;

        // the user creates an account with google
        if (!dbUser && (account.provider === 'google')) {
          const { wasSuccessful } = await createUser(user.email, null, 'google', ['user']);

          console.log('"wasSuccessful" in creating the db user with a google account: ', wasSuccessful);

          if (!wasSuccessful) {
            throw new SignInError(
              'user-account-creation-with-google-err',
              'Failed to create the user who signed in with google.',
              500
            );
          }

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
        console.error('An error has occurred, couldn\'t sign in the target user. Reason: ', error);

        const { type, msg } = error;

        console.error('Error message: ', msg ?? 'received none.');

        return `/?signin-err-type=${type ?? 'sign-in-error'}`;
      }
    },
    async jwt({ token, user }) {
      const isUserSignedIn = !!user;

      if (isUserSignedIn && token?.id && user?.id) {
        token.id = user.id.toString();
      }

      return Promise.resolve(token);
    },
    async session({ session, token }) {
      console.log('token.payload, what is up: ', token.payload);
      const { email, roles, name, pic } = token.payload;
      const accessToken = await signJwt({ email: email, roles: roles, name: name, pic }, process.env.NEXTAUTH_SECRET, '12hours');
      const refreshToken = await signJwt({ email: email, roles: roles, name: name, pic }, process.env.NEXTAUTH_SECRET, '1 day');
      session.id = token.id;
      session.token = accessToken;
      session.refresh = refreshToken;
      session.user = {
        email,
        name,
        image: pic,
      };

      return Promise.resolve(session);
    },
    async redirect({ baseUrl }) {
      // const urlObj = new URL(url);

      return Promise.resolve(`${baseUrl}/auth-result`);
    },
  },
};