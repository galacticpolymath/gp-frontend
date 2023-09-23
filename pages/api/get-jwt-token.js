import JwtModel from "../../backend/models/Jwt";
import { connectToMongodb } from "../../backend/utils/connection";

export default async function handler(request, response) {
    try {
        if (request.method !== 'POST') {
            return response.status(404).json({ msg: 'This route only accepts POST requests.' });
        }

        if (!("email" in request.body)) {
            return response.status(400).json({ msg: 'Must provide an email in the body of the request.' });
        }

        await connectToMongodb();

        const jwtDoc = await JwtModel.findOne({ _id: request.body.email }).lean();

        if (!jwtDoc) {
            return response.status(404).json({
                msg: 'There is no jwtToken for this email. You may have received it already or the jwt storage has expired.'
            });
        };

        return response.status(200).json({ jwt: jwtDoc.jwt });
    } catch (error) {
        console.error('error message, get jwt token: ', error)

        return response.status(500).json({ msg: 'Internal server error.' });
    }
}