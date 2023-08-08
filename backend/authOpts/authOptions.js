import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';
import getCanUserWriteToDb from '../services/dbAuthService';

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
        const { email, name } = token;
        const canUserWriteToDb = await getCanUserWriteToDb(email);
        let allowedRoles = canUserWriteToDb ? ['user', 'dbAdmin'] : ['user'];
        const jwtClaims = {
          sub: email,
          name,
          email,
          iat: Date.now() / 1000, // issued at time
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
          claims: {
            allowedRoles,
            defaultRole: 'user',
            role: allowedRoles.find(role => role === 'dbAdmin') ?? 'user',
            userId: email,
          },
        };
        const encodedToken = jwt.sign(jwtClaims, secret, { algorithm: 'HS256' });

        return encodedToken;
      } catch (error) {
        throw new Error('Unable to generate JWT. Error message: ', error);
      }
    },
    decode: async ({ secret, token }) => {
      const decodedToken = jwt.verify(token, secret, { algorithms: ['HS256'] });
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
      const encodedToken = jwt.sign(token, process.env.NEXTAUTH_SECRET, { algorithm: 'HS256' });
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