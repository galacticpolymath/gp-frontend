/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
import { filterResults } from "../customHooks/useGetJobCategories"

const level2IdResults = [149, 128, 121]

test("Testing filter for job categories engineering.", () => {
    const targetJobCategories = filterResults(2, "17-0000");

    expect(JSON.stringify(targetJobCategories)).toBe(JSON.stringify(level2IdResults));
})