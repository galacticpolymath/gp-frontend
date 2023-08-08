import urllib from 'urllib';

const getDbProjectManagerUsers = async _ => {
    try {
        const { GABES_DB_PROJECT_ID, GABES_DB_PASSWORD, GABES_DB_USERNAME } = process.env;
        // const url = `https://cloud.mongodb.com/api/atlas/v2/groups/${GABES_DB_PROJECT_ID}/users`
        const url = `https://cloud.mongodb.com/api/atlas/v2/groups/${GABES_DB_PROJECT_ID}/databaseUsers`
        const options = {
            method: "GET",
            rejectUnauthorized: false,
            digestAuth: `${GABES_DB_USERNAME}:${GABES_DB_PASSWORD}`,
        };
        const response = await urllib.request(url, { digestAuth: `${GABES_DB_USERNAME}:${GABES_DB_PASSWORD}`, method: 'GET' })

        console.log('response ', response)
        console.log('response statusText: ', response.status)
    } catch (error) {
        console.error('An error has occurred getting the project managers users from the db: ', error);
    }
}

export default getDbProjectManagerUsers;