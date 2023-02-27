/* eslint-disable no-debugger */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */

export const getJobCategoryIds = (_jobCategoryIds, currentJobsCategoryId) => {
    let jobCategoryIds = [..._jobCategoryIds]
    jobCategoryIds.splice(0, 2)
    jobCategoryIds.push(currentJobsCategoryId)

    return jobCategoryIds
}