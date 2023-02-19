/* eslint-disable no-multiple-empty-lines */
/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
const jobVizData = require('../data/Jobviz/jobVizData.json');

// GOAL: defined the parameters for this function 

// http://localhost:3000/job-viz/main-level/filter-string/level-2/level-3/level-4

const getNewUrl = (jobCategory, queryParams) => {
    
    // this function will get the following values from the job category:
    // id
    // hierarchy (a number)
    // the queryParms

    // CASE: the user wants to go the y level (either level two or three) 
    // GOAL #1: if the hierarchy is x, then increase it by one. This value will be inserted into the url as the main-level
    // GOAL #2: get the target level, by implementing the following: jobCategory['level${hierarchy}']}], this value will be the target level (filter-string)
    // const mainLevel = 



}


// results = ("Job Categories"), ("Architecture and engineering", hierarchyNum: 1, selectedLevel ), {"Engineers", hierarchyNum: 2, selectedLevel: str  }, {"Electrical and electronics engineers", hierarchyNum: 3, selectedLevel: str}
// the array is attained from the jobVizData


module.exports = getNewUrl;