/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */


const getNewPathsWhenModalCloses = require("../../helperFns/getNewPathsWhenModalCloses")
const jobVizDataObj = require("../../data/Jobviz/jobVizDataObj.json")


// ['3', '37-1000', '581', '582']
const test1 = ["3", "37-1000", "581", "582", "584" ]

test("Get new paths when modal closes.", () => {
    const test1Result = getNewPathsWhenModalCloses(test1)

    expect(test1Result).toBe("/3/37-1000/581/582/")
})