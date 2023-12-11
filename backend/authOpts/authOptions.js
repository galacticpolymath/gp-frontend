import GoogleProvider from 'next-auth/providers/google';
import getCanUserWriteToDb from '../services/dbAuthService';
import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import JwtModel from '../models/Jwt';
import { connectToMongodb } from '../utils/connection';
import { getServerSession } from 'next-auth'

// expirationTime = 24 hours by default 
const signJwt = async ({ email, roles, name }, secret, expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60) => {
  const issueAtTime = Date.now() / 1000; // issued at time
  
  return new SignJWT({ email, roles, name })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expirationTime)
    .setIssuedAt(issueAtTime)
    .setJti(nanoid())
    .sign(new TextEncoder().encode(secret));
};

export const authOptions = {
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
        const canUserWriteToDb = await getCanUserWriteToDb(email);
        const allowedRoles = canUserWriteToDb ? ['user', 'dbAdmin'] : ['user'];
        const refreshToken = await signJwt({ email: email, roles: allowedRoles, name: name }, secret, "1 day");
        const accessToken = await signJwt({ email: email, roles: allowedRoles, name: name }, secret, "12hr");

        if (!token?.payload) {
          await connectToMongodb();
          const jwt = new JwtModel({ _id: email, access: accessToken, refresh: refreshToken });
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
      const { email, roles, name } = token.payload;
      const accessToken = await signJwt({ email: email, roles: roles, name: name }, process.env.NEXTAUTH_SECRET, "12hours");
      const refreshToken = await signJwt({ email: email, roles: roles, name: name }, process.env.NEXTAUTH_SECRET, "1 day");
      session.id = token.id;
      session.token = accessToken;
      session.refresh = refreshToken;

      return Promise.resolve(session);
    },
    async redirect({ url }) {
      const urlObj = new URL(url);

      return Promise.resolve(`${urlObj.origin}/auth-result`);
    },
  },
};