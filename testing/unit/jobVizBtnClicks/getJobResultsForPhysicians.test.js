 
 
 
 
 
 

const filterResults = require('../../../helperFns/filterResults');

const correctResults = [442, 443, 444, 445, 446, 447, 448, 449]

test("Getting results when the user clicks on the Physicians job summary.", () => {
    const jobCategories = filterResults(4, "29-1210")
    const jobCategoriesIds = jobCategories.map(job => job.id).sort()

    console.log("jobCategoriesIds: ", jobCategoriesIds);

    const areJobCategoriesResultsCorrect = JSON.stringify(jobCategoriesIds) === JSON.stringify(correctResults)


    expect(areJobCategoriesResultsCorrect).toEqual(true)
})
