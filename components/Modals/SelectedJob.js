/* eslint-disable no-debugger */
/* eslint-disable no-undef */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { useContext, useEffect, useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { IoIosSchool } from "react-icons/io";
import { BiTrendingUp } from "react-icons/bi";
import { MdOutlineTransferWithinAStation, MdOutlineDirectionsWalk, MdSupervisedUserCircle, MdAttachMoney } from "react-icons/md";
import { ModalContext } from '../../providers/ModalProvider';
import jobVizDataObj from '../../data/Jobviz/jobVizDataObj.json';
import { useRouter } from 'next/router'
import getNewPathsWhenModalCloses from '../../helperFns/getNewPathsWhenModalCloses';

const { Header, Title, Body } = Modal;
const { data_start_yr: _data_start_yr, data_end_yr: _data_end_yr } = jobVizDataObj;
const data_start_yr = _data_start_yr[0];
const data_end_yr = _data_end_yr[0];

const SelectedJob = () => {
    const { _selectedJob, _isJobModalOn } = useContext(ModalContext);
    const router = useRouter();
    const paths = router.query?.['search-results'] ?? [];
    const [selectedJob, setSelectedJob] = _selectedJob;
    const [isJobModal, setIsJobModal] = _isJobModalOn;
    let { soc_title, def, title, median_annual_wage_2021, typical_education_needed_for_entry, employment_2021, employment_2031, id } = selectedJob;
    let jobTitle = soc_title ?? title;
    jobTitle = jobTitle === "Total, all" ? "All US Jobs" : jobTitle;
    const projectedPercentageEmploymentChange = selectedJob["percent_employment_change_2021-31"];
    const onTheJobTraining = selectedJob["typical_on-the-job_training_needed_to_attain_competency_in_the_occupation"]
    def = def.toLowerCase() === "no definition found for this summary category." ? null : def;

    // on first render, update the meta tags for the job viz page with the following info: 
    // og:title: JobViz Career Explorer
    // og:description: Coaches and Scouts: {projectedPercentageEmploymentChange} in demand by 2031 

    const infoCards = [
        {
            title: `Median ${data_start_yr} Annual Wage`,
            txt: median_annual_wage_2021,
            icon: <MdAttachMoney />
        },
        {
            title: "Education Needed",
            txt: typical_education_needed_for_entry,
            icon: <IoIosSchool />
        },
        {
            title: "On-the-job Training",
            txt: onTheJobTraining,
            icon: <MdSupervisedUserCircle />
        },
        {
            title: `${data_start_yr} Employment`,
            txt: employment_2021,
            icon: <MdOutlineDirectionsWalk />
        },
        {
            title: `Predicted ${data_end_yr} Employment`,
            txt: employment_2031,
            icon: <MdOutlineTransferWithinAStation />
        },
        {
            title: `Predicted change in Employment ${data_start_yr} - ${data_end_yr}`,
            txt: projectedPercentageEmploymentChange,
            icon: <BiTrendingUp />
        }
    ];

    const handleOnHide = () => {
        // delete the last number in the paths of the url
        const newPaths = getNewPathsWhenModalCloses(router.query['search-results'])
        router.push({ pathname: `/jobviz${newPaths}` }, null, { scroll: false })
        setSelectedJob(null);
    }

    useEffect(() => {
        setIsJobModal(true)
    }, [])

    return (
        <Modal show={selectedJob} size="md" onHide={handleOnHide} contentClassName="selectedJobModal" dialogClassName='dialogJobVizModal'>
            <Header className='selectedJobHeader border-0 pb-0 pt-3' closeButton>
                <Title className="w-100 pt-1">
                    <h3 className="text-center text-sm-start pt-2 pt-sm-0 mb-0">{jobTitle}</h3>
                </Title>
            </Header>
            <Body className='selectedJobBody'>
                {def &&
                    <section>
                        <h5>
                            {def}
                        </h5>
                    </section>
                }
                <section className="jobInfoStatSec pt-3">
                    {infoCards.map((card, index) => {
                        const { icon, title, txt } = card;
                        let _txt = txt;

                        if (title === `Median ${data_start_yr} Annual Wage`) {
                            _txt = isNaN(txt) ? "Data Unavailable" : `$${parseInt(txt).toLocaleString()}`
                        }

                        if (title === `Predicted change in Employment ${data_start_yr} - ${data_end_yr}`) {
                            isNaN(txt) ? _txt = "Data Unavailable" : _txt = `${Math.sign(parseInt(txt) === 1) ? "+" : ""}${parseInt(txt).toLocaleString()}%`
                        }

                        if (title === `Predicted ${data_end_yr} Employment`) {
                            _txt = `${parseInt(txt).toLocaleString()}`
                        }

                        if (title === `${data_start_yr} Employment`) {
                            _txt = `${parseInt(txt).toLocaleString()}`
                        }


                        return (
                            <div className="d-block jobInfoStatCard shadow" key={index}>
                                <div className="d-flex align-items-center justify-content-center border h-100">
                                    <section className="d-flex flex-column w-75 position-relative">
                                        <section className="w-100">
                                            {icon}
                                        </section>
                                        <section className="w-100 mt-1">
                                            <h5 className="fw-bold">{title}</h5>
                                        </section>
                                        <section className="w-100 position-absolute">
                                            <span className="d-inline-block w-100">{_txt}</span>
                                        </section>
                                    </section>
                                </div>
                            </div>
                        )
                    })}
                </section>
            </Body>
        </Modal>
    )
}

export default SelectedJob;