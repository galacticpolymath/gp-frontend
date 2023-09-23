import { getCache } from "../../backend/utils/cache";

export default async function handler(request, response) {

    if (request.method !== 'POST') {
        return response.status(404).json({ msg: 'This route only accepts POST requests.' });
    }

    const cache = getCache()

    console.log('cache keys: ', cache.keys())

    // console.log('cache: ', cache.keys())

    // const cache = getCache();
    // console.log('getting jwt, current cache: ', cache.keys())
    // const jwtTokensMap = cache.get('jwtTokensMap');

    // if (!jwtTokensMap) {
    //     return response.status(400).json({ msg: 'There are no jwtTokens in the cache.' });
    // }

    // if (!request?.body?.email || (typeof request?.body?.email !== 'string')) {
    //     return response.status(400).json({ msg: "Either you didn't provided an email or the data type for the email is wrong." })
    // }

    // const userJwtToken = jwtTokensMap.get(request?.body?.email); 

    // if(!userJwtToken){
    //     return response.status(400).json({ msg: 'There is no jwtToken for this email. You may have received it already.' });
    // }

    // jwtTokensMap.delete(request.body.email);

    // cache.set('jwtTokensMap', jwtTokensMap)
    
    // return response.status(200).json({ jwt: userJwtToken });
    return response.status(200).json({ msg: "hey there." });
}