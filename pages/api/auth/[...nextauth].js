import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_CLIENT_ID,
            clientSecret: process.env.AUTH_CLIENT_SECRET,

        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            return token
        }
    }
}

export default NextAuth(authOptions)