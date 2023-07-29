import { google, } from 'googleapis'

async function getAuthGoogleClient() {
    const auth = new google.auth.GoogleAuth({
        keyFilename: "google-cloud.json",
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    return await auth.getClient();
}

const getCanUserWriteToDb = async email => {
    try {
        const { GOOGLE_CLIENT_EMAIL_GABE, GOOGLE_PROJECT_ID } = process.env;
        const authGoogleClient = await getAuthGoogleClient();
        const iam = google.iam('v1');
        const usersThatCanWriteToDb = [GOOGLE_CLIENT_EMAIL_GABE]
        let userEmailsThatCanWriteToDb = [];

        for (let numIteration = 0; numIteration < usersThatCanWriteToDb.length; numIteration++) {
            const serviceAccountEmail = usersThatCanWriteToDb[numIteration];
            const request = {
                name: `projects/${GOOGLE_PROJECT_ID}/serviceAccounts/${serviceAccountEmail}`,
                auth: authGoogleClient,
            }
            const response = await iam.projects.serviceAccounts.get(request);
            userEmailsThatCanWriteToDb.push(response.data.displayName)
        }

        return userEmailsThatCanWriteToDb.includes(email);
    } catch (error) {
        console.error('An error has occurred in validating user\'s email. Error message: ', error)

        return false;
    }
};

export { getCanUserWriteToDb }