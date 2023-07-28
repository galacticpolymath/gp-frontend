import axios from "axios";
import urllib from "urllib";

const getDbProjectManagerUsers = async () => {
    try {
        const { GABES_DB_PROJECT_ID, GABES_DB_PASSWORD, GABES_DB_USERNAME } = process.env;
        const url = `https://cloud.mongodb.com/api/atlas/v2/groups/${GABES_DB_PROJECT_ID}/users`
        const options = {
            method: "GET",
            digestAuth: `${GABES_DB_USERNAME}:${GABES_DB_PASSWORD}`,
        };
        const response = await urllib.request(url, { ...options, headers: { Accept: "application/vnd.atlas.2023-02-01+json" } })

        console.log('response: ', response)
        console.log('response statusText: ', response.status)
    } catch (error) {
        console.error('An error has occurred getting the project managers users from the db: ', error);
    }
}

export { getDbProjectManagerUsers }
