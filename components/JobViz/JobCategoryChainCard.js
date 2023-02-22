/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-no-undef */

import { useContext } from 'react';
import { Button, Card } from 'react-bootstrap';
import { IoNewspaperOutline } from 'react-icons/io5';
import { ModalContext } from "../../providers/ModalProvider";

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

const JobCategoryChainCard = ({ jobCategory, index }) => {
    const { _selectedJob } = useContext(ModalContext);
    const [, setSelectedJob] = _selectedJob;

    const handleBtnClick = () => {
        setSelectedJob(jobCategory ?? jobsAllInfo);
    }

    return (
        <Card key={index ?? "0"} className="jobVizCard border-0 shadow">
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
                        <Button
                            id="jobVizBtnSearch"
                            className="d-flex justify-content-center align-items-center job-categories-btn"
                            onClick={handleBtnClick}
                        >
                            <span className="w-25 h-100 d-flex justify-content-center align-items-center">
                                <IoNewspaperOutline />
                            </span>
                            <span className="w-75 h-100 d-flex justify-content-center align-items-center ps-1">
                                Details
                            </span>
                        </Button>
                    </section>
                </section>
            </Card.Body>
        </Card>
    )
}

export default JobCategoryChainCard;