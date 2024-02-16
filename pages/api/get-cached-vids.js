/* eslint-disable for-direction */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable indent */
import { getLessons } from '../../backend/helperFns/lessonsFns';
import cache from '../../backend/utils/cache';
import { CustomError } from '../../backend/utils/errors';
import { createPaginationArr, getGpVids } from '../../globalFns';

export default async function handler(request, response) {
    try {
        if (request.method !== 'GET') {
            throw new CustomError("Incorrect request method. Must be a 'GET'.", 405)
        }

        if (!request.query.pageNum || (request.query.pageNum && !Number.isInteger(+request.query.pageNum))) {
            throw new CustomError('Missing the `pageNum` parameter. Must be a integer greater than 0.', 404)
        }

        let vids = cache.get('videos');

        if (!vids?.length) {
            console.log('updating the cache...');

            const lessons = await getLessons();

            if (!lessons?.length) {
                throw new CustomError('Failed to get the lessons from the database.', 500)
            }

            vids = getGpVids(lessons);
            vids = createPaginationArr(vids);

            cache.set('videos', vids, 3_600_000 * 12);
        }

        const pageQueriedByClient = vids[+request.query.pageNum]

        if (!pageQueriedByClient) {
            throw new CustomError('Failed to get the next page of lessons. `pageNum` index is out of range of the array that contains the videos', 400)
        }

        response.json({ data: pageQueriedByClient, isLast: (vids.length - 1) === (+request.query.pageNum) })
    } catch (error) {
        console.error('Failed to get the next page of videos for the client. Reason: ', error)
        const { code, message } = error ?? {};

        response.status(code).json({ msg: message })
    }
}
