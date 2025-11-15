/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
const filterResults = require('../../../helperFns/filterResults');

const level2IdResults = [149, 128, 121]
const level3IdResults = [129, 130, 131, 132, 133, 134, 135, 138, 139, 142, 143, 145, 144, 146, 147, 148]
const level4IdResultsElectronics = [136, 137]
const level4IdResultsIndustrial = [141, 140]

test("Testing filter for job categories engineering. Results should match with one of the arrays above.", () => {
    const targetJobCategoriesLvl2 = filterResults(2, "17-0000");
    const targetJobCategoriesIdsLvl2 = targetJobCategoriesLvl2.map(job => job.id);
    const areJobCategoriesIdsLevel2Correct = targetJobCategoriesIdsLvl2.every(id => level2IdResults.includes(id));

    expect(areJobCategoriesIdsLevel2Correct).toBe(true);

    const targetJobCategoriesLvl3 = filterResults(3, "17-2000");
    const targetJobCategoriesIdsLvl3 = targetJobCategoriesLvl3.map(job => job.id);
    const areJobCategoriesIdsLevel3Correct = targetJobCategoriesIdsLvl3.every(id => level3IdResults.includes(id));

    expect(areJobCategoriesIdsLevel3Correct).toBe(true);

    // when the user clicks on "Electrical & electronics engineers", the jobCategories should contain the following
    const targetElectronicsJobCategoriesLvl4 = filterResults(4, "17-2070");
    const targetJobElectronicsCategoriesIdsLvl4 = targetElectronicsJobCategoriesLvl4.map(job => job.id);
    const areJobElectronicsCategoriesIdsLevel4Correct = targetJobElectronicsCategoriesIdsLvl4.every(id => level4IdResultsElectronics.includes(id));

    expect(areJobElectronicsCategoriesIdsLevel4Correct).toBe(true);

    // when the user clicks on "Industrial engineers, including health & safety", the jobCategories should contain the following
    const targetJobIndustrialCategoriesLvl4 = filterResults(4, "17-2110");
    const targetJobIndustrialCategoriesIdsLvl4 = targetJobIndustrialCategoriesLvl4.map(job => job.id);
    const areJobCategoriesIndustrialIdsLevel4Correct = targetJobIndustrialCategoriesIdsLvl4.every(id => level4IdResultsIndustrial.includes(id));

    expect(areJobCategoriesIndustrialIdsLevel4Correct).toBe(true);
})