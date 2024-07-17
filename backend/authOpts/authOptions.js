/* eslint-disable no-console */
import GoogleProvider from 'next-auth/providers/google';
import getCanUserWriteToDb from '../services/dbAuthService';
import { jwtVerify } from 'jose';
import JwtModel from '../models/Jwt';
import { connectToMongodb, createConnectionUri } from '../utils/connection';
import { signJwt } from '../utils/auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';

let isMongoDbClientConnectedToDb = false;

const getDbClientConnectionPromise = () => {
  console.log('isMongoDbClientConnectedToDb: ', isMongoDbClientConnectedToDb);
  if (isMongoDbClientConnectedToDb) {
    console.log('MongoClient is already connected.');
    return;
  }

  const connectionUri = createConnectionUri();
  const client = new MongoClient(connectionUri);
  isMongoDbClientConnectedToDb = true;

  console.log('will connect from MongoClient...');

  return client.connect();
};

let adapter = MongoDBAdapter(getDbClientConnectionPromise());
adapter = {
  ...adapter,
  async createUser(user) {
    console.log('new user created: ', user);

    if (user.email) {
      return {
        email: user.email,
        name: user.name,
        image: user.image,
      };
    }

    return undefined;
  },
};

/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
  adapter: adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
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
    async jwt({ token, user }) {
      const isUserSignedIn = !!user;

      if (isUserSignedIn) {
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
    async redirect({ url }) {
      const urlObj = new URL(url);

      return Promise.resolve(`${urlObj.origin}/auth-result`);
    },
  },
};