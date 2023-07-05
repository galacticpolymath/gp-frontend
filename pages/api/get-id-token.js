import { google } from 'googleapis';
import { getIdToken } from '../../apiServices/googleOAuth/googleOAuth';


export default async function handler(request, response) {
    if(request.method !== 'POST'){
        return response.status(405).json({ msg: 'Method not allowed.' })
    }

    console.log('request?.body: ', request?.body)

    if(!request?.body?.code && !request?.body?.refreshToken){
        console.error('Either the code or the refresh token is missing from the request body.')

        return response.status(400).json({ msg: 'Either the code or the refresh token is missing from the request body.' })
    }

    if(request?.body?.code){
        const { data, status, msg } = await getIdToken(request.body.code);

        return (status !== 200) ? response.status(status).json({ msg: msg }) : response.status(status).json({ data: data }) 
    }

    if(request.body.refreshToken){
        const { data, status, msg } = await getIdToken(null, request.body.refreshToken);

        return (status !== 200) ? response.status(status).json({ msg: msg }) : response.status(status).json({ data: data }) 
    }
}
