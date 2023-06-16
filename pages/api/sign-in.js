import { connectToMongodb } from '../../backend/utils/connection';
import { createJwt, userLogin } from '../../backend/services/authServices';

export default async function handler(request, response) {

    if (request.method !== 'POST') {
        return response.status(404).json({ msg: 'This route only accepts POST requests.' });
    }

    const { email, password } = request.body;

    if(!email || !password){
        return response.status(400).json({ msg: 'The email and password fields are required.' });
    }

    try {
        await connectToMongodb();
        const { status, msg, data: userRoles } = await userLogin(email, password);

        console.log(userRoles)

        if(status === 401){
            return response.status(status).json({ msg });
        }

        const jwt = createJwt({ roles: userRoles, email: email });

        return response.status(200).json({ jwt: jwt });
    } catch (error) {
        console.error('An error has occurred in the sign-in route: ', error)

        return response.status(500).json({ msg: `Couldn't get user from the database.` });
    }
}
