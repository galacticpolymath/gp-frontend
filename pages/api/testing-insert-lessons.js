import { decode } from "next-auth/jwt";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
    const session = await decode({ req: req, secret: process.env.NEXTAUTH_SECRET })

    console.log("session: ", session)

    return res.status(200).json({ message: "test!" })
}
