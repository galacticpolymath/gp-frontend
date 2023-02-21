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
// summary item, at the second level 
const selectedJobCategoryTest3 = jobVizData.find(({ id }) => id === 1009);
// summary item, at the second level
const selectedJobCategoryTest4 = jobVizData.find(({ id }) => id === 490);
// line item, at the fourth level
const selectedJobCategoryTest5 = jobVizData.find(({ id }) => id === 494);
// third level, summary item
const selectedJobCategoryTest6 = jobVizData.find(({ id }) => id === 492);
// line item at the third level
const selectedJobCategoryTest7 = jobVizData.find(({ id }) => id === 1091);
// line item at level four
const selectedJobCategoryTest8 = jobVizData.find(({ id }) => id === 1090);
// line item at third level
const selectedJobCategoryTest9 = jobVizData.find(({ id }) => id === 93);
// summary item at level one
const selectedJobCategoryTest10 = jobVizData.find(({ id }) => id === 742);
// summary item at level 3
const selectedJobCategoryTest11 = jobVizData.find(({ id }) => id === 546);
// summary item at level 3
const selectedJobCategoryTest12 = jobVizData.find(({ id }) => id === 513);
// summary item at level 3
const selectedJobCategoryTest13 = jobVizData.find(({ id }) => id === 580);
const selectedJobCategoryTest14 = jobVizData.find(({ id }) => id === 67);
const selectedJobCategoryTest15 = jobVizData.find(({ id }) => id === 1050);
const selectedJobCategoryTest16 = jobVizData.find(({ id }) => id === 47);
const test14CorrectResult = '/3/13-1000/51/52'
const test15CorrectResult = '/3/53-1000/1047/1048'
const test16CorrectResult = '/4/11-9170/2/27/47'


const test1CorrectResult = '/4/45-4020/742/756/758'
const test2CorrectResult = '/2/35-0000/558'
const test3CorrectResult = '/3/51-9000/907/1009'
const test4CorrectResult = '/3/29-9000/412/490'
const test5And6CorrectResult = '/4/29-9090/412/490/492'
const test7CorrectResult = '/3/53-6000/1047/1085'
const test8CorrectResult = '/4/53-6030/1047/1085/1088'
// was failing after modification of fn
const test9CorrectResult = '/3/15-1200/92/93'
const test10CorrectResult = '/2/45-0000/742'
const test11CorrectResult = '/3/33-9000/522/546'
const test12CorrectResult = '/4/31-9090/497/511/513'
const test13CorrectResult = '/3/35-9000/558/576'



test("Get the path of the selected search result.", () => {
    // const newPathsTest1 = getPathsOfSearchResult(selectedJobCategoryTest1);

    // expect(newPathsTest1).toBe(test1CorrectResult)    

    // const newPathsTest2 = getPathsOfSearchResult(selectedJobCategoryTest2);

    // expect(newPathsTest2).toBe(test2CorrectResult)  

    // const newPathsTest3 = getPathsOfSearchResult(selectedJobCategoryTest3);

    // expect(newPathsTest3).toBe(test3CorrectResult)  

    // const newPathsTest4 = getPathsOfSearchResult(selectedJobCategoryTest4);

    // expect(newPathsTest4).toBe(test4CorrectResult)  

    // const newPathsTest5 = getPathsOfSearchResult(selectedJobCategoryTest5);

    // expect(newPathsTest5).toBe(test5And6CorrectResult)  

    // const newPathsTest6 = getPathsOfSearchResult(selectedJobCategoryTest6);

    // expect(newPathsTest6).toBe(test5And6CorrectResult)  

    // const newPathsTest7 = getPathsOfSearchResult(selectedJobCategoryTest7);

    // expect(newPathsTest7).toBe(test7CorrectResult)  

    const newPathsTest9 = getPathsOfSearchResult(selectedJobCategoryTest9);

    expect(newPathsTest9).toBe(test9CorrectResult)  

    // const newPathsTest8 = getPathsOfSearchResult(selectedJobCategoryTest8);

    // expect(newPathsTest8).toBe(test8CorrectResult)  

    // const newPathsTest10 = getPathsOfSearchResult(selectedJobCategoryTest10);

    // expect(newPathsTest10).toBe(test10CorrectResult)  

    // const newPathsTest11 = getPathsOfSearchResult(selectedJobCategoryTest11);

    // expect(newPathsTest11).toBe(test11CorrectResult)  
    
    // const newPathsTest12 = getPathsOfSearchResult(selectedJobCategoryTest12);

    // expect(newPathsTest12).toBe(test12CorrectResult)

    // const newPathsTest13 = getPathsOfSearchResult(selectedJobCategoryTest13);

    // expect(newPathsTest13).toBe(test13CorrectResult)  

    // const newPathsTest14 = getPathsOfSearchResult(selectedJobCategoryTest14);

    // expect(newPathsTest14).toBe(test14CorrectResult)  

    // const newPathsTest15 = getPathsOfSearchResult(selectedJobCategoryTest15);

    // expect(newPathsTest15).toBe(test15CorrectResult)  

    const newPathsTest16 = getPathsOfSearchResult(selectedJobCategoryTest16);

    expect(newPathsTest16).toBe(test16CorrectResult)  
})
