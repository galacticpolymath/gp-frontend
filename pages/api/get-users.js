/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import { getUsers } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";

/**
 * @description
 *
 * Get users from db.
 *
 * @param {import('next').NextApiRequest} request
 * @param {import('next').NextApiResponse} response
 */
export default async function handler(request, response) {
    try {
        const result = await connectToMongodb();

        if (!result.wasSuccessful) {
            throw new Error("Failed to connect to the database.");
        }

        const users = await getUsers();

        return response.status(200).json({ users });
    } catch (error) {
        console.error(
            "Failed to retrieve the target users from the db. Reason: ",
            error
        );

        return response.status(200).json({ users: null, error });
    }
}
