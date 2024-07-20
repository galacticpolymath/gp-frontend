/* eslint-disable no-console */
/* eslint-disable indent */
import { createDocument } from '../db/utils';
import User from '../models/user';
import { v4 as uuidv4 } from 'uuid';

export const getUsers = async (queryObj = {}, projectionObj = {}) => {
    try {
        const users = await User.find(queryObj, projectionObj).lean();

        return users;
    } catch (error) {
        console.error('An error has occurred in getting the target users: ', error);

        return null;
    }

};

export const getUserByEmail = async (email = '') => {
    try {
        /** @typedef {import('../models/user.js').UserSchema} UserSchema */
        /** @type {UserSchema} */
        const targetUser = await User.findOne({ email: email }).lean();

        return targetUser;
    } catch (error) {
        console.error('Failed to receive the target user via email. Reason: ', error);

        return null;
    }
};

/**
 * Creates a database user.
 * @param {string} email
 * @param {string | null} password
 * @param {"google" | "credentials"} provider
 * @param {string[]} roles "dbAdmin" | "user"
 * @return { Promise<{ wasSuccessful: boolean, msg?: string }> }
 * */
export const createUser = async (email, password, provider, roles) => {
    try {
        const userDocument = createDocument({
            _id: uuidv4(),
            email: email,
            password: password,
            provider: provider,
            roles: roles,
        }, User);

        await userDocument.save();

        return { wasSuccessful: true };
    } catch (error) {
        const errMsg = `Failed to create the target user into the db. Reason: ${error}`;

        console.error(errMsg);

        return { wasSuccessful: false, msg: errMsg };
    }
};