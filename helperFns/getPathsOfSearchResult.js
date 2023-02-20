/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */

const jobVizData = require("../data/Jobviz/jobVizData.json");

const getFirstParentJobCategory = jobCategories => jobCategories.reduce((firstParentJobCategory, jobCategory) => {
    return (jobCategory?.hierarchy > firstParentJobCategory.hierarchy) ? jobCategory : firstParentJobCategory;
});

const getAllParentJobCategories = (jobCategory, _num) => {
    let targetLevels = [];
    let num = _num;

    while (num != 0) {
        const levelN = jobCategory[`level${num}`];
        const parentJobCategoryAtNLvl = jobVizData.find(({ soc_code, occupation_type }) => (soc_code === levelN) && (occupation_type === "Summary"));
        targetLevels.push(parentJobCategoryAtNLvl)
        num--;
    }

    return targetLevels;
}


const getPathsOfSearchResult = jobCategory => {

    // if(hierarchyNum === 4){   
    let targetLevels = getAllParentJobCategories(jobCategory, (jobCategory.hierarchy === 1) ? jobCategory.hierarchy : (jobCategory.hierarchy - 1));
    const firstParentJobCategory = getFirstParentJobCategory(targetLevels);
    const { hierarchy, soc_code } = firstParentJobCategory
    console.log("hierarchy: ", hierarchy)
    targetLevels = targetLevels.sort((levelA, levelB) => levelA.hierarchy - levelB.hierarchy);

    return `/${hierarchy + 1}/${soc_code}/${targetLevels.map(({ id }) => id).join('/')}`
    // }



    // BRAIN DUMP:
    // get the hierarchy number for the specific job category 
    // need to get the previous job results
    // we get the job category object from the jobVizData file



    // CASE: the user goes to a line item in hierarchy level 4 
    // the following will be pushed into the url: currentHierarchy/source_code/level2/level3/level4
    // currentHierarchy/source_code/level2/level3/level4 will pushed into the url
    // the levelN id has been attained
    // target object with levelN id has been attained
    // using jobCategory.levelN and occupation_type === "Summary"
    // get the parent job category summary levels, by doing the above:
    // get the latest parent job category level, get its source_code (this is the parent level) and its (hierarchy level + 1) == currentHierarchy  (the object with the highest number for the 'hierarchy' field)
    // a line item was clicked for on the job search 

    // if ((hierarchy === 4) && (occupation_type === "Line item")) {
    //     let targetLevels = getAllParentJobCategories(jobCategory, 3); 
    //     const firstParentJobCategory = getFirstParentJobCategory(targetLevels);
    //     const { hierarchy, soc_code } = firstParentJobCategory
    //     targetLevels = targetLevels.sort((levelA, levelB) => levelA.hierarchy - levelB.hierarchy);

    //     return `/${hierarchy + 1}/${soc_code}/${targetLevels.map(({ id }) => id).join('/')}`

    // }







    // CASE: the user goes to a summary of a level 4 job categories 



    // CASE: the user goes to a summary of level 3 job categories 



    // CASE: the user goes to a line item in level 3 job categories 



    // CASE: the user goes to a line item in level 2 job categories 



    // CASE: the user goes to a summary of level 2 job categories 
}

module.exports = getPathsOfSearchResult