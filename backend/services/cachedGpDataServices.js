/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */
import { nanoid } from "nanoid";
import { createPaginationArr, getGpLessons, getGpVids } from "../../globalFns";
import { getGpDataGetterFn } from "../helperFns/cachedGpDataFns";
import { getUnits } from "../helperFns/lessonsFns";
import { CustomError } from "../utils/errors";
import cache from "../utils/cache";

const GP_DATA_EXPIRATION_TIME_MS = 3_600_000 * 12;

export const cacheGpData = async () => {
    try {
        const units = await getUnits();

        if (!units?.length) {
            throw new CustomError('Failed to get gp units from the db.', 500);
        }

        const lessons = getGpLessons(units);
        const videos = getGpVids(units);

        const wasSuccessful = cache.mset([
            {
                key: 'lessons',
                val: lessons,
                ttl: GP_DATA_EXPIRATION_TIME_MS,
            },
            {
                key: 'units',
                val: units,
                ttl: GP_DATA_EXPIRATION_TIME_MS,
            },
            {
                key: 'videos',
                val: videos,
                ttl: GP_DATA_EXPIRATION_TIME_MS,
            },
        ])

        if (!wasSuccessful) {
            throw new CustomError('Failed to cache gp data', 500)
        }

        return { wasSuccessful: true }
    } catch (error) {
        const { message, code } = error ?? {};
        const errMsg = message ? `An error has occurred: ${message}` : 'Failed to cache gp data.';
        console.error(errMsg)

        return { wasSuccessful: false, errMsg, errorStatusCode: code ?? 500 }
    }
}

// NOTES:
// for the cases below, do the following:
// get the units only once
// using the units, get the following:
// lessons and the videos
// after the lessons and the videos have been received create a pagination for each

// GOAL:
// get the units, lessons, and videos  

export const getCachedGpData = async request => {
    try {
        const { type, pageNum } = request.query;
        const getGpData = getGpDataGetterFn(type)?.fn;
        let gpDataArr = cache.get(type);

        if (!gpDataArr?.length && (type !== 'units')) {
            const units = await getUnits();

            if (!units?.length) {
                throw new CustomError('Failed to get the units from the database.', 500)
            }

            cache.set('units', units, GP_DATA_EXPIRATION_TIME_MS);

            gpDataArr = getGpData(units);
            gpDataArr = gpDataArr.length ? gpDataArr.map(val => ({ ...val, id: nanoid() })) : gpDataArr;
            gpDataArr = createPaginationArr(gpDataArr);

            cache.set(type, gpDataArr, GP_DATA_EXPIRATION_TIME_MS);
        } else if (!gpDataArr?.length) {
            const units = await getUnits();

            if (!units?.length) {
                throw new CustomError('Failed to get the units from the database.', 500)
            }

            let uniqueUnits = [];

            for (const unit of units) {
                if (!uniqueUnits.length || !uniqueUnits.some(uniqueUnit => unit.numID === uniqueUnit.numID)) {
                    uniqueUnits.push(unit);
                }
            }

            gpDataArr = createPaginationArr(uniqueUnits);
            cache.set(type, gpDataArr, GP_DATA_EXPIRATION_TIME_MS);
        }

        const pageQueriedByClient = gpDataArr[+pageNum];

        if (!pageQueriedByClient) {
            throw new CustomError('Failed to get the next page of lessons. `pageNum` index is out of range of the array that contains the videos', 400)
        }

        return { data: pageQueriedByClient, isLast: (gpDataArr.length - 1) === +pageNum };
    } catch (error) {
        const { message, code } = error;
        console.log('ERROR STATUS CODE: ', code)
        console.error('Failed to get cached data. Reason: ', message);

        return { errMsg: message ?? 'Failed to get cached gp data.', errorStatusCode: code ?? 500 };
    }
}