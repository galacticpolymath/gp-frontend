 
 
 

export const getJobCategoryIds = (_jobCategoryIds, currentJobsCategoryId) => {
    const jobCategoryIds = [..._jobCategoryIds]
    jobCategoryIds.splice(0, 2)
    jobCategoryIds.push(currentJobsCategoryId)

    return jobCategoryIds
}