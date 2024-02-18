/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable semi */
import moment from "moment";
import { getGpLessons, getGpVids } from "../../globalFns"

export const getIndividualLessonsNumForUnitObj = unitObj => {
    const individualLessonsNum = unitObj?.LsnStatuses?.length ? unitObj.LsnStatuses.filter(({ status }) => status !== 'Hidden')?.length : 0;
    const unitObjUpdated = {
        ...unitObj,
        individualLessonsNum,
        ReleaseDate: moment(unitObj.ReleaseDate).format('YYYY-MM-DD'),
    };

    delete unitObjUpdated.LsnStatuses;

    return unitObjUpdated;
}

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