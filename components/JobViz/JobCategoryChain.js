/* eslint-disable semi */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */

import { Button } from "react-bootstrap";


const JobCategoryChain = ({ getNewJobsData, categoryName }) => {
    return (
        <section className="d-flex justify-content-center align-items-center">
            <section className="w-50">
                <div className="position-absolute">
                    <img
                        src="/imgs/jobViz/jobVizBrick.jpg" alt="Galactic_Polymath_JobViz_Icon_Search"
                        className='jobVizIcon'
                    />
                </div>
            </section>
            <section className="w-50">
                <Button className='no-btn-styles text-center' onClick={getNewJobsData}>
                    {categoryName}
                </Button>
            </section>
        </section>
    )
};

export default JobCategoryChain;