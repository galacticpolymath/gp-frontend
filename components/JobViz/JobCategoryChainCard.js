/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-tag-spacing */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-no-undef */

import { useContext } from 'react';
import { Card } from 'react-bootstrap';
import { ModalContext } from "../../providers/ModalProvider";
import DetailsBtn from './Buttons/Details';

const jobsAllInfo = {
    "id": 1,
    "title": "Total, all",
    "soc_code": "00-0000",
    "occupation_type": "Summary",
    "hierarchy": 0,
    "path": "",
    "employment_2021": 158134700,
    "employment_2031": 166452100,
    "employment_change_2021-31": 8317.4,
    "percent_employment_change_2021-31": 5.3,
    "percent_self_employed_2021": 6.3,
    "occupational_openings_2021-31_annual_average": 19532.5,
    "median_annual_wage_2021": "45760",
    "typical_education_needed_for_entry": "Data Unavailable",
    "work_experience_in_a_related_occupation": "Data Unavailable",
    "typical_on-the-job_training_needed_to_attain_competency_in_the_occupation": "Data Unavailable",
    "def": "No definition found for this Summary Category.",
    "median_wage_col": "#472B7AFF",
    "percent_employment_change_col": "#CF4C74FF",
}

const JobCategoryChainCard = ({ jobCategory, index, isSearchResultsChainPresent }) => {
    const { _selectedJob } = useContext(ModalContext);
    const [, setSelectedJob] = _selectedJob;


    return (
        <Card key={index ?? "0"} className="jobVizCard border-0 shadow" id='jobCategoryChainCard' >
            <Card.Body className="position-relative d-flex flex-column justify-content-end jobVizCardBody">
                <section className="position-relative iconSec">
                    <div className="jobVizIconContainer rounded-circle shadow position-absolute">
                        <img
                            src="/imgs/jobViz/branch-job-categories-search.jpg"
                            alt="Galactic_Polymath_JobViz_Icon_Search"
                            className='jobVizIcon rounded-circle'
                        />
                    </div>
                </section>
                <section className="jobVizCard-buttonSec">
                    <h4 id="currentJobCategoryHeaderTxt" className='text-muted text-center'>{jobCategory?.categoryName?.toUpperCase() ?? "Job Categories"}</h4>
                    <section className="d-flex justify-content-center align-items-center w-100">
                        {isSearchResultsChainPresent ?
                            <DetailsBtn
                                jobToShowInModal={jobCategory ?? jobsAllInfo}
                                setSelectedJob={setSelectedJob}
                            />
                            :
                            <span style={{ maxWidth: 230, wordWrap: 'break-word' }} className='mt-2 text-muted fst-italic text-center d-block w-100'>Click to explore a job category</span>
                        }

                    </section>
                </section>
            </Card.Body>
        </Card>
    )
}

export default JobCategoryChainCard;