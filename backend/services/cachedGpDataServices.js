 
 
 
 
import { nanoid } from "nanoid";
import { createPaginationArr, getGpLessons, getGpVids, getShowableUnits } from "../../globalFns";
import { getGpDataGetterFn, getIndividualLessonsNumForUnitObj } from "../helperFns/cachedGpDataFns";
import { getUnits } from "../helperFns/lessonsFns";
import { CustomError } from "../utils/errors";
import cache from "../utils/cache";

const GP_DATA_EXPIRATION_TIME_MS = 3_600_000 * 12;

export const cacheGpUnitData = async () => {
    try {
        let units = await getUnits();
        units = units.map(getIndividualLessonsNumForUnitObj)

        if (!units?.length) {
            throw new CustomError('Failed to get gp units from the db.', 500);
        }

        const lessons = createPaginationArr(getGpLessons(units));
        const videos = createPaginationArr(getGpVids(units));
        const wasSuccessful = cache.mset([
            {
                key: 'lessons',
                val: lessons,
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

export const getCachedGpData = async ({ type, pageNum }, cache) => {
    try {
        const getGpData = getGpDataGetterFn(type)?.fn;

        if (!getGpData) {
            throw new CustomError('The value for `type` is invalid.', 400)
        }

        let gpDataArr = cache.get(type);
        let totalItemsNum = gpDataArr?.length ? gpDataArr?.flat()?.length : null;

        if (!gpDataArr?.length) {
            let units = await getUnits();

            if (!units?.length) {
                throw new CustomError('Failed to get the units from the database.', 500)
            }

            units = getShowableUnits(units)
            gpDataArr = getGpData(units);
            totalItemsNum = gpDataArr.length
            gpDataArr = gpDataArr.length ? gpDataArr.map(val => ({ ...val, id: nanoid() })) : gpDataArr;
            gpDataArr = createPaginationArr(gpDataArr);
            cache.set(type, gpDataArr, GP_DATA_EXPIRATION_TIME_MS);
        }

        const pageQueriedByClient = gpDataArr[+pageNum];

        if (!pageQueriedByClient) {
            throw new CustomError('Failed to get the next page of lessons. `pageNum` index is out of range of the array that contains the videos', 400)
        }

        return { data: pageQueriedByClient, isLast: (gpDataArr.length - 1) === +pageNum, totalItemsNum: totalItemsNum };
    } catch (error) {
        const { message, code } = error;
        console.log('ERROR STATUS CODE: ', code)
        console.error('Failed to get cached data. Reason: ', message);

        return { errMsg: message ?? 'Failed to get cached gp data.', errorStatusCode: code ?? 500 };
    }
}