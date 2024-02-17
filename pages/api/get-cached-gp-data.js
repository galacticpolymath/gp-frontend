/* eslint-disable for-direction */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable indent */
import { nanoid } from 'nanoid';
import { getUnits } from '../../backend/helperFns/lessonsFns';
import cache from '../../backend/utils/cache';
import { CustomError } from '../../backend/utils/errors';
import { createPaginationArr, getGpLessons, getGpVids } from '../../globalFns';

const getGpDataGetterFn = targetFnNameStr => {
    const fns = [
        {
            name: 'videos',
            fn: getGpVids,
        },
        {
            name: 'lessons',
            fn: getGpLessons,
        },
    ]

    return fns.find(fnObj => fnObj.name === targetFnNameStr)
}

const VALID_GP_UNIT_TYPES = ['videos', 'units', 'lessons']

export default async function handler(request, response) {
    try {
        if (request.method !== 'GET') {
            throw new CustomError("Incorrect request method. Must be a 'GET'.", 405)
        }
        if (!request.query.pageNum || (request.query.pageNum && !Number.isInteger(+request.query.pageNum))) {
            throw new CustomError('Missing the `pageNum` parameter. Must be a integer greater than 0.', 400)
        }

        if (!request.query.type || (typeof request.query.type !== 'string') || ((typeof request.query.type === 'string') && !VALID_GP_UNIT_TYPES.includes(request.query.type))) {
            throw new CustomError(`Received an invalid value for the "type" parameter. Received "${request.query.type}"`, 400)
        }

        const { type, pageNum } = request.query;
        const getGpData = getGpDataGetterFn(type)?.fn;
        let gpDataArr = cache.get(type);

        if (!gpDataArr?.length && (type !== 'units')) {
            const units = await getUnits();

            if (!units?.length) {
                throw new CustomError('Failed to get the units from the database.', 500)
            }

            cache.set('units', units, 3_600_000 * 12);

            gpDataArr = getGpData(units);
            gpDataArr = gpDataArr.length ? gpDataArr.map(val => ({ ...val, id: nanoid() })) : gpDataArr;
            gpDataArr = createPaginationArr(gpDataArr);

            cache.set(type, gpDataArr, 3_600_000 * 12);
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
            cache.set(type, gpDataArr, 3_600_000 * 12);
        }

        const pageQueriedByClient = gpDataArr[+pageNum]

        if (!pageQueriedByClient) {
            throw new CustomError('Failed to get the next page of lessons. `pageNum` index is out of range of the array that contains the videos', 400)
        }

        response.json({ data: pageQueriedByClient, isLast: (gpDataArr.length - 1) === +pageNum })
    } catch (error) {
        console.error('Failed to get the next page of videos for the client. Reason: ', error)
        const { code, message } = error ?? {};

        response.status(code).json({ msg: message })
    }
}
