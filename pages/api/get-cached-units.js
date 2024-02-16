/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
import { getUnits } from "../../backend/helperFns/lessonsFns";
import cache from "../../backend/utils/cache";
import { CustomError } from "../../backend/utils/errors";
import { createPaginationArr } from "../../globalFns";

export default async function handler(request, response) {
    try {
        if (request.method !== 'GET') {
            throw new CustomError("Incorrect request method. Must be a 'GET'.", 405);
        }

        if (!request.query.pageNum || (request.query.pageNum && !Number.isInteger(+request.query.pageNum))) {
            throw new CustomError('Missing the `pageNum` parameter. Must be a integer greater than 0.', 404);
        }

        let cachedUnits = cache.get('units');

        if (!cachedUnits.length) {
            const unitsFromDb = await getUnits();
            cachedUnits = createPaginationArr(unitsFromDb);

            cache.set('units', cachedUnits, 3_600_000 * 12);
        }

        const unitsForClient = cachedUnits[+request.query.pageNum];

        if (!unitsForClient) {
            throw new CustomError('Failed to get the next page of units. `pageNum` index is out of range of the array that contains the units', 400);
        }

        response.json({ data: cachedUnits, isLast: (cachedUnits.length - 1) === +request.query.pageNum });
    } catch (error) {
        console.error('Failed to get the next page of videos for the client. Reason: ', error);
        const { code, message } = error ?? {};

        response.status(code).json({ msg: message });
    }
}
