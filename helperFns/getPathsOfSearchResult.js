/* eslint-disable no-multiple-empty-lines */
 
 
/* eslint-disable quotes */
/* eslint-disable semi */
 
/* eslint-disable indent */

const jobVizData = require("../data/Jobviz/jobVizData.json");

const getFirstParentJobCategory = jobCategories => jobCategories.reduce((firstParentJobCategory, jobCategory) => {
    return (jobCategory?.hierarchy > firstParentJobCategory?.hierarchy) ? jobCategory : firstParentJobCategory;
});

// const exceptionsAtLevel2 = ["15-1200", "31-1100"]
const exceptionsAtLevel2 = []


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

        // after doing the string manipulation above, find the object below. If the object doesn't exist. Then use the default string first (jobCategory[levelFieldName]) instead of the manipulated string. Insert that for the levelN and find the target parent job category. Do this first. 

        if (jobCategory.soc_code !== levelN) {
            // if on level 2 and "level2": "15-1200", then insert "15-1200" into levelN 
            const isOnLevel2 = levelFieldName === "level2"
            let levelNSplitted = levelN.split("-")
            let levelNFirstNumStr = levelNSplitted[0]
            let levelNLastNumStr = levelNSplitted[1]
            let isThereANonZeroNumInHundredsPlace = (levelNLastNumStr % 1000) > 0

            if (isOnLevel2 && isThereANonZeroNumInHundredsPlace) {
                levelNLastNumStr = levelNLastNumStr - (levelNLastNumStr % 1000)
                levelN = `${levelNFirstNumStr}-${levelNLastNumStr}`
            }

            parentJobCategoryAtNLvl = jobVizData.find(({ soc_code, occupation_type }) => (soc_code === levelN) && (occupation_type === "Summary"));

            if (!parentJobCategoryAtNLvl && isOnLevel2 && isThereANonZeroNumInHundredsPlace) {
                levelN = jobCategory[levelFieldName]
                parentJobCategoryAtNLvl = jobVizData.find(({ soc_code, occupation_type }) => (soc_code === levelN) && (occupation_type === "Summary"));
            }
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

    targetLevels.push(jobCategory)

    return `/${firstParentJobCategoryHierarchy + 1}/${soc_code}/${targetLevels.map(({ id }) => id).join('/')}`
}

module.exports = { getPathsOfSearchResult }