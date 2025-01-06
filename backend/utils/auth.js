import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { JWT } from 'google-auth-library';

/**
 * Creates a json web token.
 * @param {{ email?: string, role?: string[], name?: string, emailConfirmationId?: string }} jwtPayload 
 * @param {string | Buffer} secret 
 * @param {string | number} expirationTime 
 * @returns {SignJWT}
 */
export const signJwt = async (
  jwtPayload,
  secret,
  expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60
) => {
  const issueAtTime = Math.floor(Date.now() / 1000); // issued at tim

  return new SignJWT(jwtPayload)
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