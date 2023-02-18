/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-no-undef */

import { Button, Card } from 'react-bootstrap';
import { IoNewspaperOutline } from 'react-icons/io5';

const JobCategoryChainCard = ({ jobCategoryName }) => {
    return (
        <Card className="jobVizCard border-0 shadow">
            <Card.Body className="position-relative d-flex flex-column justify-content-end">
                <div className="jobVizIconContainer rounded-circle shadow position-absolute">
                    <img
                        src="/imgs/jobViz/jobVizBrick.jpg" 
                        alt="Galactic_Polymath_JobViz_Icon_Search"
                        className='jobVizIcon rounded-circle'
                    />
                </div>
                <section>
                    <h4 className='text-muted text-center'>{jobCategoryName}</h4>
                    <section className="d-flex justify-content-center align-items-center w-100">
                        <Button id="jobVizBtnSearch" className="d-flex justify-content-center align-items-center">
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