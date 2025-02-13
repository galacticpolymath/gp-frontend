const { default: axios } = require("axios");
const { signJwt } = require("../../backend/utils/auth");
require("dotenv").config();

/**
 * Makes a GET request to the `get-users` route and filters the
 * results to only include users who are on the mailing list.
 * @returns {Promise<{ usersOnMailingList?: number | undefined, totalUsers?: number | undefined }>} A promise that resolves to an object
 *    containing the properties `usersOnMailingList` and `totalUsers`.
 *    `usersOnMailingList` is the number of users on the mailing list
 *    and `totalUsers` is the total number of users in the database.
 *    If the request fails, it will log the error and return an empty
 *    object.
 */
const getUserResults = async () => {
    const { NEXTAUTH_SECRET, TESTING_EMAIL } = process.env;
    const accessToken = await signJwt(
        {
            TESTING_EMAIL,
            roles: ["dbAdmin", "user"],
            name: "Gabe",
        },
        NEXTAUTH_SECRET,
        "12hr"
    );
    const headers = new Headers();

    headers.append("Authorization", `Bearer ${accessToken}`);

    try {
        const url = new URL("http://localhost:3000/api/get-users");
        const auth = `Bearer ${accessToken}`;
        const { status, data } = await axios.get(url.href, {
            headers: { Authorization: auth },
            params: {
                dbType: "production",
            },
        });

        if (status !== 200) {
            throw new Error("Received a non 200 response from the server.");
        }

        const usersOnMailingList = data.users.filter(
            (user) => user.mailingListStatus === "onList"
        );

        return {
            usersOnMailingList: usersOnMailingList?.length,
            totalUsers: data?.users?.length,
            emailsOnMailingList: usersOnMailingList.map((user) => user.email),
        };
    } catch (error) {
        console.error("Failed to get users. Reason: ", error);

        return {};
    }
};

test(
    "Will check if the responses from the `get-users` route are constant.",
    async () => {
        const getUserResultsPromises = new Array(1).fill(0).map(() => getUserResults());
        const userResults = await Promise.all(getUserResultsPromises);
        const firstResult = userResults[0];

        if (!Object.keys(firstResult).length) {
            console.error("Failed to get users.");
            expect(false).toBe(true);
            return;
        }

        const results = userResults.map(({ totalUsers, usersOnMailingList }) => ({
            totalUsers,
            usersOnMailingList,
        }));
        // console.log("Results: ", results);
        const areResultsConstant = userResults.every((result) => {
            return (
                result.usersOnMailingList === firstResult.usersOnMailingList &&
                result.totalUsers === firstResult.totalUsers
            );
        });

        expect(areResultsConstant).toBe(true);
    },
    1_000 * 60 * 3
);
