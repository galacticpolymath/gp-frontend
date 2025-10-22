/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-undef */
/* eslint-disable quotes */

const filterResults = require('../../../helperFns/filterResults');

const correctResults = [442, 443, 444, 445, 446, 447, 448, 449, 451, 452, 453, 454]

test("Getting results when the user clicks on the Physicians job summary.", () => {
    const jobCategories = filterResults(4, "29-1210")
    const jobCategoriesIds = jobCategories.map(job => job.id).sort()
    const areJobCategoriesResultsCorrect = JSON.stringify(jobCategoriesIds) === JSON.stringify(correctResults)


    expect(areJobCategoriesResultsCorrect).toEqual(true)
})