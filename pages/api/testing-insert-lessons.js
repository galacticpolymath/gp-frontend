import { decode } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    const token = req.headers.authorization.split(" ")[1].trim()
    const decodedToken = jwt.decode(token);


    return res.status(200).json({ message: "test!" })
}
