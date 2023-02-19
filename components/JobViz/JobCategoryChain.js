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
    const { getNewJobsData } = useGetJobCategories(params?.[0] ?? null, params?.[1] ?? null );

    const handleBtnClick = () => {
        console.log({ hierarchyNum: hierarchyNum, parentLevel: parentLevel })
        // Get the parent sec for the next level 

        // const pathUpdated = `/job-viz/${nextLevelNum}/${level}/${jobCategoryIds.join('/')}`
        // router.push({ pathname: pathUpdated }, null, { scroll: false })


        // GOAL: the user wants to get back to the previous level: "Architecture and engineering." The user is on "Electrical and electronics engineers". The end goal is to have the url to be as follows: http://localhost:3000/job-viz/2/17-0000/120

        // WHAT I HAVE: 
        // THE URL: http://localhost:3000/job-viz/4/17-2070/120/128/135
        // 135 is the current id that the user is on 
        // the hierarchy num of 128 is passed as a prop for this function 

        // GOAL #1: get the hierarchy number and targeted level
        // WHAT I NEED:
        // the hierarchy number http://localhost:3000/job-viz/{thisValueHere}/17-2070/120/128/135
        // and the target level: jobData['level${hierarchyNum}']}] http://localhost:3000/job-viz/4/{thisValHere}/120/128/135
        

        // GOAL: get the above values, hierarchy number and target level for the new url 
        // the hierarchy number and target level has been attained 
        // the hierarchy number was accessed for the jobVizData target object
        // the target level was accessed for the jobVizData target object
        // jobVizData target object was attained from the jobVizData array by using the array 
        // the id was attained for the targeted job category button 
        // the user clicks on one of the job categories button 

        // CASE: the user second second level
        // GOAL #2: the third level and the fourth level were spliced out of the url
        // splice the array A starting from 1 and deleting the last element as well 
        // splice array A starting from 0 and ending with the second element splice(0, 2)
        // get the query params (router.query['search-results']), call it array A

        // CASE: the user is wants to go to third level
        // GOAL #3: the fourth level was spliced out of the url, the new path is now: http://localhost:3000/job-viz/4/17-2070/120/128/
        // delete the last element of arrayA
        // the id is the last element of A
        // if the id is the last element of A, then delete the last element
        // get the index of the hierarchyNum 
        // splice the first two elements 
        // get the query params (router.query['search-results']), call it array A 

        // GOAL: get the job categories for the new data
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