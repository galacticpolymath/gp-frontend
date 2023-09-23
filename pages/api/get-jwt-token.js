import JwtModel from "../../backend/models/Jwt";
import getCanUserWriteToDb from "../../backend/services/dbAuthService";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";

export default async function handler(request, response) {
    try {
        const canUserWriteToDb = await getCanUserWriteToDb(request.body.email);

        if(!canUserWriteToDb){
            throw new CustomError('You are not authorized to access this service.', 403)
        }

        await connectToMongodb();

        console.log('getting jwtDoc...')

        const jwtDoc = await JwtModel.findOne({ _id: request.body.email }).lean();

        if (!jwtDoc) {
            return response.status(404).json({
                msg: 'There is no jwtToken for this email. You may have received it already or the jwt storage has expired.'
            });
        };

        await JwtModel.deleteOne({ _id: request.body.email })

        return response.status(200).json({ jwt: jwtDoc.jwt });
    } catch (error) {
        console.error('error message, get jwt token: ', error)

        return response.status(500).json({ msg: 'Internal server error.' });
    }
}