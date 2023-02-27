/* eslint-disable no-debugger */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable indent */

const getNewPathsWhenMOdalCloses = paths => {
    const [currentHierarchyNum, currentLevel] = paths;
    const newJobCategoryIdPaths = paths.filter((_, index, self) => !([0, 1, self.length - 1].includes(index)))

    return `/${currentHierarchyNum}/${currentLevel}/${newJobCategoryIdPaths.join('/')}/`
}





module.exports = getNewPathsWhenMOdalCloses;