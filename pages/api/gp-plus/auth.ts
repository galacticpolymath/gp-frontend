import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

interface IResBody {
  code: string;
}

interface IGoogleDriveAuthResBody{
  access_token: string;
  refresh_token: string;
  expires_in: number
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const origin = request.headers.origin;
    const reqBody = request.body as IResBody;
    const googleDriveAuthReqBody = {
      client_id: '1095510414161-7v7mlrakupjs18n2ml9brjoqs0rjkg4v.apps.googleusercontent.com',
      client_secret: process.env.GOOGLE_DRIVE_AUTH_SECRET,
      redirect_uri: `${origin}/google-drive-auth-result`,
      code: reqBody.code,
      grant_type: "authorization_code",
    };
    const { status, data } = await axios.post<Partial<IGoogleDriveAuthResBody>>('https://oauth2.googleapis.com/token', googleDriveAuthReqBody, {
        headers: {
            'Content-Type': 'application/json'
        }
    })

    console.log('GP Plus auth response data:', data);    

    if (status !== 200) {
      throw new Error(`GP Plus auth failed. Status code: ${status}`);
    }

    if(!("access_token" in data && "refresh_token" in data && "expires_in" in data)){
      throw new Error(`GP Plus auth failed. Response body received: ${data}`);
    }

    return response.status(200).json({ data: data });
  } catch (error) {
    console.error("GP Plus auth failed.", error);

    return response
      .status(500)
      .send({
        errType: "authFailed",
        errMsg: "GP Plus auth failed. Please contact support@outseta.com.",
      });
  }
  // Body is intentionally left empty
}
