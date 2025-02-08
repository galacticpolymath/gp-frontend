/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import {
    getUserMailingListStatusWithRetries,
    getUsers,
    getUsersMailingListStatus,
} from "../../backend/services/userServices";
import {
    connectToDbWithoutRetries,
    connectToMongodb,
} from "../../backend/utils/connection";

export const config = {
    maxDuration: 45,
};

/**
 * @swagger
 * /api/get-users:
 *   description: Retrieves all users from the db along with their mailing list status. The client was must be authenticated as a database administrator to use this endpoint. Will hit the brevo api. If a 429 error is encountered, then it will retry up to 7 times.
 *   requiresAuth: true
 *   requiresDbAdminAuth: true
 *   requestBodyComments: "No request body. Do not set one."
 *   methodType: GET
 *   params: {  dbType: { val: "'dev' | 'prod'", isOptional: true } }
 *   examples: { path: "/api/get-users?dbType=prod" }
 *   response:
 *     description200Response: Returns an array of all users from the db along with their mailing list status.
 *     descriptionErrResponse: Returns an error message.
 *     possibleResponses:
 *       200:
 *         body: { users: "{ ...UserSchema, mailingListStatus: 'onList' | 'notOnList' | 'doubleOptEmailSent' }[]"}
 *       500:
 *         body: { errMsg: "A message describing the error. Possible reasons: Failed to connect to the database | Failed to retrieve all users | Reached max triese when retrieving the mailing list status of a user from Brevo.", errType?: "dbConnectionErr | userRetrievalErr | maxTriesExceeded" }  
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
            return response
                .status(405)
                .json({ errMsg: "Incorrect request method. Must be a 'GET'." });
        }

        const { dbType } = request.query;

        const isDbConnected = await connectToDbWithoutRetries(dbType);

        if (!isDbConnected) {
            return response
                .status(500)
                .json({ errMsg: "Failed to connect to the database." });
        }

        let { errMsg, users } = await getUsers();

        if (errMsg || !users) {
            return response
                .status(500)
                .json({ errMsg: errMsg ?? "Failed to retrieve all users." });
        }

        if (users.length === 0) {
            console.error("No users found.");

            return response.status(200).json({ users });
        }

        const {
            users: usersWithMailingStatusWithRetries,
            errorMessage,
            errType,
        } = await getUserMailingListStatusWithRetries(users, []);

        return response
            .status(usersWithMailingStatusWithRetries ? 200 : 500)
            .json({
                users: usersWithMailingStatusWithRetries,
                errMsg: errorMessage,
                errType,
            });
    } catch (error) {
        console.error(
            "Failed to retrieve the target users from the db. Reason: ",
            error
        );

        return response.status(500).json({ users: null, errMsg: `${error}` });
    }
}
