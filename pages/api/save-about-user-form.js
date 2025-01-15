/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable no-empty */
/* eslint-disable indent */

import { cache } from "../../backend/authOpts/authOptions";
import { getUserByEmail, updateUser } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import { getJwtPayloadPromise } from "../../nondependencyFns";

/**
 * @typedef {Object} ReqBody
 * @property {import("../../providers/UserProvider").TUserForm} aboutUserForm 
 */

/**
 * Will save the 'AboutUser' form for the the target user. Must be a 'PUT' request.
 * @param {{ body: ReqBody }} request
 * */
export default async function handler(request, response) {
    try {
        if (typeof request.headers?.authorization !== 'string') {
            throw new Error("'authorization' header is not present in the request.");
        }

        const payload = await getJwtPayloadPromise(request.headers.authorization);
        console.log("hey there payload: ", payload);
        
        if (!payload) {
            throw new Error(
              "The 'authorization' header is not present in the request."
            );
        }


        if (!request.body || (request.body && (typeof request.body !== 'object') || Array.isArray(request.body))) {
            throw new CustomError("Received either a incorrect data type for the body of the request or its value is falsey.");
        }

        if (Object.keys(request.body).length <= 0) {
            throw new CustomError("The request body is empty. Must include the 'aboutUserForm' and the email of the client user.", 404);
        }

        if (!('aboutUserForm' in request.body)) {
            throw new CustomError("Missing the 'aboutUser' field in the body of the request.", 404);
        }

        if (!request.body.aboutUserForm || typeof request.body.aboutUserForm !== 'object' || Array.isArray(request.body.aboutUserForm)) {
            throw new CustomError("Incorrect data type for the 'aboutUserForm' field.", 400);
        }

        if (!Object.values(request.body.aboutUserForm).length) {
            throw new CustomError("Received a empty object for the 'aboutUserForm' field.", 400);
        }

        const { aboutUserForm } = request.body;
        const aboutUserFormKeyVals = Object.entries(aboutUserForm);

        if (!aboutUserFormKeyVals?.length) {
            throw new CustomError("The 'aboutUser' form is empty or has falsey values");
        }

        const { wasSuccessful: isDbConnected } = await connectToMongodb(
            15_000,
            0,
            true,
            true,
        );

        if (!isDbConnected) {
            throw new CustomError('Failed to connect to the database.', 500);
        }

        const doesUserExist = !!(await getUserByEmail(payload.payload.email));

        if (!doesUserExist) {
            throw new CustomError('The user email does not exist in the database.', 404);
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

        const { wasSuccessful, updatedUser, errMsg } = await updateUser({ email: payload.payload.email }, updatedUserProperties) ?? {};

        if (!wasSuccessful) {
            throw new CustomError(errMsg, 500);
        }

        delete updatedUser.password;

        cache.set(payload.payload.email, updatedUser);

        return response.status(200).json({ msg: "Successfully saved the 'aboutUser' form into the db." });
    } catch (error) {
        const { message, code } = error ?? {};
        console.error('Failed to save the "AboutUser" form. Reason: ', error);

        return response.status(code).json({ msg: message });
    }
}