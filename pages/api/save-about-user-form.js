/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable no-empty */
/* eslint-disable indent */

import { cache } from "../../backend/authOpts/authOptions";
import { getUserByEmail, updateUser } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";
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
        const aboutUserFormKeyVals = Object.entries(aboutUserForm);

        if (!aboutUserFormKeyVals?.length) {
            throw new CustomError("The 'aboutUser' form is empty or has falsey values");
        }

        const { wasSuccessful: isDbConnected } = await connectToMongodb();

        if (!isDbConnected) {
            throw new CustomError("Failed to connect to the database.", 500);
        }

        const doesUserExist = !!(await getUserByEmail(userEmail));

        if (!doesUserExist) {
            throw new CustomError("The user email does not exist in the database.", 404);
        }

        /** 
         * @type {import("../../providers/UserProvider").TAboutUserForm}
        */
        const updatedUserProperties = aboutUserFormKeyVals.reduce((accumObj, [key, val]) => {
            const accumObjUpdated = {
                ...accumObj,
                [key]: val,
            };

            return accumObjUpdated;
        }, {});


        const { wasSuccessful, updatedUser, errMsg } = await updateUser({ email: userEmail }, updatedUserProperties) ?? {};

        if (!wasSuccessful) {
            throw new CustomError(errMsg, 500);
        }

        delete updatedUser.password;

        console.log('will update the cache for the target user, about user form modal has been update: ', updatedUser);
        console.log('user email: ', userEmail);

        cache.set(userEmail, updatedUser);

        return response.status(200).json({ msg: "Successfully saved the 'aboutUser' form into the db." });
    } catch (error) {
        const { message, code } = error ?? {};
        console.error('Failed to save the "AboutUser" form. Reason: ', error);

        return response.status(code).json({ msg: message });
    }
}