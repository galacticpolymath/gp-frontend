import axios from "axios";
import urllib from "urllib";

// FOR THE PROJECT ADD THE FOLLOWING:
// 

const getDbProjectManagerUsers = async () => {
    try {
        const { MONGODB_PROJECT_PUBLIC_KEY, MONGODB_PROJECT_PRIVATE_KEY, MONGODB_PROJECT_ID } = process.env;
        const { GABES_DB_PROJECT_ID, GABES_DB_PASSWORD, GABES_DB_USERNAME } = process.env;
        // https://cloud.mongodb.com/api/atlas/v2/groups/
        // const url = `https://cloud.mongodb.com/api/atlas/v2/groups/${GABES_DB_PROJECT_ID}/databaseUsers`;
        // const url = 'https://cloud.mongodb.com/api/atlas/v1.0/';
        const url = `https://cloud.mongodb.com/api/atlas/v2/groups/${GABES_DB_PROJECT_ID}/users`
        const options = {
            digestAuth: `${GABES_DB_USERNAME}:${GABES_DB_PASSWORD}`,
        };

        // console.log('options: ', options)

        // const auth = {
        //     username: MONGODB_PROJECT_PUBLIC_KEY,
        //     password: MONGODB_PROJECT_PRIVATE_KEY
        // };
        // const response = await axios.get(url, {
        //     auth: auth
        // })

        // urllib.request(url, options, (error, data, response) => {
        //     console.log('response: ', response)
        //     console.log('error: ', error)

        //     if (error || (response.statusCode !== 200)) {
        //         console.log('FUCK YOU')
        //         // console.error(`Error: ${error}`);
        //         console.error(`Status code: ${response.statusCode}`);
        //     } else {
        //         console.log('HEYYYYYY')
        //         // console.log('data: ', data)
        //         console.log(JSON.parse(data));
        //     }
        // });



        const response = await urllib.request(url, options)

        // const response = await axios.get(url, options)

        console.log('response status: ', response.statusText)
        console.log('response statusText: ', response.status)

        // if (response.status !== 200) {
        //     throw new Error('Error getting project manager users from the db')
        // }

        // console.log('response.data: ', response.data)
    } catch (error) {
        console.error('An error has occurred getting the project managers users from the db: ', error);
    }
}

export { getDbProjectManagerUsers }
