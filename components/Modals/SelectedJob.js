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
import { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import { IoIosSchool } from "react-icons/io";
import { BiTrendingUp } from "react-icons/bi";
import { MdOutlineTransferWithinAStation, MdOutlineDirectionsWalk, MdSupervisedUserCircle, MdAttachMoney } from "react-icons/md";
import { ModalContext } from '../../providers/ModalProvider';

const { Header, Title, Body } = Modal;

const SelectedJob = () => {
    const { _selectedJob } = useContext(ModalContext);
    const [selectedJob, setSelectedJob] = _selectedJob;
    let { soc_title, def, title, median_annual_wage_2021, typical_education_needed_for_entry, employment_2021, employment_2031 } = selectedJob;
    let jobTitle = soc_title ?? title;
    jobTitle = jobTitle === "Total, all" ? "All US Jobs" : jobTitle;
    const projectedPercentageEmploymentChange = selectedJob["percent_employment_change_2021-31"];
    const onTheJobTraining = selectedJob["typical_on-the-job_training_needed_to_attain_competency_in_the_occupation"]
    def = def.toLowerCase() === "no definition found for this summary category." ? null : def;
    const infoCards = [
        {
            title: "Median 2021 Annual Wage",
            txt: median_annual_wage_2021,
            icon: <MdAttachMoney />
        },
        {
            title: "2021 Employment",
            txt: employment_2021,
            icon: <MdOutlineDirectionsWalk />
        },
        {
            title: "Education Needed",
            txt: typical_education_needed_for_entry,
            icon: <IoIosSchool />
        },
        {
            title: "2026 Employment",
            txt: employment_2031,
            icon: <MdOutlineTransferWithinAStation />
        },
        {
            title: "On-the-job-Training",
            txt: onTheJobTraining,
            icon: <MdSupervisedUserCircle />
        },
        {
            title: "Percent change in Employment 2016 - 2026",
            txt: projectedPercentageEmploymentChange,
            icon: <BiTrendingUp />
        }
    ];

    const handleOnHide = () => {
        setSelectedJob(null);
    }

    return (
        <Modal show={selectedJob} size="md" onHide={handleOnHide} contentClassName="selectedJobModal" dialogClassName='dialogJobVizModal'>
            <Header className='selectedJobHeader border-0' closeButton>
                <Title className="w-100 pt-1 d-flex justify-content-center place-items-center">
                    <h3 className="text-center">{jobTitle}</h3>
                </Title>
            </Header>
            <Body className='selectedJobBody'>
                {def &&
                    <section>
                        <h5>
                            <strong>Definition: </strong>
                            {def}
                        </h5>
                    </section>
                }
                <section className="jobInfoStatSec pt-3">
                    {infoCards.map((card, index) => {
                        const { icon, title, txt } = card;
                        let _txt = txt;

                        if (title === "Median 2021 Annual Wage") {
                            _txt = `$${parseInt(txt).toLocaleString()}`
                        }

                        if (title === "Percent change in Employment 2016 - 2026") {
                            _txt = `+${txt}%`
                        }

                        if (title === "2021 Employment") {
                            _txt = `${parseInt(txt).toLocaleString()}`
                        }

                        if (title === "2026 Employment") {
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