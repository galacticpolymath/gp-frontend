import axios from "axios";

const getDbProjectManagerUsers = async () => {
    try {
        const { MONGODB_PROJECT_PUBLIC_KEY, MONGODB_PROJECT_PRIVATE_KEY, MONGODB_PROJECT_ID } = process.env;
        const { GABES_API_KEY_PUBLIC, GABES_API_KEY_PRIVATE, GABES_PROJECT_ID } = process.env;
        // https://cloud.mongodb.com/api/atlas/v2/groups/
        const url = `https://cloud.mongodb.com/api/atlas/v2/groups/${GABES_PROJECT_ID}/databaseUsers`;
        // ADD THE IP ADDRESS NEXT
        const auth = {
            username: GABES_API_KEY_PUBLIC,
            password: GABES_API_KEY_PRIVATE,
        };
        const response = await axios.get(url, {
            auth: auth
        })

        if (response.status !== 200) {
            throw new Error('Error getting project manager users from the db')
        }

        console.log('response.data: ', response.data)
    } catch (error) {
        console.error('An error has occurred getting the project managers users from the db: ', error);
    }
}

export { getDbProjectManagerUsers }
