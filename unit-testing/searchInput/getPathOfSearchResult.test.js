/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */

const getPathsOfSearchResult = require("../../helperFns/getPathsOfSearchResult")
const jobVizData = require("../../data/Jobviz/jobVizData.json")

// "hierarchy": 4, line item
const selectedJobCategoryTest1 = jobVizData.find(({ id }) => id === 759);
// summary item, "hierarchy": 1
const selectedJobCategoryTest2 = jobVizData.find(({ id }) => id === 558);
// child item summary, at the second level 
const selectedJobCategoryTest3 = jobVizData.find(({ id }) => id === 1009);
// child item summary, at the second level
const selectedJobCategoryTest4 = jobVizData.find(({ id }) => id === 490);
// child item summary, at the third level
const selectedJobCategoryTest5 = jobVizData.find(({ id }) => id === 494);
// third level, main parent
const selectedJobCategoryTest6 = jobVizData.find(({ id }) => id === 492);
// line item at the third level
const selectedJobCategoryTest7 = jobVizData.find(({ id }) => id === 1091);
// line item at level four
const selectedJobCategoryTest8 = jobVizData.find(({ id }) => id === 1090);
// line item at third level
const selectedJobCategoryTest9 = jobVizData.find(({ id }) => id === 115);


const test1CorrectResult = '/4/45-4020/742/756/758'
const test2CorrectResult = '/2/35-0000/558'
const test3CorrectResult = '/3/51-9000/907/1009'
const test4CorrectResult = '/3/29-9000/412/490'
const test5And6CorrectResult = '/4/29-9090/412/490/492'
const test7CorrectResult = '/3/53-6000/1047/1085'
const test8CorrectResult = '/4/53-6030/1047/1085/1088'
const test9CorrectResult = '/3/15-1200/92/93'



test("Get the path of the selected search result.", () => {
    const newPathsTest1 = getPathsOfSearchResult(selectedJobCategoryTest1);

    expect(newPathsTest1).toBe(test1CorrectResult)    

    const newPathsTest2 = getPathsOfSearchResult(selectedJobCategoryTest2);

    expect(newPathsTest2).toBe(test2CorrectResult)  

    const newPathsTest3 = getPathsOfSearchResult(selectedJobCategoryTest3);

    expect(newPathsTest3).toBe(test3CorrectResult)  

    const newPathsTest4 = getPathsOfSearchResult(selectedJobCategoryTest4);

    expect(newPathsTest4).toBe(test4CorrectResult)  

    const newPathsTest5 = getPathsOfSearchResult(selectedJobCategoryTest5);

    expect(newPathsTest5).toBe(test5And6CorrectResult)  

    const newPathsTest6 = getPathsOfSearchResult(selectedJobCategoryTest6);

    expect(newPathsTest6).toBe(test5And6CorrectResult)  

    const newPathsTest7 = getPathsOfSearchResult(selectedJobCategoryTest7);

    expect(newPathsTest7).toBe(test7CorrectResult)  

    // const newPathsTest8 = getPathsOfSearchResult(selectedJobCategoryTest8);

    // expect(newPathsTest8).toBe(test8CorrectResult)  

    // const newPathsTest9 = getPathsOfSearchResult(selectedJobCategoryTest9);

    // expect(newPathsTest9).toBe(test9CorrectResult)  
})
