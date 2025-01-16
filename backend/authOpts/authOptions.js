/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import getCanUserWriteToDb from '../services/dbAuthService';
import { jwtVerify } from 'jose';
import JwtModel from '../models/Jwt';
import { connectToMongodb } from '../utils/connection';
import { signJwt } from '../utils/auth';
import { createIterations, createSalt, getIsPasswordCorrect, hashPassword } from '../utils/security';
import User from '../models/user';
import { createDocument } from '../db/utils';
import { AuthError, CustomError, SignInError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { createUser, deleteUser, getUser, getUserByEmail, getUserWithRetries, updateUser } from '../services/userServices';
import NodeCache from 'node-cache';
import { addUserToEmailList } from '../services/emailServices';

const VALID_FORMS = ['createAccount', 'login'];
export const cache = new NodeCache({ stdTTL: 100 });

/** @return { import("next-auth/adapters").Adapter } */
export default function MyAdapter() {
  return {
    async createUser(user) {
      return;
    },
    async getUser(id) {
      return;
    },
    async getUserByEmail(email) {
      console.log('getUserByEmail: ', email);
      return;
    },
    async getUserByAccount(param) {
      const { provider, providerAccountId } = param;
      let isCreatingUser = false;

      try {
        const { wasSuccessful } = await connectToMongodb(7_000);

        if (!wasSuccessful) {
          return {
            errType: "timeout",
            code: 504
          };
        }

        const { user, errType } = await getUserWithRetries({ providerAccountId: providerAccountId }, {});

        if (errType === "timeout") {
          return {
            errType,
            code: 504
          };
        }


        if (!user) {
          isCreatingUser = true;
          const { wasSuccessful, msg } = await createUser(
            'PLACEHOLDER',
            null,
            provider,
            ['user'],
            providerAccountId,
            null,
          );

          if (!wasSuccessful) {
            console.error('Failed to create the target user...');
            throw new CustomError(`Failed to create the document for the target user in the db. Reason: ${msg}`, 500, 'userCreationFailure', 'user-creation-err', true);
          }

          console.log('the google user was created...');

          return { providerAccountId, provider, wasUserCreated: true };
        }

        return { providerAccountId, provider, email: user.email, id: user._id, image: user.picture, name: user.name };
      } catch (error) {
        const { message, code, type, urlErrorParamKey, urlErrorParamVal } = error ?? {};

        if (isCreatingUser) {
          console.log('will delete user...');

          await deleteUser({ providerAccountId: providerAccountId });
        }

        return {
          errType: type,
          code,
          msg: message ?? 'Failed to retrieve the target user from google.',
          urlErrorParamKey,
          urlErrorParamVal,
        };
      }
    },
    async updateUser(user) {
      console.log('updateUser: ', user);
      return;
    },
    async deleteUser(userId) {
      console.log(userId);
      return;
    },
    async linkAccount(account) {
      console.log('linkAccount: ', account);
      return;
    },
    async unlinkAccount({ providerAccountId, provider }) {
      console.log('unlinkAccount, params: ', { providerAccountId, provider });
      return;
    },
    async createSession(params) {
      console.log('createSession: ', params);
      return;
    },
    async getSessionAndUser(sessionToken) {
      console.log('getSessionAndUser: ', sessionToken);
      return;
    },
    async updateSession(params) {
      console.log('updateSession: ', params);
      return;
    },
    async deleteSession(sessionToken) {
      console.log('deleteSession: ', sessionToken);

      return;
    },
    async createVerificationToken(params) {
      console.log('createVerificationToken: ', params);
      return;
    },
    async useVerificationToken(params) {
      console.log('useVerificationToken: ', params);
      return;
    },
  };
}

/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
  adapter: MyAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
    }),
    CredentialsProvider({
      async authorize(credentials) {
        try {
          if (
            !credentials.formType ||
            !credentials.email ||
            !credentials.password ||
            !VALID_FORMS.includes(credentials.formType)
          ) {
            throw new AuthError('invalidForm', 500);
          }

          await connectToMongodb(
            15_000,
            0,
            true,
            true
          );

          const {
            email,
            password,
            firstName,
            lastName,
            formType,
            isOnMailingList,
            clientUrl,
          } = credentials;
          /** @type { import('../models/user').TUserSchema } */
          const dbUser = await getUserByEmail(email);
          const callbackUrl = credentials.callbackUrl.includes('?') ? credentials.callbackUrl.split('?')[0] : credentials.callbackUrl;

          if (!dbUser && (formType === 'login')) {
            console.log('The user was not found.');

            throw new AuthError('userNotFound', 404, callbackUrl ?? '');
          }

          if (dbUser && !dbUser?.password && (formType === 'login')) {
            console.log('The user has "google" for their credentials.');

            throw new AuthError('dbUserDoesNotHaveCredentialsProvider', 401, callbackUrl ?? '');
          }

          if (dbUser && (formType === 'createAccount')) {
            const urlErrParamVal = dbUser.provider === 'google' ? 'duplicate-user-with-google' : 'duplicate-user-with-creds';

            throw new AuthError('userAlreadyExist', 409, callbackUrl ?? '', 'user-account-creation-err-type', urlErrParamVal);
          }

          console.log('If user is logging in, will check if the password is correct.');

          const { iterations, salt, hash: hashedPasswordFromDb } = dbUser?.password ?? {};

          if ((formType === 'login') && !getIsPasswordCorrect({ iterations, salt, password }, hashedPasswordFromDb)) {
            console.log('Invalid credentials.');

            throw new AuthError('invalidCredentials', 404, callbackUrl ?? '');
          }

          if ((formType === 'login') && getIsPasswordCorrect({ iterations, salt, password: password }, hashedPasswordFromDb)) {
            console.log('Password is correct, will log the user in.');

            return dbUser;
          }

          console.log('Creating the new user...');

          const hashedPassword = hashPassword(password, createSalt(), createIterations());
          const userDocumentToCreate = {
            _id: uuidv4(),
            email: email,
            password: hashedPassword,
            name: {
              first: firstName,
              last: lastName,
            },
            provider: 'credentials',
            roles: ['user'],
            totalSignIns: 1,
            lastSignIn: new Date(),
          };
          const newUserDoc = createDocument(userDocumentToCreate, User);

          if (!newUserDoc) {
            throw new AuthError('userCreationFailure', 500, callbackUrl ?? '');
          }

          const newUser = await newUserDoc.save();

          if (!newUser) {
            throw new AuthError('userCreationFailure', 500, callbackUrl ?? '');
          }

          let emailingListingConfrimationEmailMsg = null;
          if (isOnMailingList) {
            const { errMsg } = await addUserToEmailList(email, clientUrl || "");
            emailingListingConfrimationEmailMsg = errMsg;
          }

          if (emailingListingConfrimationEmailMsg) {
            console.error('Failed to send mailing list confirmation email. Reason: ', emailingListingConfrimationEmailMsg);
          }

          return { ...userDocumentToCreate, wasUserCreated: true };
        } catch (error) {
          console.log('error object: ', error);
          const { errType, code, redirectUrl, urlErrorParamKey, urlErrorParamVal } = error ?? {};

          if (!errType || !code) {
            return {
              errType: 'userAuthFailure',
              code: 500,
              urlErrorParamKey,
              urlErrorParamVal,
            };
          }

          return {
            errType,
            code,
            redirectUrl,
            urlErrorParamKey,
            urlErrorParamVal,
          };
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 30,
    encode: async (param) => {
      try {
        const { token, secret } = param;
        const { email, name, picture } = token?.payload ?? token;
        const canUserWriteToDb = await getCanUserWriteToDb(email);

        // get the user from the db, to get their first name last name, image
        const allowedRoles = canUserWriteToDb ? ['user', 'dbAdmin'] : ['user'];
        const refreshToken = await signJwt({ email, roles: allowedRoles, name, picture }, secret, '1 day');
        const accessToken = await signJwt({ email, roles: allowedRoles, name, picture }, secret, '12hr');

        if (!token?.payload && canUserWriteToDb) {
          console.log("will save jwt to db.");
          await connectToMongodb(
            15_000,
            0,
            true,
            true
          );
          const jwt = new JwtModel({ _id: email, access: accessToken, refresh: refreshToken });

          jwt.save();
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
    async signIn(param) {
      const { user, account, profile, credentials } = param;
      const {
        errType,
        code,
        email,
        providerAccountId,
        wasUserCreated,
        urlErrorParamKey,
        urlErrorParamVal,
      } = user ?? {};
      let userEmail = profile?.email ?? email;
      const { wasSuccessful: isDbConnected } = await connectToMongodb(
        15_000,
        0,
        true,
        true
      );

      console.log("Error type: ", errType)

      try {

        if (credentials && !userEmail) {
          userEmail = credentials.email;
        }

        if (errType === "timeout") {
          console.error('The server timed out.');
          throw new SignInError(
            'timeout-error',
            'The server timed out. Please try again.',
            code ?? 504,
            'timeout-error',
            true
          );
        }

        if (errType === 'dbUserDoesNotHaveCredentialsProvider') {
          throw new SignInError(
            'provider-mismatch-error',
            'The provider of the sign in method does not match with the provider stored in the database for the user.',
            code ?? 422
          );
        }

        if (errType === 'userCreationFailure') {
          throw new SignInError(
            'user-creation-error',
            'Failed to create the user in the DB.',
            code ?? 500,
            urlErrorParamKey ?? '',
            urlErrorParamVal ?? ''
          );
        }


        if (!isDbConnected) {
          throw new CustomError("Failed to connect to the database.", 500);
        }

        if (errType === "timeout") {
          console.error('The server timed out.');
          throw new SignInError(
            'timeout-error',
            'The server timed out. Please try again.',
            code ?? 504,
            'timeout-error',
            true
          );
        }

        const dbUser = userEmail ? await getUserByEmail(userEmail) : null;

        if ((errType === 'userAlreadyExist') || (dbUser && (typeof dbUser === "object") && wasUserCreated && (typeof providerAccountId === 'string'))) {
          console.log('creating an account with google, the user with the specific email  already exists, deleting the mongodb doc...');
          const urlErrorParamVal = dbUser.provider === 'google' ? 'duplicate-user-with-google' : 'duplicate-user-with-creds';

          await deleteUser({ providerAccountId });

          throw new SignInError(
            'duplicate-user',
            'This email has already been taken.',
            code ?? 422,
            'user-account-creation-err-type',
            urlErrorParamVal
          );
        }

        // Finish creating the google user account in the db.
        if (wasUserCreated && (account.provider === 'google') && !dbUser) {
          console.log('creating the target google user...');
          const { picture, given_name, family_name } = profile ?? {};
          const name = {
            first: given_name,
            last: family_name,
          };
          const { wasSuccessful } = await updateUser(
            {
              providerAccountId: providerAccountId,
            },
            {
              email: userEmail,
              picture: picture ?? '',
              name: name,
              totalSignIns: 1,
              lastSignIn: new Date(),
            }
          );

          if (!wasSuccessful) {
            await deleteUser({ providerAccountId: providerAccountId });

            throw new SignInError(
              'user-account-creation-with-google-err',
              'Failed to create the user who signed in with google.',
              500
            );
          }

          return true;
        }

        // sign the credentials based user in.
        if (wasUserCreated && (account.provider === 'credentials')) {
          return true;
        }

        if (!dbUser) {
          console.log('the user is not found in the db...');

          throw new SignInError(
            'user-not-found',
            'The target user is not found in the db.',
            404
          );
        }

        console.log('the user is found in the db...');

        return true;
      } catch (error) {
        const { type, urlErrorParamKey, urlErrorParamVal } = error ?? {};

        if (urlErrorParamKey && urlErrorParamVal) {
          return `/?${urlErrorParamKey}=${urlErrorParamVal}`;
        }

        if (type && param?.user?.redirectUrl) {
          return `${param.user.redirectUrl}/?signin-err-type=${type}`;
        }

        return param?.user?.redirectUrl ? `${param.user.redirectUrl}/?signin-err-type=${type ?? 'sign-in-error'}` : `/?signin-err-type=${type ?? 'sign-in-error'}`;
      } finally {
        if (!wasUserCreated && isDbConnected) {
          const dbUser = userEmail ? await getUserByEmail(userEmail) : null;

          if (!dbUser) {
            console.error("Unable to retrieve the target user from the db.");
          } else {
            const totalSignIns = typeof dbUser?.totalSignIns === 'number' ? dbUser.totalSignIns + 1 : 1;
            const { wasSuccessful } = await updateUser({ email: userEmail }, { totalSignIns, lastSignIn: new Date() });

            if (!wasSuccessful) {
              console.error('Failed to update the total sign ins for the user.');
            }
          }
        }
      }
    },
    async jwt(param) {
      const { token, user, profile } = param;
      const isUserSignedIn = !!user;

      if (isUserSignedIn && (user.id ?? user._id)) {
        token.id = user.id ?? user._id;
      }

      return Promise.resolve(token);
    },
    async session(param) {
      const { token, session } = param;
      /**
       * @type {{ email: string, roles: string[], name: { first: string, last: string }, picture: string }}
       */
      let { email, roles, name, picture } = token.payload;
      /** @type { import('../models/user').TUserSchema } */
      const targetUser = cache.get(email) ?? {};
      console.log('cached target user: ', targetUser);
      let isTeacher = false;
      let occupation = null;

      if (targetUser && targetUser.occupation && targetUser.name) {
        occupation = targetUser.occupation;
        name = targetUser.name;
        isTeacher = targetUser.isTeacher;
      } else {
        await connectToMongodb(
          15_000,
          0,
          true,
          true
        );

        const dbUser = await getUserByEmail(email);

        if (!dbUser) {
          return Promise.resolve(session);
        }

        occupation = dbUser.occupation ?? null;
        name = dbUser.name ?? name;
        isTeacher = dbUser.isTeacher;

        delete dbUser.password;

        cache.set(email, dbUser, 100);
      }
      const accessTokenPromise = signJwt(
        {
          email: email,
          roles: roles,
          name: name,
        },
        process.env.NEXTAUTH_SECRET,
        '12hours'
      );
      const refreshTokenPromise = signJwt({ email: email, roles: roles, name: name }, process.env.NEXTAUTH_SECRET, '1 day');
      const [accessToken, refreshToken] = await Promise.all([accessTokenPromise, refreshTokenPromise]);

      session.id = token.id;
      session.token = accessToken;
      session.refresh = refreshToken;
      session.user = {
        email: email,
        name: name,
        image: picture,
        isTeacher,
        occupation: occupation,
      };

      return Promise.resolve(session);
    },
    async redirect(param) {
      console.log('will redirect user to the following: ', param);

      const { url } = param;

      return url;
    },
  },
};