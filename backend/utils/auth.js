import { SignJWT } from 'jose';
import { v4 } from 'uuid';
import { JWT } from 'google-auth-library';

/**
 * Creates a JSON Web Token.
 * @param {{ email?: string, role?: string[], name?: string, emailConfirmationId?: string, accessibleRoutes?: string[], userId: string }} jwtPayload
 * @param {string | Buffer} secret
 * @param {string | number} expirationTime
 * @returns {Promise<string>}
 */
const signJwt = async (
  jwtPayload,
  secret,
  expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60
) => {
  const issueAtTime = Math.floor(Date.now() / 1000); // issued at time

  return new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expirationTime)
    .setIssuedAt(issueAtTime)
    .setJti(v4())
    .sign(new TextEncoder().encode(secret));
};

/**
 * Generates a Google Auth JWT.
 * @param {string} keyFile - Path to the service account key file.
 * @param {string[]} scopes - Scopes required for the JWT.
 * @returns {JWT}
 */
const getGoogleAuthJwt = (keyFile, scopes) => {
  const serviceAccountJwt = new JWT({ keyFile: keyFile, scopes: scopes });
  return serviceAccountJwt;
};

const createGoogleAuthJwt = () => {
  return new JWT({
    scopes: ['https://www.googleapis.com/auth/drive'],
    email: 'gdrive-worker@gp-frontend-391915.iam.gserviceaccount.com',
    keyId: '8dc9a39284181bf8e9b820fc177dc3e470be1a95',
    key: process.env.GDRIVE_WORKER_KEY,
  });
};

export { getGoogleAuthJwt, signJwt, createGoogleAuthJwt };
