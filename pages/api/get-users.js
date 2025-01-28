/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import { getUsers, getUsersMailingListStatus } from "../../backend/services/userServices";
import { connectToMongodb } from "../../backend/utils/connection";

/**
 * @swagger
 * /api/get-users:
 *   description: Retrieves all users from the db along with their mailing list status. The client was must be authenticated as a database administrator to use this endpoint.
 *   requiresAuth: true
 *   requiresDbAdminAuth: true
 *   requestBodyComments: "The request body must be empty."
 *   requestBody: {}
 *   methodType: GET
 *   response:
 *     description200Response: Returns an array of all users from the db along with their mailing list status.
 *     descriptionErrResponse: Returns an error message.
 *     possibleResponses:
 *       200:
 *         body: { users: "{ ...UserSchema, mailingListStatus: 'onList' | 'notOnList' | 'doubleOptEmailSent' }[]"}
 *       500:
 *         body: { errMsg: "A message describing the error. Possible reasons: Failed to connect to the database | Failed to retrieve all users." }
 */

/**
 * Retrieves all users from the db.
 * @param {import("next").NextApiRequest} _ - The request object. Not used.
 * @param {import("next").NextApiResponse} response - The response object.
 * @returns {Promise<void>}
 */
export default async function handler(request, response) {
    try {
        if (request.method !== "GET") {
            return response.status(405).json({ errMsg: "Incorrect request method. Must be a 'GET'." });
        }

        const result = await connectToMongodb(
            15_000,
            0,
            true,
            true,
            request?.query?.dbType
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
