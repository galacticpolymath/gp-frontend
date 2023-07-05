import { generateRedirectUrl } from '../../apiServices/googleOAuth/googleOAuth';


export default async function handler(request, response) {
    try {
        // validate if the request came from a valid origin
        const url = generateRedirectUrl();

        return response.status(200).json({ redirectUrl: url })
    } catch(error){
        const errMsg = `An error has occurred in generate the redirect url of google o-auth: ${error}`

        return response.status(500).json({ msg: errMsg })
    }
}
