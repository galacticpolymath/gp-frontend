import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import jwt from "jsonwebtoken"
import { redirect } from "next/dist/server/api-utils";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_CLIENT_ID,
            clientSecret: process.env.AUTH_CLIENT_SECRET,
        }),
        CredentialsProvider({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { label: "Email", type: "text", placeholder: "Enter email" },
                password: { label: "Password", type: "password", placeholder: "Enter password" }
            },
            async authorize(credentials, req) {
                // You need to provide your own logic here that takes the credentials
                // submitted and returns either a object representing a user or value
                // that is false/null if the credentials are invalid.
                // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
                // You can also use the `req` object to obtain additional parameters
                // (i.e., the request IP address)
                const res = await fetch("/your/endpoint", {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                })
                const user = await res.json()

                // If no error and we have user data, return it
                if (res.ok && user) {
                    return user
                }
                // Return null if user data could not be retrieved
                return null
            }
        })
    ],
    authorizationUrl:
        'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code',
    scope:
        'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube.readonly',
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        encode: async ({ secret, token }) => {
            const jwtClaims = {
                "sub": token.email,
                "name": token.name,
                "email": token.email,
                "iat": Date.now() / 1000,
                "exp": Math.floor(Date.now() / 1000) + (24 * 60 * 60),
                "https://hasura.io/jwt/claims": {
                    "x-hasura-allowed-roles": ["user"],
                    "x-hasura-default-role": "user",
                    "x-hasura-role": "user",
                    "x-hasura-user-id": token.email,
                }
            };
            const encodedToken = jwt.sign(jwtClaims, secret, { algorithm: 'HS256' });

            return encodedToken;
        },
        decode: async ({ secret, token }) => {
            const decodedToken = jwt.verify(token, secret, { algorithms: ['HS256'] });
            return decodedToken;
        },
    },
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            const isUserSignedIn = !!user;
            console.log("user: ", user)
            console.log('token: ', token)

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

            return Promise.resolve(`${urlObj.origin}/auth-results`);
        }
    },

}

export default NextAuth(authOptions)