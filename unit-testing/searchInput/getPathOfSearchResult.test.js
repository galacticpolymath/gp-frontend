/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */

const getPathsOfSearchResult = require("../../helperFns/getPathsOfSearchResult")

// when the user clicks on LOGGING WORKERS, the following should be returned from the getPathsOfSearchResults fn:
// return val: /job-viz/4/45-4020/742/756/758

const result1 = "/job-viz/4/45-4020/742/756/758"

test("Get the path of the selected search result.", () => {
    const newPaths = getPathsOfSearchResult();

    expect(newPaths).toBe(result1)    
})
