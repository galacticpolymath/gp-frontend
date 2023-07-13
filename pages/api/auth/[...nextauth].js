import NextAuth from 'next-auth/next';
import { authOptions } from '../../../backend/authOpts/authOptions';

export default NextAuth(authOptions);
