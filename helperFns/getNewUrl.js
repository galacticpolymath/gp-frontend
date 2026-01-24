 
 
 
 
 
 
 

// when the user clicks on a previously selected job category in the chain 
const getNewUrl = (jobCategory, queryParams) => {
    const { id, hierarchy } = jobCategory;
    const mainLevel = hierarchy + 1;
    const targetLevel = jobCategory[`level${hierarchy}`];
    const _queryParams = [...queryParams];
    const indexOfTargetJobCategoryId = _queryParams.indexOf(id.toString())
    const spliceStartIndex = ((_queryParams.length - 1) === indexOfTargetJobCategoryId) ? indexOfTargetJobCategoryId : indexOfTargetJobCategoryId + 1

    _queryParams.splice(spliceStartIndex)

    return `/jobviz/${mainLevel}/${targetLevel}/${_queryParams.join('/')}`;
}



module.exports = getNewUrl;