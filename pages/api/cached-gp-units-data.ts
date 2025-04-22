/* eslint-disable quotes */
/* eslint-disable for-direction */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable indent */
import { NextApiRequest, NextApiResponse } from "next";
import { cacheGpUnitData } from "../../backend/services/cachedGpDataServices";
import cache from "../../backend/utils/cache";
import { CustomError } from "../../backend/utils/errors";
import { getCachedGpUnitData } from "../../backend/services/cachedGpUnitDataServerices";
import { TGpUnitDataType } from "../../customHooks/useGetGpDataStates";

const VALID_GP_UNIT_TYPES = ['videos', 'units', 'lessons'];

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    try {
        if ((request.method === 'GET') && (!request.query.pageNum || !Number.isInteger(+request.query.pageNum) || Number.isNaN(+request.query.pageNum))) {
            throw new CustomError('Missing the `pageNum` parameter. Must be a integer greater than 0.', 400);
        }

        if ((request.method === 'GET') && (!request.query.type || (typeof request.query.type !== 'string') || !VALID_GP_UNIT_TYPES.includes(request.query.type))) {
            throw new CustomError(`Received an invalid value for the "type" parameter. Received "${request.query.type}"`, 400);
        }

        // get data from the cache
        if (request.method === 'GET') {
            const result = await getCachedGpUnitData(
                {
                    type: request.query.type as Exclude<TGpUnitDataType, "units">,
                    pageNum: parseInt(request.query.pageNum as string),
                },
                cache
            )
            console.log('result, sup there: ', result);
            const { errMsg, errorStatusCode, data, isLast, totalItemsNum } = result

            if (errMsg) {
                throw new CustomError(errMsg, errorStatusCode);
            }

            return response.json({ data: data, isLast: isLast, totalItemsNum: totalItemsNum ?? null })
        }

        // caching gp unit data
        if (request.method === 'POST') {
            const { wasSuccessful, errorStatusCode, errMsg } = await cacheGpUnitData();

            if (!wasSuccessful) {
                throw new CustomError(errMsg, errorStatusCode)
            }

            console.log('data was cached, wasSuccessful: ', wasSuccessful)

            return response.json({ msg: 'Gp unit data was cached.' })
        }

        throw new CustomError('Invalid request method.', 405)
    } catch (error: any) {
        console.error('Failed to get the next page of gp unit data for the client. Reason: ', error)
        const { code, message } = error ?? {};

        response.status(code).json({ msg: message })
    }
}
