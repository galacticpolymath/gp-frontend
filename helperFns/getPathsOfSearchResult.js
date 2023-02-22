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
    return (jobCategory?.hierarchy > firstParentJobCategory?.hierarchy) ? jobCategory : firstParentJobCategory;
});

const exceptionsAtLevel2 = ["15-1200", "31-1100"]

const getParentJobCategoryAtNLvl = (jobCategory, num) => {
    const levelFieldName = `level${num}`
    const levelN = jobCategory[levelFieldName];
    const parentJobCategoryAtNLvl = jobVizData.find(({ soc_code, occupation_type }) => (soc_code === levelN) && (occupation_type === "Summary"));

    return parentJobCategoryAtNLvl;
}

const getAllParentJobCategories = (jobCategory, _num) => {
    let targetLevels = [];
    let num = _num;

    // check if num is a number
    if ((typeof num !== "number") || isNaN(num)) {
        return { didErr: true };
    }

    while (!(num <= 0)) {
        const levelFieldName = `level${num}`
        let levelN = jobCategory[levelFieldName];
        let parentJobCategoryAtNLvl = jobCategory;

        if (jobCategory.soc_code !== levelN){
            // if on level 2 and "level2": "15-1200", then insert "15-1200" into levelN 
            const isOnLevel2 = levelFieldName === "level2"
            let levelNSplitted = levelN.split("-")
            let levelNFirstNumStr = levelNSplitted[0]
            let levelNLastNumStr = levelNSplitted[1]
            // levelNLastNumStr will always be a thousand number. Check if there is a digit greater than 0 in the hundreds place 
            let isThereANonZeroNumSteInHundredsPlace = (levelNLastNumStr % 1000) > 0
            
            if(isOnLevel2 && isThereANonZeroNumSteInHundredsPlace && !exceptionsAtLevel2.includes(levelN)){
                levelNLastNumStr = levelNLastNumStr - (levelNLastNumStr % 1000)
                levelN = `${levelNFirstNumStr}-${levelNLastNumStr}`
            }

            parentJobCategoryAtNLvl = jobVizData.find(({ soc_code, occupation_type }) => (soc_code === levelN) && (occupation_type === "Summary"));
        }
        



        targetLevels.push(parentJobCategoryAtNLvl)
        num--;
    }

    return { targetLevels: targetLevels };
}

// 1) if the jobCategory is at level4 and the occupation_type === "Line item", find the parent job category at level3 by implementing the following algorithm:
// jobVizData.find(({ soc_code, occupation_type }) => (soc_code === jobCategory.level3) && (occupation_type === "Summary"));

// 2) if undefined, then modify the jobCategory object implement the following:
// insert hierarchy4 into 3
// delete hierarchy4
// change hierarchy to 3
// change the path to: level1/level2/level3





const getPathsOfSearchResult = _jobCategory => {
    let jobCategory = _jobCategory;

    if((jobCategory.hierarchy === 4) && !getParentJobCategoryAtNLvl(jobCategory, 3)){
        jobCategory.level3 = jobCategory.level4;
        delete jobCategory.level4;
        jobCategory.hierarchy = 3;
        const { level1, level2, level3 } = jobCategory;
        jobCategory.path = `${level1}/${level2}/${level3}`
    }

    const { hierarchy, occupation_type } = jobCategory;
    const isLineItem = occupation_type === "Line item"
    const numForWhileLoop = ((hierarchy === 1) || (hierarchy === 2) || ((hierarchy === 3) && !isLineItem)) ? hierarchy : (hierarchy - 1)
    let { targetLevels, didErr } = getAllParentJobCategories(jobCategory, numForWhileLoop);

    if (didErr) {
        return { didErr: true }
    }

    const firstParentJobCategory = getFirstParentJobCategory(targetLevels);
    const { hierarchy: firstParentJobCategoryHierarchy, soc_code } = firstParentJobCategory
    targetLevels = targetLevels.sort((levelA, levelB) => levelA.hierarchy - levelB.hierarchy);

    return `/${firstParentJobCategoryHierarchy + 1}/${soc_code}/${targetLevels.map(({ id }) => id).join('/')}`
}

module.exports = getPathsOfSearchResult