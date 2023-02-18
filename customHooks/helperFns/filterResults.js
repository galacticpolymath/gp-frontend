/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
const jobVizData = require('../../data/Jobviz/jobVizData.json');

const getLastNumFromLevel = selectedLevel => {
    const selectedLevelSplitted = selectedLevel.split('-')
    const lastNum = parseInt(selectedLevelSplitted[selectedLevelSplitted.length - 1]);
    const firstNum = parseInt(selectedLevelSplitted[0]);
    
    return [firstNum, lastNum]
}

const filterResults = (targetHierarchyNum, selectedLevel) => {
    let targetJobCategories = jobVizData.filter(jobCategory => {
        if (targetHierarchyNum === 2) {
            const targetLevel = jobCategory[`level${targetHierarchyNum - 1}`];
            return ((jobCategory.hierarchy === parseInt(targetHierarchyNum)) && (targetLevel === selectedLevel));
        }

        return jobCategory.hierarchy === 3;
    });

    if (targetHierarchyNum === 3) {
        const [firstNumSelectedLevel, rangeStart] = getLastNumFromLevel(selectedLevel);
        const range = [rangeStart, (rangeStart + 1000) - 1];
        targetJobCategories = targetJobCategories.map(job => ({ ...job, range: range }));
        targetJobCategories = targetJobCategories.filter(job => {
            const { range, soc_code } = job;
            const [firstNum, lastNum] = getLastNumFromLevel(soc_code);
            const [rangeStart, rangeEnd] = range
            delete job.range;

            return ((firstNumSelectedLevel === firstNum) && (lastNum > rangeStart) && (lastNum < rangeEnd)) 
        })
    }

    targetJobCategories = targetJobCategories.map(job => {
        const { hierarchy, id, title } = job;
        const selectedLevel = job[`level${hierarchy}`]

        return {
            ...job,
            id,
            currentLevel: selectedLevel,
            title: title
        }
    });
    return targetJobCategories;
}

module.exports = filterResults;
