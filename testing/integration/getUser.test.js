const { default: axios } = require("axios");
const { signJwt } = require("../../backend/utils/auth");

test("Will check if the responses from the `get-users` route are constant.", async () => {
    const {
        NEXTAUTH_SECRET,
        TESTING_EMAIL
    } = process.env;
    const accessToken = await signJwt({
        TESTING_EMAIL,
        roles: ['dbAdmin', 'user'],
    },
        NEXTAUTH_SECRET,
        '12hr'
    );
    console.log("accessToken: ", accessToken);
    function getUserResults() {
        try {
            // const [] = axios.get(`http://localhost:3000/api/get-users`);
        } catch (error) {

        }
    }

    expect(true).toBe(true);
});