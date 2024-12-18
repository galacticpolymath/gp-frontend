/* eslint-disable no-console */
/* eslint-disable indent */
import { sleep } from "../../globalFns.js";
import { createDocument } from "../db/utils";
import User from "../models/user";
import { v4 as uuidv4 } from "uuid";

export const getUsers = async (queryObj = {}, projectionObj = {}) => {
    try {
        const users = await User.find(queryObj, projectionObj).lean();

        return users;
    } catch (error) {
        console.error("An error has occurred in getting the target users: ", error);

        return null;
    }
};

export const getUser = async (queryObj = {}, projectionObj = {}) => {
    try {
        /** @typedef {import('../models/user.js').UserSchema} UserSchema */
        /** @type {UserSchema} */
        const user = await User.findOne(queryObj, projectionObj)
            .maxTimeMS(7_000)
            .lean();

        return { user };
    } catch (error) {
        console.error("An error has occurred in getting the target user: ", error);
        console.log(error);
        const didTimeoutOccur = error?.error?.codeName === "MaxTimeMSExpired";

        return {
            errType: didTimeoutOccur ? "timeout" : "general",
        };
    }
};

/**
 * @description
 * Gets a user document from the database with a maximum timeout of 7 seconds.
 * If a timeout occurs, the function will retry up to 3 times before returning an error.
 * @param {object} queryObj - The query object to find the target user.
 * @param {object} projectionObj - The projection object to select the properties of the target user.
 * @param {number} tries - The number of times the function has been retried.
 * @returns {Promise<{user: UserSchema} | {errType: 'timeout' | 'general'}>}
 */
export const getUserWithRetries = async (
    queryObj = {},
    projectionObj = {},
    tries = 1
) => {
    try {
        console.log('retrieving user...');
        console.log("Current try: ", tries);
        /** @typedef {import('../models/user.js').UserSchema} UserSchema */
        /** @type {UserSchema} */
        const user = await User.findOne(queryObj, projectionObj)
            .maxTimeMS(5_500)
            .lean();

        return { user };
    } catch (error) {
        console.log("Failed to get the target user.");
        if (tries <= 3) {
            console.log("Will try again.");
            tries += 1;
            const randomNumMs =
                Math.floor(Math.random() * (5_500 - 1000 + 1)) + 1000;
            const waitTime = randomNumMs + (tries * 1_000);

            await sleep(waitTime);

            return getUserWithRetries(queryObj, projectionObj, tries);
        }

        const didTimeoutOccur = error?.error?.codeName === "MaxTimeMSExpired";

        console.error("An error has occurred in getting the target user: ", error);
        console.log(error);

        return {
            errType: didTimeoutOccur ? "timeout" : "general",
        };
    }
};

export const getUserByEmail = async (email = "", projectionsObj = {}) => {
    try {
        /** @typedef {import('../models/user.js').UserSchema} UserSchema */
        /** @type {UserSchema} */
        const targetUser = await User.findOne(
            { email: email },
            projectionsObj
        ).lean();

        return targetUser;
    } catch (error) {
        console.error(
            "Failed to receive the target user via email. Reason: ",
            error
        );

        return null;
    }
};

export const updateUser = async (
    filterQuery = {},
    updatedUserProperties = {},
    updatedUserPropsToFilterOut = []
) => {
    try {
        if (updatedUserProperties.isTeacher === false) {
            updatedUserProperties = {
                ...updatedUserProperties,
                gradesOrYears: {
                    ageGroupsTaught: [],
                    selection: "",
                },
            };
        }
        /** @type {import('../models/user').TUserSchema} */
        const updatedUser = await User.findOneAndUpdate(
            filterQuery,
            updatedUserProperties,
            { new: true }
        ).lean();

        if (!updatedUser) {
            console.error(
                'The target user does not exist. Check "filterQuery" object.'
            );

            return { wasSuccessful: false };
        }

        if (updatedUserPropsToFilterOut.length) {
            const entries = Object.entries(updatedUser);

            const updateUserWithProjectedProps = entries.reduce(
                (updatedUserWithProjectedPropsAccum, [key, value]) => {
                    if (updatedUserPropsToFilterOut?.includes(key)) {
                        return updatedUserWithProjectedPropsAccum;
                    }

                    return {
                        ...updatedUserWithProjectedPropsAccum,
                        [key]: value,
                    };
                },
                {}
            );

            return { wasSuccessful: true, updatedUser: updateUserWithProjectedProps };
        }

        return { wasSuccessful: true, updatedUser };
    } catch (error) {
        const { message } = error;
        const errMsg =
            message ?? `The target user failed to be updated. Reason: ${error}`;

        console.log(errMsg);

        return { wasSuccessful: false, errMsg };
    }
};

export const deleteUser = async (query = {}) => {
    try {
        if (
            !query ||
            Object.keys(query).length === 0 ||
            (query && typeof query !== "object") ||
            Array.isArray(query)
        ) {
            throw new Error(
                '"query" must be a non-array object. The "query" argument cannot be an empty object.'
            );
        }

        await User.deleteOne(query);

        return { wasSuccessful: true };
    } catch (error) {
        console.error("Failed to delete the target user. Reason: ", error);

        return { wasSuccessful: false };
    }
};

export const deleteUserById = async (userId) => {
    try {
        await User.deleteOne({ _id: userId });

        return { wasSuccessful: true };
    } catch (error) {
        console.error("The target user failed to be updated. Reason: ", error);

        return { wasSuccessful: false };
    }
};

export const deleteUserByEmail = async (email) => {
    try {
        await User.deleteOne({ email: email });

        return { wasSuccessful: true };
    } catch (error) {
        console.error("The target user failed to be updated. Reason: ", error);

        return { wasSuccessful: false };
    }
};

/**
 * Creates a database user.
 * @param {string} email
 * @param {string | null} password
 * @param {string} providerAccountId
 * @param {"google" | "credentials"} provider
 * @param {string[]} roles "dbAdmin" | "user"
 * @param {{ first: string, last: string }} [name]
 * */
export const createUser = async (
    email,
    password,
    provider,
    roles,
    providerAccountId,
    name
) => {
    try {
        const userDocument = createDocument(
            {
                _id: uuidv4(),
                providerAccountId,
                email: email,
                password: password,
                provider: provider,
                roles: roles,
                name: name,
            },
            User
        );

        await userDocument.save();

        return { wasSuccessful: true, createdUser: userDocument };
    } catch (error) {
        const errMsg = `Failed to create the target user into the db. Reason: ${error}`;

        console.error(errMsg);

        return { wasSuccessful: false, msg: errMsg };
    }
};
