/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable semi */
/* eslint-disable indent */
import Button from "../components/General/Button"
import Layout from "../components/Layout"
import { getUrlParamVal } from "../globalFns";

const getToken = async (code, domain) => {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const requestBody = {
        'code': code,
        'client_id': process.env.GOOGLE_SERVICE_WEB_APP_CLIENT_ID,
        'client_secret': process.env.GOOGLE_SERVICE_WEB_APP_SECRET_KEY,
        'redirect_uri': `${domain}/google-drive-auth-result/`,
        'grant_type': 'client_credentials',
    };

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestBody,
        });
        const resBody = await response.json()
        console.log('getting token, response: ', response)
        console.log('resBody: ', resBody)

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const tokenData = await response.json();
        const accessToken = tokenData.access_token;

        return accessToken;
    } catch (error) {
        console.error('Error while getting access token: ', error);
        return null;
    }
};

const GoogleDriveAuthResult = () => {

    const handleOnClick = async () => {
        const accessCode = getUrlParamVal(window.location.search, 'code')

        console.log('accessCode: ', accessCode)

        const token = await getToken(accessCode, window.location.origin);

        console.log('token: ', token);
    }

    return (
        <Layout>
            <div className='min-vh-100 pt-3 ps-3'>
                <Button
                    handleOnClick={handleOnClick}
                >
                    Confirm Google Drive Access.
                </Button>
            </div>
        </Layout>
    )
};

export default GoogleDriveAuthResult;