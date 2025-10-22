/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
const jobVizDataObj = require('../data/Jobviz/jobVizDataObj.json');

const getLastNumFromLevel = selectedLevel => {
    const selectedLevelSplitted = selectedLevel.split('-')
    const lastNumStr = selectedLevelSplitted[selectedLevelSplitted.length - 1];
    const firstNum = parseInt(selectedLevelSplitted[0]);

    return [firstNum, lastNumStr]
}

const filterResults = (targetHierarchyNum, selectedLevel) => {
    if (!jobVizDataObj.data.length) {
        throw new Error('No job categories found in the database.');
    }

    let targetJobCategories = jobVizDataObj.data.filter(jobCategory => {
        if (targetHierarchyNum === 2) {
            const targetLevel = jobCategory[`level${targetHierarchyNum - 1}`];
            return ((jobCategory.hierarchy === parseInt(targetHierarchyNum)) && (targetLevel === selectedLevel));
        }

        if (targetHierarchyNum === 3) return jobCategory.hierarchy === 3;

        return jobCategory.hierarchy === 4;
    });

    if (targetHierarchyNum === 3) {
        let [firstNumSelectedLevel, rangeStart] = getLastNumFromLevel(selectedLevel);
        let rangeStartSplitted = rangeStart.split('');
        let rangeStartStrSecond = rangeStartSplitted[1];

        if (rangeStartStrSecond !== "0") {
            rangeStartSplitted[1] = "0";
            rangeStart = parseInt(rangeStartSplitted.join(''));
        }

        const range = [rangeStart, (((typeof rangeStart === 'string') ? parseInt(rangeStart) : rangeStart) + 1000) - 1];
        targetJobCategories = targetJobCategories.map(job => ({ ...job, range: range }));
        targetJobCategories = targetJobCategories.filter(job => {
            const { range, soc_code } = job;
            const [firstNum, lastNum] = getLastNumFromLevel(soc_code);
            const [rangeStart, rangeEnd] = range
            delete job.range;

            return ((firstNumSelectedLevel === firstNum) && (lastNum > rangeStart) && (lastNum < rangeEnd))
        })
    }

    if (targetHierarchyNum === 4) {
        targetJobCategories = targetJobCategories.filter(job => {
            const { level3, hierarchy } = job;

            return ((hierarchy === 4) && (level3 === selectedLevel));
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
