/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
const jobVizData = require('../data/Jobviz/jobVizData.json');

const getSearchResults = (searchInput) => {
    const searchResultsFiltered = jobVizData.filter(({ title }) => title.includes(searchInput))
    let groupedSearchResults = [];
    
    searchResultsFiltered.forEach(job => {
        const firstLetter = job.title[0];

        if (groupedSearchResults.length === 0) {
            groupedSearchResults.push({ letter: firstLetter, jobs: [job] });
            return
        }

        const targetGroup = groupedSearchResults.find(({ letter }) => letter === firstLetter);

        if (targetGroup) {
            targetGroup.jobs.push(job);
            const targetGroupIndex = groupedSearchResults.findIndex(({ letter }) => letter === firstLetter);
            groupedSearchResults.splice(targetGroupIndex, 1, targetGroup);
            return
        }

        groupedSearchResults.push({ letter: firstLetter, jobs: [job] });
    })

    return groupedSearchResults;
}

module.exports = getSearchResults;



