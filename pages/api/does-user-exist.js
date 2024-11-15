/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
import { getUserByEmail } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";

export default async function handler(request, response) {
    try {
        if (!request?.query?.email || (typeof request?.query?.email !== 'string')) {
            throw new CustomError("The 'email' param is not present in the url of the request. ", 400);
        }

        await connectToMongodb();

        const doesUserExist = !!(await getUserByEmail(request.query.email, { _id: 1 }));

        return response.status(200).json({ doesUserExist });
    } catch (error) {
        const { code, message } = error ?? {};
        console.error('An error has occurred: ', error);

        return response.status(code ?? 500).json({ msg: message ?? `SERVER ERROR: ${error}` });
    }
}