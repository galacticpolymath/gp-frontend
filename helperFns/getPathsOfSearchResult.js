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
            
            if(isOnLevel2 && isThereANonZeroNumSteInHundredsPlace && !(levelN === "15-1200")){
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


const getPathsOfSearchResult = jobCategory => {
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