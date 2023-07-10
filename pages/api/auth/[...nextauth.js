import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';
import Users from '../../../backend/models/user';
import { connectToMongodb } from '../../../backend/utils/connection';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
    }),
  ],
  authorizationUrl:
    'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code',
  scope:
    'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube.readonly',
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    encode: async ({ secret, token }) => {
      try {
        await connectToMongodb();
        const { email, name } = token;
        const user = await Users.findOne({ _id: email }).lean();
        let allowedRoles = ['user'];

        if (user) {
          allowedRoles = [...allowedRoles, ...user.roles.map(({ role }) => role)];
          allowedRoles = [...new Set(allowedRoles)];
        }

        const jwtClaims = {
          sub: email,
          name,
          email,
          iat: Date.now() / 1000,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
          claims: {
            allowedRoles,
            defaultRole: 'user',
            role: allowedRoles.find((role) => role === 'dbAdmin') ?? 'user',
            userId: email,
          },
        };
        const encodedToken = jwt.sign(jwtClaims, secret, { algorithm: 'HS256' });

        return encodedToken;
      } catch (error) {
        throw new Error('Unable to generate JWT.');
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

export default NextAuth(authOptions);
