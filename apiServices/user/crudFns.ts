/* eslint-disable quotes */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable indent */
import axios from 'axios';
import { TUserSchemaV2 } from '../../backend/models/User/types';

export const updateUser = async (
    query: Omit<Partial<TUserSchemaV2>, "password"> = {}, 
    updatedUser: Omit<Partial<TUserSchemaV2>, "password"> = {}, 
    additionalReqBodyProps: Record<string, unknown> = {}, 
    token: string
) => {
    try {
        if ((Object.keys(query).length <= 0) || (Object.keys(updatedUser).length <= 0)) {
            throw new Error('The "query" and "updatedUser" parameters cannot be empty objects.');
        }

        if (!token) {
            throw new Error('The "token" parameter cannot be empty.');
        }

        if (
            ('id' in query && typeof query.id !== 'string') ||
            ('email' in query && typeof query.email !== 'string') ||
            ('emali' in query && 'id' in query)
        ) {
            throw new Error('The "id" and "email" parameters must be strings. Both cannot be present.');
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const responseBody = { ...query, updatedUser, ...additionalReqBodyProps };
        const response = await axios.put<{ wasSuccessful: boolean, msg: string }>('/api/update-user', responseBody, { headers });

        if (response.status !== 200) {
            throw new Error('Failed to update user.');
        }

        return response.data;
    } catch (error) {
        console.error('An error has occurred, failed to update user. Reason: ', error);

        return null;
    }
};

/**
 * Makes a delete request to the server to delete the user with the given id.
 * @param {string} email The id of the user to be deleted.
 * @return {Promise<{ wasSuccessful: boolean }>} A promise that resolves to an object with a boolean indicating whether the operation was successful.
 * @throws An error has occurred if the server responds with a status code that is not 200 or the wrong parameter type is passed.
 */
export const sendDeleteUserReq = async (email: string, token: string) => {
    try {
        if (typeof email !== 'string') {
            throw new Error('The "userId" parameter must be a string.');
        }

        if (!token) {
            throw new Error('The "token" parameter cannot be empty.');
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const response = await axios.delete(`/api/delete-user?email=${email}`, { headers });

        if (response.status !== 200) {
            throw new Error('Failed to delete the target user.');
        }

        return { wasSuccessful: true };
    } catch (error) {
        console.error('Failed to delete the target user. Reason: ', error);

        return { wasSuccessful: false };
    }
};