import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_CLIENT_ID,
            clientSecret: process.env.AUTH_CLIENT_SECRET,

        }),
    ],
    session: {
        strategy: "jwt"
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