/* eslint-disable quotes */
/* eslint-disable for-direction */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable indent */

import cache from "../../backend/utils/cache";

export default async function handler(request, response) {
    console.log('request.body.lessons, sup there: ', request.body.lessons)
    cache.set('lessons', request.body.lessons);

    response.json({ msg: 'Gp Unit Data was cached.' })
}
