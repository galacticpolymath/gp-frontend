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
    jwt: {},
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {

            if (account) {
                token.accessToken = account.access_token
            }


            return token;
        },
        async session({ session, token, user }) {
            // send the access token to the client side, after the uesr is authenticated by using the 
            // the useSession hook on the client side
            session.accessToken = token.accessToken;
            return session
        }
    }
}

export default NextAuth(authOptions)