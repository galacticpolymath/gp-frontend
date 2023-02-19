/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */

import { useRouter } from "next/router";
import { useGetJobCategories } from "../../customHooks/useGetJobCategories";


const JobCategoryChain = ({ categoryName, index, isBrick, hierarchyNum, parentLevel, id }) => {
    const src = isBrick ? '/imgs/jobViz/jobVizBrick.jpg' : '/imgs/jobViz/branch-job-categories-search.jpg';
    const router = useRouter();
    const params = router.query?.['search-results'] ?? null;

    const handleBtnClick = () => {
        console.log({ hierarchyNum: hierarchyNum, parentLevel: parentLevel })
        

        // WHAT I HAVE: 
        // THE URL: http://localhost:3000/job-viz/4/17-2070/120/128/135
        // 135 is the current id that the user is on 
        // the hierarchy num of 128 is passed as a prop for this function 

        // GOAL #1: get the hierarchy number and targeted level
        // WHAT I NEED:
        // the hierarchy number http://localhost:3000/job-viz/{thisValueHere}/17-2070/120/128/135 (H)
        // and the target level: jobData['level${hierarchyNum}']}] http://localhost:3000/job-viz/4/{thisValHere}/120/128/135 = Y
        
        // BRAIN DUMPS:
        // get the target jobVizData object from jobVizData array by using the id, call this object A 
        // get the hierarchy number for that object, add one to it  
        // get the current level, by implementing the following:
        // A['level${hierarchyNum}']}], this value will be the target level (Y)
        // the hierarchy number for that object, add one to it, this will be (H)  

        // GOAL: get the above values, hierarchy number and target level for the new url 
        // the hierarchy number and the target level, has been accessed 
        // A['level${A.hierarchyNumber}']}], this value will be the target level (Y)
        // get the Y (target level), by implementing the above: 
        // add one to it, this will be H
        // the hierarchy number 
        // call this object A
        // jobVizData target object was attained from the jobVizData array by using the id 
        // using the id, get the targeted jobVizData object from the jobVizData array
        // the id was attained for the specific job category that the user clicked on 
        // the user clicks on one of the job categories button 

        // CASE: the user wants to go to the second level, the user is currently on the fourth level 
        // GOAL #2: the third level and the fourth level were spliced out of the url
        // splice the array A starting from 1 and deleting the last element as well 
        // splice array A starting from 0 and ending with the second element splice(0, 2)
        // get the query params (router.query['search-results']), call it array A

        // CASE: the user is wants to go to third level, the user is currently on the fourth level
        // GOAL #3: the fourth level was spliced out of the url, the new path is now: http://localhost:3000/job-viz/4/17-2070/120/128/
        // you now have these elements for the levels: '/120/128/'
        // delete the last element of arrayA
        // the id is the last element of A
        // if the id is the last element of A, then delete the last element
        // get the index of the hierarchyNum 
        // splice the first two elements 
        // get the query params (router.query['search-results']), call it array A 

        // GOAL: go to the new url with the given values: hierarchyNum/targetLevel/levelNumX/levelNumY
    }

    return (
        <section id={`chain-${index}`} key={index} className="d-flex justify-content-center align-items-center jobVizChain">
            <section className="d-flex">
                <section>
                    <div className="position-relative jobVizChainIconContainer">
                        <img
                            src={src} alt="Galactic_Polymath_JobViz_Icon_Search"
                            className='jobVizIcon position-absolute'
                        />
                    </div>
                </section>
                <section className="moveLeftJobViz d-flex justify-content-center align-items-center">
                    <button className='no-btn-styles text-center jobViz-chain-txt text-nowrap' onClick={handleBtnClick}>
                        {categoryName.toUpperCase()}
                    </button>
                </section>
            </section>
        </section>
    )
};

export default JobCategoryChain;