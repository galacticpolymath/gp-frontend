 
 
 
 
 
 
 
// const jobVizData = require('../data/Jobviz/jobVizData.json');
const jobVizDataObj = require('../data/Jobviz/jobVizDataObj.json');

const getSearchResultsAsync = (searchInput) => {
    return new Promise((resolve, reject) => {
        try {
            const searchResultsFiltered = jobVizDataObj.data.filter(({ title }) => title.toLowerCase().includes(searchInput))
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
            // sort groupedSearchResults by letter
            groupedSearchResults.sort((searchResultA, searchResultB) => (searchResultA.letter > searchResultB.letter) ? 1 : -1);
            // sort the jobs array alphabetically
            groupedSearchResults.forEach(searchResult => searchResult.jobs.sort((jobA, jobB) => (jobA.title > jobB.title) ? 1 : -1));

            resolve(groupedSearchResults);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = getSearchResultsAsync;



