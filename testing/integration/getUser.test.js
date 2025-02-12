const { default: axios } = require("axios");
const { signJwt } = require("../../backend/utils/auth");
require('dotenv').config();

test("Will check if the responses from the `get-users` route are constant.", async () => {

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
    // console.log("yo there, process.env: ", process.env)

    const getUserResults = async () => {
        const {
            NEXTAUTH_SECRET,
            TESTING_EMAIL
        } = process.env;
        const accessToken = await signJwt({
            TESTING_EMAIL,
            roles: ['dbAdmin', 'user'],
            name: "Gabe"
        },
            NEXTAUTH_SECRET,
            '12hr'
        );
        const headers = new Headers();

        headers.append(
            "Authorization",
            `Bearer ${accessToken}`
        );

        try {
            const url = new URL("http://localhost:8080/api/get-users");
            const auth = `Bearer ${accessToken}`;

            url.searchParams.append("dbType", "prod");

            const { status, data } = await axios.get(url.href, { headers: { "Authorization": auth } });

            if (status !== 200) {
                throw new Error("Received a non 200 response from the server.");
            }

            console.log("data, yo there: ", data)

            const usersOnMailingList = data.users.filter(user => user.mailingListStatus === "onList");

            return {
                usersOnMailingList: usersOnMailingList?.length,
                totalUsers: data?.users?.length
            }
        } catch (error) {
            console.error("Failed to get users. Reason: ", error);

            return {};
        }
    }

    const getUserResultsPromises = [
        getUserResults(),
        getUserResults(),
        getUserResults(),
        getUserResults(),
        getUserResults()
    ];
    const userResults = await Promise.all(getUserResultsPromises);
    const firstResult = userResults[0];

    if (Object.keys(firstResult).length) {
        console.error("Failed to get users.");
        expect(false).toBe(true)
        return;
    }

    const areResultsConstant = userResults.every(result => {
        return (result.usersOnMailingList === firstResult.usersOnMailingList) &&
            (result.totalUsers === firstResult.totalUsers);
    });

    console.log("userResults, hey there: ", userResults);

    expect(areResultsConstant).toBe(true);
}, 1_000 * 60 * 3);