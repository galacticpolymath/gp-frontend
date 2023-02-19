/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
const jobVizData = require('../../data/Jobviz/jobVizData.json');

const getParentJobCategories = jobCategoryIds => {
    //GOAL: this function will get the parent job categories based on the hierarchy and level values
    // brain dump:
    //using the hierarchy num, subtract one to it, and perform a find in the jobVizData using the following conditions:
    // hierarchy: hierarchyNum - 1
    // previous level (level + (hierarchyNum - 1)) === level

    // WHAT DO I HAVE:
    // level
    // hierarchyNum
    // jobVizData
    // the ids in that comes from the params of the url 

    // GOAL: display the parent job categories in the card. So if "more jobs" button was clicked for "Arts, design, etc", then "Arts, design, etc" should be displayed on the card  
    // the array is attained of all of the job categories that will be displayed onto the UI 
    // pseudo-code: for each iteration of jobVizData, if the id is in the array of jobCategoryIds, include it in the array that will be returned from the filter function. Else, exclude it.  
    // get all of the target objects from jobVizData by filtering them against the ids params that was passed for this function
    let parentJobCategories = jobVizData.filter(({ id }) => jobCategoryIds.includes(id));
    return [{ categoryName: "Job Categories", hierarchyNum: null, level: null }, ...parentJobCategories]
}

// the ids of the following in the exact order
// results = "Job Categories", "Architecture and engineering", "Engineers", "Electrical and electronics engineers"

module.exports = getParentJobCategories;