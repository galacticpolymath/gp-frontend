import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

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
    secret: process.env.AUTH_CLIENT_SECRET,
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 60 * 60 * 24 * 30,
        encryption: true,
    },
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            console.log("jwt token: ", token)

            if (account?.accessToken) {
                token.accessToken = account.accessToken;
            }


            return token;
        },
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token from a provider.
            console.log("session token: ", token)
            session.accessToken = token.accessToken
            return session
        }
    }
}

export default NextAuth(authOptions)