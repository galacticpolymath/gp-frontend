import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { JWT } from 'google-auth-library';

export const signJwt = async ({ email, roles, name }, secret, expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60) => {
  const issueAtTime = Math.floor(Date.now() / 1000); // issued at time

  return new SignJWT({ email, roles, name })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expirationTime)
    .setIssuedAt(issueAtTime)
    .setJti(nanoid())
    .sign(new TextEncoder().encode(secret));
};

export const getGoogleAuthJwt = (keyFile, scopes) => {
  const serviceAccountJwt = new JWT({ keyFile: keyFile, scopes: scopes });

  return serviceAccountJwt;
};