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
import getNewUrl from "../../helperFns/getNewUrl";




const JobCategoryChain = ({ index, isBrick, jobCategory }) => {
    const src = isBrick ? '/imgs/jobViz/jobVizBrick.jpg' : '/imgs/jobViz/branch-job-categories-search.jpg';
    const router = useRouter();
    const params = router.query?.['search-results'] ?? null;

    const handleBtnClick = () => {
        if(jobCategory.categoryName === "Job Categories"){
            router.push({ pathname: '/job-viz' }, null, { scroll: false })
            return;
        }
        
        params.splice(0, 2)
        router.push({ pathname: getNewUrl(jobCategory, params) }, null, { scroll: false })
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
                        {jobCategory.categoryName.toUpperCase()}
                    </button>
                </section>
            </section>
        </section>
    )
};

export default JobCategoryChain;