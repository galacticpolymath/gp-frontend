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
        // GOAL: group all jobs by the starting letter of the title
        // each job is grouped based on its starting letter
        // the for each has been completed
        // update groupedSearchResults, by performing a splice(the index of the target group, targetGroup)
        // add the new job to targetGroup.jobs
        // get the target group, call it targetGroup
        // find the target group by its index 
        // if the group already exists, push the job into the group. Perform the algorithm above:
        // if the group does not exist, create the group and push the job into the group. group DS example: { letter: 'A', jobs: [job] }
        // check if the letter group exists in the groupedSearchResults
        // the first letter of the title has been attained
        // for each iteration, get the title of the job and get the first letter of the title
        const firstLetter = job.title[0];
        console.log("firstLetter: ", firstLetter)

        if (groupedSearchResults.length === 0) {
            groupedSearchResults.push({ letter: firstLetter, jobs: [job] });
            return
        }

        const targetGroup = groupedSearchResults.find(({ letter }) => letter === firstLetter);

        if (targetGroup) {
            targetGroup.jobs.push(job);
            // find the target group by its index in the array of groupedSearchResults
            const targetGroupIndex = groupedSearchResults.findIndex(({ letter }) => letter === firstLetter);
            // given the index above and the targetGroup, splice the groupedSearchResults array
            groupedSearchResults.splice(targetGroupIndex, 1, targetGroup);
            return
        }

        groupedSearchResults.push({ letter: firstLetter, jobs: [job] });
    })

    return groupedSearchResults;
}

module.exports = getSearchResults;



