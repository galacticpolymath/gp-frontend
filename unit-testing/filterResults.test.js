/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
const filterResults = require('../customHooks/helperFns/filterResults');

const level2IdResults = [149, 128, 121]

test("Testing filter for job categories engineering.", () => {
    const targetJobCategories = filterResults(2, "17-0000");
    const targetJobCategoriesIds = targetJobCategories.map(job => job.id);
    const areJobCategoriesIdsLevel2Correct = targetJobCategoriesIds.every(id => level2IdResults.includes(id));

    expect(areJobCategoriesIdsLevel2Correct).toBe(true);
})