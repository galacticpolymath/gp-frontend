/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */

const getPathsOfSearchResult = require("../../helperFns/getPathsOfSearchResult")
const jobVizData = require("../../data/Jobviz/jobVizData.json")

// line item at level 4
const selectedJobCategoryTest1 = jobVizData.find(({ id }) => id === 759);
// summary item at level 2
const selectedJobCategoryTest2 = jobVizData.find(({ id }) => id === 558);
// line item at level 2
const selectedJobCategoryTest3 = jobVizData.find(({ id }) => id === 1009);
// third level summary item
const selectedJobCategoryTest4 = jobVizData.find(({ id }) => id === 490);

const test1CorrectResult = '/4/45-4020/742/756/758'
const test2CorrectResult = '/2/35-0000/558'
const test3CorrectResult = '/2/51-0000/907'
const test4CorrectResult = '/3/29-9000/412/490'



test("Get the path of the selected search result.", () => {
    // const newPathsTest1 = getPathsOfSearchResult(selectedJobCategoryTest1);

    // expect(newPathsTest1).toBe(test1CorrectResult)    

    // console.log("newPathsTest1 has passed.")

    // const newPathsTest2 = getPathsOfSearchResult(selectedJobCategoryTest2);

    // expect(newPathsTest2).toBe(test2CorrectResult)  

    // const newPathsTest3 = getPathsOfSearchResult(selectedJobCategoryTest3);

    // expect(newPathsTest3).toBe(test3CorrectResult)  

    const newPathsTest4 = getPathsOfSearchResult(selectedJobCategoryTest4);

    expect(newPathsTest4).toBe(test4CorrectResult)  
})
