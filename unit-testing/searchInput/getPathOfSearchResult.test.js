/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */

const { getPathsOfSearchResult } = require("../../helperFns/getPathsOfSearchResult")
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
// job id that produces errors
// [647, 664, 727, 728,729, 807, 808, 809,810, 811, 812, 965,966]
// summary item at level 3
const selectedJobCategoryTest13 = jobVizData.find(({ id }) => id === 580);
const selectedJobCategoryTest14 = jobVizData.find(({ id }) => id === 67);
const selectedJobCategoryTest15 = jobVizData.find(({ id }) => id === 1050);
const selectedJobCategoryTest16 = jobVizData.find(({ id }) => id === 47);
const selectedJobCategoryTest17 = jobVizData.find(({ id }) => id === 94);
const selectedJobCategoryTest18 = jobVizData.find(({ id }) => id === 231);
const selectedJobCategoryTest19 = jobVizData.find(({ id }) => id === 499);
const selectedJobCategoryTest20 = jobVizData.find(({ id }) => id === 561);
const selectedJobCategoryTest21 = jobVizData.find(({ id }) => id === 584);
const selectedJobCategoryTest22 = jobVizData.find(({ id }) => id === 593);
const selectedJobCategoryTest23 = jobVizData.find(({ id }) => id === 594);
const selectedJobCategoryTest24 = jobVizData.find(({ id }) => id === 595);
const selectedJobCategoryTest25 = jobVizData.find(({ id }) => id === 634);
const selectedJobCategoryTest26 = jobVizData.find(({ id }) => id === 964);
const selectedJobCategoryTest27 = jobVizData.find(({ id }) => id === 647);
const selectedJobCategoryTest28 = jobVizData.find(({ id }) => id === 664);
const selectedJobCategoryTest29 = jobVizData.find(({ id }) => id === 727);
const selectedJobCategoryTest30 = jobVizData.find(({ id }) => id === 728);
const selectedJobCategoryTest31 = jobVizData.find(({ id }) => id === 729);
const selectedJobCategoryTest32 = jobVizData.find(({ id }) => id === 807);
const selectedJobCategoryTest33 = jobVizData.find(({ id }) => id === 808);
const selectedJobCategoryTest34 = jobVizData.find(({ id }) => id === 809);
const selectedJobCategoryTest35 = jobVizData.find(({ id }) => id === 810);
const selectedJobCategoryTest36 = jobVizData.find(({ id }) => id === 811);
const selectedJobCategoryTest37 = jobVizData.find(({ id }) => id === 812);
const selectedJobCategoryTest38 = jobVizData.find(({ id }) => id === 965);
const selectedJobCategoryTest39 = jobVizData.find(({ id }) => id === 966);
const test27CorrectResult = '/3/41-1000/644/645'
const test28CorrectResult = '/3/41-4000/644/662'
const test29And30n31CorrectResults = '/3/43-6000/677/725'
const test32n33n34n35n36n37CorrectResults = '/3/47-3000/763/805'
const test38n39CorrectResults = '/3/51-5100/907/963'
const test22And23And24CorrectResult = "/3/37-3000/581/591"
const test25CorrectResult = "/3/39-6000/596/632"
const test26CorrectResult = "/3/51-5100/907/963"
const test21CorrectResult = '/3/37-1000/581/582'
const test20CorrectResult = '/3/35-1000/558/559'
const test18CorrectResult = '/3/19-5000/166/229'
const test19CorrectResult = '/3/31-1100/497/498'
const test14CorrectResult = '/3/13-1000/51/52'
const test15CorrectResult = '/3/53-1000/1047/1048'
const test16CorrectResult = '/4/11-9170/2/27/47'
const test17CorrectResult = '/4/15-1210/92/93/94'


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

    const newPathsTest9 = getPathsOfSearchResult(selectedJobCategoryTest9);

    expect(newPathsTest9).toBe(test9CorrectResult)

    const newPathsTest8 = getPathsOfSearchResult(selectedJobCategoryTest8);

    expect(newPathsTest8).toBe(test8CorrectResult)

    const newPathsTest10 = getPathsOfSearchResult(selectedJobCategoryTest10);

    expect(newPathsTest10).toBe(test10CorrectResult)

    const newPathsTest11 = getPathsOfSearchResult(selectedJobCategoryTest11);

    expect(newPathsTest11).toBe(test11CorrectResult)

    const newPathsTest12 = getPathsOfSearchResult(selectedJobCategoryTest12);

    expect(newPathsTest12).toBe(test12CorrectResult)

    const newPathsTest13 = getPathsOfSearchResult(selectedJobCategoryTest13);

    expect(newPathsTest13).toBe(test13CorrectResult)

    const newPathsTest14 = getPathsOfSearchResult(selectedJobCategoryTest14);

    expect(newPathsTest14).toBe(test14CorrectResult)

    const newPathsTest15 = getPathsOfSearchResult(selectedJobCategoryTest15);

    expect(newPathsTest15).toBe(test15CorrectResult)

    const newPathsTest16 = getPathsOfSearchResult(selectedJobCategoryTest16);

    expect(newPathsTest16).toBe(test16CorrectResult)

    const newPathsTest17 = getPathsOfSearchResult(selectedJobCategoryTest17);

    expect(newPathsTest17).toBe(test17CorrectResult)

    const newPathsTest18 = getPathsOfSearchResult(selectedJobCategoryTest18);

    expect(newPathsTest18).toBe(test18CorrectResult)

    const newPathsTest19 = getPathsOfSearchResult(selectedJobCategoryTest19);

    expect(newPathsTest19).toBe(test19CorrectResult)

    const newPathsTest20 = getPathsOfSearchResult(selectedJobCategoryTest20);

    expect(newPathsTest20).toBe(test20CorrectResult)

    const newPathsTest21 = getPathsOfSearchResult(selectedJobCategoryTest21);

    expect(newPathsTest21).toBe(test21CorrectResult)

    const newPathsTest22 = getPathsOfSearchResult(selectedJobCategoryTest22);

    expect(newPathsTest22).toBe(test22And23And24CorrectResult)

    const newPathsTest23 = getPathsOfSearchResult(selectedJobCategoryTest23);

    expect(newPathsTest23).toBe(test22And23And24CorrectResult)

    const newPathsTest24 = getPathsOfSearchResult(selectedJobCategoryTest24);

    expect(newPathsTest24).toBe(test22And23And24CorrectResult)

    const newPathsTest25 = getPathsOfSearchResult(selectedJobCategoryTest25);

    expect(newPathsTest25).toBe(test25CorrectResult)

    const newPathsTest26 = getPathsOfSearchResult(selectedJobCategoryTest26);

    expect(newPathsTest26).toBe(test26CorrectResult)

    const newPathsTest27 = getPathsOfSearchResult(selectedJobCategoryTest27);

    expect(newPathsTest27).toBe(test27CorrectResult)

    const newPathsTest28 = getPathsOfSearchResult(selectedJobCategoryTest28);

    expect(newPathsTest28).toBe(test28CorrectResult)

    const newPathsTest29 = getPathsOfSearchResult(selectedJobCategoryTest29);

    expect(newPathsTest29).toBe(test29And30n31CorrectResults)

    const newPathsTest30 = getPathsOfSearchResult(selectedJobCategoryTest30);

    expect(newPathsTest30).toBe(test29And30n31CorrectResults)

    const newPathsTest31 = getPathsOfSearchResult(selectedJobCategoryTest31);

    expect(newPathsTest31).toBe(test29And30n31CorrectResults)

    const newPathsTest32 = getPathsOfSearchResult(selectedJobCategoryTest32);

    expect(newPathsTest32).toBe(test32n33n34n35n36n37CorrectResults)

    const newPathsTest33 = getPathsOfSearchResult(selectedJobCategoryTest33);

    expect(newPathsTest33).toBe(test32n33n34n35n36n37CorrectResults)

    const newPathsTest34 = getPathsOfSearchResult(selectedJobCategoryTest34);

    expect(newPathsTest34).toBe(test32n33n34n35n36n37CorrectResults)

    const newPathsTest35 = getPathsOfSearchResult(selectedJobCategoryTest35);

    expect(newPathsTest35).toBe(test32n33n34n35n36n37CorrectResults)

    const newPathsTest36 = getPathsOfSearchResult(selectedJobCategoryTest36);

    expect(newPathsTest36).toBe(test32n33n34n35n36n37CorrectResults)

    const newPathsTest37 = getPathsOfSearchResult(selectedJobCategoryTest37);

    expect(newPathsTest37).toBe(test32n33n34n35n36n37CorrectResults)

    const newPathsTest38 = getPathsOfSearchResult(selectedJobCategoryTest38);

    expect(newPathsTest38).toBe(test38n39CorrectResults)

    const newPathsTest39 = getPathsOfSearchResult(selectedJobCategoryTest39);

    expect(newPathsTest39).toBe(test38n39CorrectResults)
})
