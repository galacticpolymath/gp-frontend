/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable semi */
import { getGpLessons, getGpVids } from "../../globalFns"

export const getGpDataGetterFn = targetFnNameStr => {
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

    return fns.find(fnObj => fnObj.name === targetFnNameStr);
}