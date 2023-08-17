import GoogleProvider from 'next-auth/providers/google';
import getCanUserWriteToDb from '../services/dbAuthService';
import { SignJWT, jwtVerify } from 'jose'


const signJwt = async (payload, secret) => {
  const issueAtTime = Date.now() / 1000 // issued at time
  const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expirationTime)
    .setIssuedAt(issueAtTime)
    .setNotBefore(issueAtTime)
    .sign(new TextEncoder().encode(secret));
}

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
        const encodedToken = await signJwt({ email: email, roles: allowedRoles, name: name }, secret);

        return encodedToken;
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
      const encodedToken = await signJwt({ email: email, roles: roles, name: name }, process.env.NEXTAUTH_SECRET);
      session.id = token.id;
      session.token = encodedToken;

      return Promise.resolve(session);
    },
    async redirect({ url }) {
      const urlObj = new URL(url);

      return Promise.resolve(`${urlObj.origin}/auth-result`);
    },
  },
};