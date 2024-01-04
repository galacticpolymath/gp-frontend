/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-undef */
/* eslint-disable quotes */

const getNewUrl = require("../../helperFns/getNewUrl");
const jobVizData = require("../../data/Jobviz/jobVizData.json");
const testingPathsLevel4Paths = ['4', '17-2070', '120', '128', '135']
const testingPathsLevel3Paths = ['3', '17-2000', '120', '128']
const jobCategoryA = jobVizData.find(({ id }) => id === 120)
const jobCategoryB = jobVizData.find(({ id }) => id === 128)
const level2UrlCorrectAAndC = "/jobviz/2/17-0000/120"
const level3UrlCorrectB = "/jobviz/3/17-2000/120/128"

test("Getting the new url when the user clicks on the previous job viz data on the chain.", () => {
    testingPathsLevel4Paths.splice(0, 2)

    testingPathsLevel3Paths.splice(0, 2)

    const newUrlResultA = getNewUrl(jobCategoryA, testingPathsLevel4Paths)

    // from level four to level two
    expect(newUrlResultA).toBe(level2UrlCorrectAAndC);

    const newUrlResultB = getNewUrl(jobCategoryB, testingPathsLevel4Paths)

    // from level four to level three
    expect(newUrlResultB).toBe(level3UrlCorrectB);

    const newUrlResultC = getNewUrl(jobCategoryA, testingPathsLevel3Paths)

    // from level three to level two
    expect(newUrlResultC).toBe(level2UrlCorrectAAndC);

})