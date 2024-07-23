/* eslint-disable no-console */
/* eslint-disable indent */
import { createDocument } from '../db/utils';
import User from '../models/user';
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from '../utils/errors.js';

export const getUsers = async (queryObj = {}, projectionObj = {}) => {
    try {
        const users = await User.find(queryObj, projectionObj).lean();

        return users;
    } catch (error) {
        console.error('An error has occurred in getting the target users: ', error);

        return null;
    }

};

export const getUser = async (queryObj = {}, projectionObj = {}) => {
    try {
        /** @typedef {import('../models/user.js').UserSchema} UserSchema */
        /** @type {UserSchema} */
        const user = await User.findOne(queryObj, projectionObj).lean();

        return user;
    } catch (error) {
        console.error('An error has occurred in getting the target users: ', error);

        return null;
    }

};

export const getUserByEmail = async (email = '', projectionsObj = {}) => {
    try {
        /** @typedef {import('../models/user.js').UserSchema} UserSchema */
        /** @type {UserSchema} */
        const targetUser = await User.findOne({ email: email }, projectionsObj).lean();

        return targetUser;
    } catch (error) {
        console.error('Failed to receive the target user via email. Reason: ', error);

        return null;
    }
};

export const updateUser = async (filterQuery = {}, updatedProperties = {}) => {
    try {
        const result = await User.updateOne(filterQuery, updatedProperties);

        if(result.modifiedCount !== 1){
            throw new CustomError('When updating the target user, received a modified count not equal to 1. Check query or the update object argument.');
        }
        
        return { wasSuccessful: true };
    } catch (error) {
        const { msg } = error;
        const errMsg = msg ?? `The target user failed to be updated. Reason: ${error}`;

        console.log(errMsg);

        return { wasSuccessful: false, errMsg };
    }

};

export const deleteUser = async (filterQuery = {}) => {
    try {
        await User.deleteOne(filterQuery);

        return { wasSuccessful: true };
    } catch (error) {
        console.error('The target user failed to be updated. Reason: ', error);

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
export const createUser = async (email, password, provider, roles, providerAccountId, name) => {
    try {
        const userDocument = createDocument({
            _id: uuidv4(),
            providerAccountId,
            email: email,
            password: password,
            provider: provider,
            roles: roles,
            name: name,
        }, User);

        await userDocument.save();

        return { wasSuccessful: true, createdUser: userDocument };
    } catch (error) {
        const errMsg = `Failed to create the target user into the db. Reason: ${error}`;

        console.error(errMsg);

        return { wasSuccessful: false, msg: errMsg };
    }
};