/* eslint-disable no-multiple-empty-lines */
 
 
 
/* eslint-disable semi */
 
/* eslint-disable indent */

const getNewPathsWhenModalCloses = paths => {
    const [currentHierarchyNum, currentLevel] = paths;
    const newJobCategoryIdPaths = paths.filter((_, index, self) => !([0, 1, self.length - 1].includes(index)))

    return `/${currentHierarchyNum}/${currentLevel}/${newJobCategoryIdPaths.join('/')}/`
}





module.exports = getNewPathsWhenModalCloses;