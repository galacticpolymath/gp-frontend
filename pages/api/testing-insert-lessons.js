import { getToken, decode } from "next-auth/jwt"


export default async function handler(req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await decode({ token: token, secret: process.env.NEXTAUTH_SECRET });

    console.log("decoded: ", decoded)

    return res.status(200).json({ message: "test!" })
}
