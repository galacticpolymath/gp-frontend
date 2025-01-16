/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import { getMailingListContact } from "../../backend/services/emailServices";
import { findMailingListConfirmationByEmail, findMailingListConfirmations } from "../../backend/services/mailingListConfirmationServices";
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

        const users = await getUsers();
        const getUserMailingListStatusesPromises = users.map(user => getMailingListContact(user.email))
        const userMailingListStatuses = await Promise.all(getUserMailingListStatusesPromises);
        const notOnMailingListIndices = new Set();

        for (let index = 0; index < userMailingListStatuses.length; index++) {
            const userMailingListStatus = userMailingListStatuses[index];

            if (userMailingListStatus !== null) {
                let targetUser = users[index];
                targetUser = {
                    ...targetUser,
                    mailingListStatus: "onList"
                }
                users[index] = targetUser;
                continue;
            }

            notOnMailingListIndices.add(index)
        }

        if (notOnMailingListIndices.size) {
            const emails = users
                .filter((_, index) => notOnMailingListIndices.has(index))
                .map(user => user.email);
            const getUserMailingListConfirmationDocsPromises = emails
                .map(email => findMailingListConfirmationByEmail(email))
            const userMailingListConfirmationDocs = await Promise.all(getUserMailingListConfirmationDocsPromises);

            for (let index = 0; index < userMailingListConfirmationDocs.length; index++) {
                const email = emails[index];
                const userMailingListConfirmationDoc = userMailingListConfirmationDocs[index];
                const targetUserIndex = users.findIndex(user => user.email === email)

                if (targetUserIndex === -1) {
                    console.error("ERROR. Target user was not found.");
                    continue;
                }

                const mailingListStatus = userMailingListConfirmationDoc == null ? "notOnList" : "doubleOptEmailSent";
                let targetUser = users[targetUserIndex]
                targetUser = {
                    ...targetUser,
                    mailingListStatus,
                }
                users[targetUserIndex] = targetUser;
            }
        }

        return response.status(200).json({ users });
    } catch (error) {
        console.error(
            "Failed to retrieve the target users from the db. Reason: ",
            error
        );

        return response.status(200).json({ users: null, error });
    }
}
