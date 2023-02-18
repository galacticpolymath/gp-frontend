/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
const jobVizData = require('../../data/Jobviz/jobVizData.json');

const filterResults = (targetHierarchyNum, selectedLevel) => {
    let targetJobCategories = jobVizData.filter(jobCategory => {
        const targetLevel = jobCategory[`level${targetHierarchyNum - 1}`];
        return ((jobCategory.hierarchy === parseInt(targetHierarchyNum)) && (targetLevel === selectedLevel));
    });
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
