/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-undef */
/* eslint-disable quotes */

const getNewUrl = require("../../helperFns/getNewUrl");

const testingPathsLevel4 = '/job-viz/4/17-2070/120/128/135'
const testingPathsLevel3 = '/job-viz/3/17-2000/120/128'
const jobCategoryA = { id: 120, hierarchy: 1, selectedLevel: "17-0000" }
const jobCategoryB = { id: 128, hierarchy: 2, selectedLevel: "17-2070" }
const level2UrlCorrectAAndC = "/job-viz/2/17-0000/120"
const level3UrlCorrectB = "/job-viz/3/17-2000/120/128"

test("Getting the new url when the user clicks on the previous job viz data on the chain.", () => {
    const newUrlResultA = getNewUrl(jobCategoryA, testingPathsLevel4)

    expect(newUrlResultA).toBe(level2UrlCorrectAAndC);

    const newUrlResultB = getNewUrl(jobCategoryB, testingPathsLevel4)

    expect(newUrlResultB).toBe(level3UrlCorrectB);

    const newUrlResultC = getNewUrl(jobCategoryB, testingPathsLevel3)

    expect(newUrlResultC).toBe(level2UrlCorrectAAndC);
})