/* eslint-disable semi */
 
/* eslint-disable indent */

export const getJobCategoryIds = (_jobCategoryIds, currentJobsCategoryId) => {
    let jobCategoryIds = [..._jobCategoryIds]
    jobCategoryIds.splice(0, 2)
    jobCategoryIds.push(currentJobsCategoryId)

    return jobCategoryIds
}