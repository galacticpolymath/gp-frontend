/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import { getUsers, getUsersMailingListStatus } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";

/**
 * @swagger
 * /api/get-users:
 *   get:
 *     description: Returns the hello world
 *     responses:
 *       200:
 *         description: hello world
 */

export default async function handler(_, response) {
    try {
        const result = await connectToMongodb(
            15_000,
            0,
            true,
            true
        );

        if (!result.wasSuccessful) {
            throw new Error("Failed to connect to the database.");
        }

        let { errMsg, users } = await getUsers();

        if (errMsg || !users) {
            return response.status(500).json({ errMsg: errMsg ?? "Failed to retrieve all users." });
        }

        if (users.length === 0) {
            console.error("No users found.");
            return response.status(200).json({ users });
        }

        users = await getUsersMailingListStatus(users);

        return response.status(200).json({ users });
    } catch (error) {
        console.error(
            "Failed to retrieve the target users from the db. Reason: ",
            error
        );

        return response.status(500).json({ users: null, errMsg: `${error}` });
    }
}
