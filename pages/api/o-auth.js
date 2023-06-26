import { connectToMongodb } from '../../backend/utils/connection';
import { createJwt, userLogin } from '../../backend/services/authServices';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export default async function handler(request, response) {
    const { AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_REDIRECT_URI } = process.env;
    const oauth2Client = new google.auth.OAuth2(
        AUTH_CLIENT_ID,
        AUTH_CLIENT_SECRET,
        AUTH_REDIRECT_URI
    );
    // const scopes = [
    //     'https://www.googleapis.com/auth/userinfo.profile',
    //     'https://www.googleapis.com/auth/userinfo.email',
    // ];
    // const url = oauth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: scopes,
    // });
    const client = await oauth2Client.verifyIdToken({
        idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk5YmNiMDY5MzQwYTNmMTQ3NDYyNzk0ZGZlZmE3NWU3OTk2MTM2MzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMDIyMjU5MTE4MDM2LTBkOG9udjRiYms3OGJkaDJiZ200MjdiOGJza2k1bzBwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTAyMjI1OTExODAzNi0wZDhvbnY0YmJrNzhiZGgyYmdtNDI3Yjhic2tpNW8wcC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMjU2MTk5MzEzMjIxNDM3NTE2NCIsImVtYWlsIjoiZ3Rvcmlvbjk3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiNmJtaHdjY3lxOHFUek1YSllqRFBodyIsIm5hbWUiOiJHYWJyaWVsIFRvcmlvbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQWNIVHRkeHVsNkJpMHpUMjB4S09tWm9CMm5oaUYxMExmNGpkSWNSRDJicD1zOTYtYyIsImdpdmVuX25hbWUiOiJHYWJyaWVsIiwiZmFtaWx5X25hbWUiOiJUb3Jpb24iLCJsb2NhbGUiOiJlbiIsImlhdCI6MTY4Nzc0MzM4MSwiZXhwIjoxNjg3NzQ2OTgxfQ.hBLLeQuWRtiKukhKR6W30VW00s6s-lJwR6buAB5eW1YcGiWBKRFO0LfmPiE2MF6pY5PZmxUDbRJ_r4yZJmnHp0xuOVkN9vbMEneMJKwoWAdsvDnKItdngEXDmTBy2OzWzm-aCvH2hqDtKPS457QZ0tBPM20uwLu6tZNbiCvrNG2E3w-KGbVx5r4JWdNf4t23J5bhxl6XE_GxnBvAQSku7h5HAPm9RqVuxPBVAEBASy-O17jJyZvSZ1VIqbEfSo9ekb_hfHTzFUYKBht7MEVBRvPXbvaGWHOmfe5W3_QlfUlz00fd28lbcxxRSrAelKyGmeALsx0T5ifZJe0BHCvTnQ",
        audience: AUTH_CLIENT_ID,
    })

    console.log('client: ', client)
    // const result = await oauth2Client.getToken('4/0AbUR2VOWs2eS95pxgr9ebgZi_PixXFAk9rUhLW2l8cjXzrhtjSYdAAwmNn_QSrVBvK_1UQ')

    // console.log('tokens result: ', result)
    // const ticket = await client.verifyIdToken({
    //     idToken: "4/0AbUR2VPPcH7o7FL6MKIQbxFmBUIiUqaZ9OSsyLHznE922oAh4LZ1RG-UKbyrX6HDKSACsw",
    //     audience: AUTH_CLIENT_ID
    //   });

    //   console.log('ticket: ', ticket)

    // console.log("client: ", client)


    response.status(200).json({ msg: "success" })

    // return response.redirect(url)
}
