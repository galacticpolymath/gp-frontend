import NextAuth from 'next-auth/next';
import { authOptions } from '../../../backend/authOpts/authOptions';

export const config = {
  maxDuration: 40,
};

export default NextAuth(authOptions);
