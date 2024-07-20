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
import { AuthError } from '../utils/errors';
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
      // name: 'Create An Account With Your Email',
      // credentials: {
      //   username: { label: 'Email', type: 'text', placeholder: 'Enter email' },
      //   password: { label: 'Password', type: 'text', placeholder: 'Enter password' },
      // },
      async authorize(credentials, req) {
        console.log('req: ', req);
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
          const targetUser = await getUserByEmail(email);

          if (!targetUser && (formType === 'login')) {
            throw new AuthError('userNotFound', 404);
          }

          if ((formType === 'login') && !getIsPasswordCorrect(password)) {
            throw new AuthError('invalidCredentials', 404);
          }

          if ((formType === 'login') && getIsPasswordCorrect(password)) {
            return targetUser;
          }

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
    async signIn({
      account,
      user,
      credentials,
      email,
      profile,
    }) {
      console.log({
        account,
        user,
        credentials,
        email,
        profile,
      });

      // check if the user is signing in with google
      // if the user is signing in with google, check if the user was created
      // if the user was not created (by checking the db), then create the user
      // if the user is created, then return true

      // CASE: there is credentials based account with google that has been made, and the user signs in with google 
      // GOAL: throw an error, redirect the user to the home page, with a error modal: "Sorry, this email has been taken as a credential based account. If you are "
      // -that user, please sign in into your account to continue."
      // cannot sign in the user since the current user has google as its provider and the user in the database has credentials
      // the retrieved user has credentials as its provider
      // check the provider for the retrieved user
      // the user is retrieved from the database
      // using the email of the user, retrieve the user from the database
      // get the email of the user who signed in 
      // the user that is signed in, has provider of google 

      // CASE: the user wants to create a account with us through google 
      // the user has been created 
      // create the user
      // the user does not have an account with gp
      // check if the user hsa an account with gp by using their email 

      // CASE: the user wants to sign in
      // return true to proceed with the authentication process
      // the user has account with gp 
      try {
        await connectToMongodb();

        const dbUser = await getUserByEmail(user.email);

        if (!dbUser && (account.provider === 'google')) {
          const { wasSuccessful } = await createUser(user.email, null, 'google', ['user']);

          console.log('"wasSuccessful" in creating the db user with a google account: ', wasSuccessful);

          return wasSuccessful ? true : 'user-creation-error';
        }

        if (dbUser.provider !== account.provider) {
          return 'email-provider-mismatch';
        }

        console.log('the user already exist.');

        return true;
      } catch (error) {
        console.error('An error has occurred, couldn\'t sign in the target user.');

        return 'sign-in-error';
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