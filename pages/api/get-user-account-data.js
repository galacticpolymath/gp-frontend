/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */

import { getUserByEmail } from "../../backend/services/userServices";
import { CustomError } from "../../backend/utils/errors";

/**
 * @param {{ query: { email: string } }} request
*/
export default async function handler(request, response) {
    try {
        if (!request?.query?.email || (typeof request?.query?.email !== 'string')) {
            throw new CustomError("The 'email' of the email is not present in the params of the request. ", 400);
        }

        const dbUserAboutUserForm = await getUserByEmail(request.query.email, {
            gradesOrYears: 1,
            reasonsForSiteVisit: 1,
            subjects: 1,
            classroomSize: 1,
            country: 1,
            zipCode: 1,
            occupation: 1,
            isTeacher: 1,
            name: 1,
            _id: 0,
        });

        if (!dbUserAboutUserForm) {
            throw new CustomError("User not found.", 404);
        }

        return response.status(200).json(dbUserAboutUserForm);
    } catch (error) {
        const { code, message } = error ?? {};

        console.error('Failed to get the "About User" form for the target user. Reason: ', error);

        return response.status(code ?? 500).json({ msg: `Error message: ${message ?? 'An error has occurred on the server.'}` });

    }

}