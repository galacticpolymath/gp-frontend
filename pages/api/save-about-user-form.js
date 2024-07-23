/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable no-empty */
/* eslint-disable indent */

import { getUserByEmail, updateUser } from "../../backend/services/userServices";
import { CustomError } from "../../backend/utils/errors";

/**
 * @typedef {Object} ReqBody
 * @property {string} userEmail
 * @property {import("../../providers/UserProvider").TUserForm} aboutUserForm 
 */

/**
 * Will save the 'AboutUser' form for the the target user. Must be a 'PUT' request.
 * @param {{ body: ReqBody }} request
 * */
export default async function handler(request, response) {
    try {
        console.log('saving the about user form: ', request.body);
        if (!request.body || (request.body && (typeof request.body !== 'object') || Array.isArray(request.body))) {
            throw new CustomError("Received either a incorrect data type for the body of the request or its value is falsey.");
        }

        if (Object.keys(request.body).length <= 0) {
            throw new CustomError("The request body is empty. Must include the 'aboutUserForm' and the email of the client user.", 404);
        }

        if (!('aboutUserForm' in request.body)) {
            throw new CustomError("Missing the 'aboutUser' field in the body of the request.", 404);
        }

        if (!('userEmail' in request.body) || (typeof request.body.userEmail !== 'string')) {
            throw new CustomError("Missing the 'email' field in the body of the request or the data type is incorrect.", 404);
        }

        if (!request.body.aboutUserForm || typeof request.body.aboutUserForm !== 'object' || Array.isArray(request.body.aboutUserForm)) {
            throw new CustomError("Incorrect data type for the 'aboutUserForm' field.", 400);
        }

        if (!Object.values(request.body.aboutUserForm).length) {
            throw new CustomError("Received a empty object for the 'aboutUserForm' field.", 400);
        }

        const { userEmail, aboutUserForm } = request.body;
        const doesUserExist = !!(await getUserByEmail(userEmail));

        if (!doesUserExist) {
            throw new CustomError("The user email does not exist in the database.", 404);
        }

        const aboutUserFormFalseyValsFiltered = Object.entries(aboutUserForm)
            .filter(([, val]) => {
                if(val && typeof val === 'object'){
                    return Object.keys(val).length > 0;
                }

                return val;
            });

        if (!aboutUserFormFalseyValsFiltered?.length) {
            throw new CustomError("The 'aboutUser' form is empty or has falsey values");
        }

        /** @type {import("../../providers/UserProvider").TUserForm} */
        const updatedUserProperties = aboutUserFormFalseyValsFiltered.reduce((accumObj, keyAndVal) => {
            const [key, val] = keyAndVal;
            const accumObjUpdated = {
                ...accumObj,
                [key]: val,
            };

            return accumObjUpdated;
        }, {});
        const udpateUserResult = await updateUser({ email: userEmail }, updatedUserProperties);

        console.log('udpateUserResult: ', udpateUserResult);

        if(!udpateUserResult.wasSuccessful){
            throw new CustomError(udpateUserResult.errMsg, 500);
        }

        return response.status(200).json({ msg: "Successfully saved the 'aboutUser' form into the db." });
    } catch (error) {
        const { message, code } = error ?? {};
        console.error('Failed to save the "AboutUser" form. Reason: ', error);

        return response.status(code).json({ msg: message });
    }
}