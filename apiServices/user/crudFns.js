/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable indent */
import axios from 'axios';

export const updateUser = async (query = {}, updatedUser = {}, additionalReqBodyProps = {}) => {
    try {
        if ((Object.keys(query).length <= 0) || (Object.keys(updatedUser).length <= 0)) {
            throw new Error('The "query" and "updatedUser" parameters cannot be empty objects.');
        }

        if (
            ('id' in query && typeof query.id !== 'string') ||
            ('email' in query && typeof query.email !== 'string') ||
            ('emali' in query && 'id' in query)
        ) {
            throw new Error('The "id" and "email" parameters must be strings. Both cannot be present.');
        }

        const responseBody = { ...query, updatedUser, ...additionalReqBodyProps };
        const response = await axios.put('/api/update-user', responseBody);

        if (response.status !== 200) {
            throw new Error('Failed to update user.');
        }

        return response.data;
    } catch (error) {
        console.error('An error has occurred, failed to update user. Reason: ', error);

        return null;
    }
};

export const addUserToMailingList = async (email) => {
    // must get the email of the user
    // the route on the the backend will update the isOnMailingList to be true only if 
    // -wasMailingListConfirmationEmailSent is true
};