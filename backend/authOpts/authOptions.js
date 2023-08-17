import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';
import getCanUserWriteToDb from '../services/dbAuthService';
import { SignJWT, jwtVerify } from 'jose'

const getTokenVerificationResult = async token => {
    try {

        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

        console.log('payload: ', payload)
        // run some checks on the returned payload, perhaps you expect some specific values
        
        // if its all good, return it, or perhaps just return a boolean
        return { wasSuccessful: true, userCredentials: payload };
    } catch(error){

        return { wasSuccessful: false, msg: `An error has occurred in validating jwt. Error message: ${error}.` };
    }
}

export const signJwt = async (payload, secret) => {
  const issueAtTime = Date.now() / 1000 // issued at time
  const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours

  return new SignJWT({ payload: payload })
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
        const { email, name } = token;
        const canUserWriteToDb = await getCanUserWriteToDb(email);
        const allowedRoles = canUserWriteToDb ? ['user', 'dbAdmin'] : ['user'];
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
        const encodedToken = await signJwt({ email, roles: allowedRoles, name }, secret);
        console.log('encodedToken: ', encodedToken)
        const decodedToken = await jwtVerify(encodedToken, new TextEncoder().encode(secret));

        console.log('decodedToken: ', decodedToken)

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