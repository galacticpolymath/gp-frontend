import { cache } from "../../backend/utils/cache";


export default async function handler(request, response) {

    if (request.method !== 'POST') {
        return response.status(404).json({ msg: 'This route only accepts POST requests.' });
    }

    const { email } = request.body;
    console.log('email: ', email)
    const jwtTokensMap = cache.get('jwtTokensMap');

    if (!jwtTokensMap) {
        return response.status(400).json({ msg: 'There are no jwtTokens in the cache.' });
    }

    if (!email || (typeof email !== 'string')) {
        return response.status(400).json({ msg: "Either you didn't provided an email or the data type for the email is wrong." })
    }

    const userJwtToken = jwtTokensMap.get(email); 

    if(!userJwtToken){
        return response.status(400).json({ msg: 'There is no jwtToken for this email. You may have received it already.' });
    }

    jwtTokensMap.delete(email);

    cache.set('jwtTokensMap', jwtTokensMap)
    
    return response.status(200).json({ jwt: userJwtToken });
}