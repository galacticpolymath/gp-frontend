/* eslint-disable no-console */
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import getCanUserWriteToDb from '../services/dbAuthService';
import { jwtVerify } from 'jose';
import JwtModel from '../models/Jwt';
import { connectToMongodb } from '../utils/connection';
import { signJwt } from '../utils/auth';

// GOAL: 

/** @return { import("next-auth/adapters").Adapter } */
export default function MyAdapter(client, options = {}) {
  return {
    async createUser(user) {
      console.log('createUser, user: ', user);
      return user;
    },
    async getUser(id) {
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
      return;
    },
    async deleteUser(userId) {
      return;
    },
    async linkAccount(account) {
      return;
    },
    async unlinkAccount({ providerAccountId, provider }) {
      console.log('unlinkAccount, params: ', { providerAccountId, provider });
      return;
    },
    async createSession({ sessionToken, userId, expires }) {
      return;
    },
    async getSessionAndUser(sessionToken) {
      return;
    },
    async updateSession({ sessionToken }) {
      return;
    },
    async deleteSession(sessionToken) {
      return;
    },
    async createVerificationToken({ identifier, expires, token }) {
      return;
    },
    async useVerificationToken({ identifier, token }) {
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
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
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
    async signIn(params) {
      console.log('params, signin: ', params);

      return true;
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