/* eslint-disable no-debugger */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */

const getNewUrl = (jobCategory, queryParams) => {
    const { id, hierarchy } = jobCategory;
    const mainLevel = hierarchy + 1;
    const targetLevel = jobCategory[`level${hierarchy}`];
    const _queryParams = [...queryParams];
    const indexOfTargetJobCategoryId = _queryParams.indexOf(id.toString())
    const spliceStartIndex = ((_queryParams.length - 1) === indexOfTargetJobCategoryId) ? indexOfTargetJobCategoryId : indexOfTargetJobCategoryId + 1

    _queryParams.splice(spliceStartIndex)

    return `/job-viz/${mainLevel}/${targetLevel}/${_queryParams.join('/')}`;
}



module.exports = getNewUrl;