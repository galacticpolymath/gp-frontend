/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
const filterResults = require('../../customHooks/helperFns/filterResults');

const level2IdResults = [149, 128, 121]
const level3IdResults = [129, 130, 131, 132, 133, 134, 135, 138, 139, 142, 143, 145, 144, 146, 147, 148]

test("Testing filter for job categories engineering. Results should match with one of the arrays above.", () => {
    const targetJobCategoriesLvl2 = filterResults(2, "17-0000");
    const targetJobCategoriesIdsLvl2 = targetJobCategoriesLvl2.map(job => job.id);
    const areJobCategoriesIdsLevel2Correct = targetJobCategoriesIdsLvl2.every(id => level2IdResults.includes(id));

    expect(areJobCategoriesIdsLevel2Correct).toBe(true);

    const targetJobCategoriesLvl3 = filterResults(3, "17-2000");
    const targetJobCategoriesIdsLvl3 = targetJobCategoriesLvl3.map(job => job.id);
    const areJobCategoriesIdsLevel3Correct = targetJobCategoriesIdsLvl3.every(id => level3IdResults.includes(id));

    expect(areJobCategoriesIdsLevel3Correct).toBe(true);
})