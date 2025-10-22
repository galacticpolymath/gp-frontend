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
import { useContext, useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { IoIosSchool } from "react-icons/io";
import { BiTrendingUp } from "react-icons/bi";
import {
  MdOutlineTransferWithinAStation,
  MdOutlineDirectionsWalk,
  MdSupervisedUserCircle,
  MdAttachMoney,
} from "react-icons/md";
import { ModalContext, useModalContext } from "../../providers/ModalProvider";
import jobVizDataObj from "../../data/Jobviz/jobVizDataObj.json";
import { useRouter } from "next/router";
import getNewPathsWhenModalCloses from "../../helperFns/getNewPathsWhenModalCloses";

const { Header, Title, Body } = Modal;
const { data_start_yr: _data_start_yr, data_end_yr: _data_end_yr } =
  jobVizDataObj;
const DATA_START_YR = _data_start_yr[0];
const DATA_END_YR = _data_end_yr[0];

const formatToCurrency = (num: number) =>
  num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const SelectedJob: React.FC = () => {
  const { _selectedJob, _isJobModalOn } = useModalContext();
  const router = useRouter();
  const paths = router.query?.["search-results"] ?? [];
  const [selectedJob, setSelectedJob] = _selectedJob;
  const [isJobModal, setIsJobModal] = _isJobModalOn;
  let {
    soc_title,
    def: _def,
    title,
    median_annual_wage_2021,
    typical_education_needed_for_entry,
    employment_2021,
    employment_2031,
    employment_start_yr,
    employment_end_yr,
    employment_change_numeric,
  } = selectedJob ?? {};
  let jobTitle = soc_title ?? title;
  jobTitle = jobTitle === "Total, all" ? "All US Jobs" : jobTitle;
  const projectedPercentageEmploymentChange = selectedJob
    ? selectedJob["percent_employment_change_2021-31"]
    : null;
  const onTheJobTraining = selectedJob
    ? selectedJob[
        "typical_on-the-job_training_needed_to_attain_competency_in_the_occupation"
      ]
    : null;
  let def: string | null = _def ?? "";
  def =
    def.toLowerCase() === "no definition found for this summary category."
      ? null
      : def;

  // on first render, update the meta tags for the job viz page with the following info:
  // og:title: JobViz Career Explorer
  // og:description: Coaches and Scouts: {projectedPercentageEmploymentChange} in demand by 2031

  const infoCards = [
    {
      id: "medianAnnualWage",
      title: `Median ${DATA_START_YR} Annual Wage`,
      txt: employment_change_numeric,
      icon: <MdAttachMoney />,
    },
    {
      id: "educationNeededForEntry",
      title: "Education Needed",
      txt: typical_education_needed_for_entry,
      icon: <IoIosSchool />,
    },
    {
      id: "onTheJobTraining",
      title: "On-the-job Training",
      txt: onTheJobTraining,
      icon: <MdSupervisedUserCircle />,
    },
    {
      id: "employmentStartYr",
      title: `${DATA_START_YR} Employment`,
      txt: employment_start_yr,
      icon: <MdOutlineDirectionsWalk />,
    },
    {
      id: "employmentEndYr",
      title: `Predicted ${DATA_END_YR} Employment`,
      txt: employment_end_yr,
      icon: <MdOutlineTransferWithinAStation />,
    },
    {
      id: "employmentChange",
      title: `Predicted change in Employment ${DATA_START_YR} - ${DATA_END_YR}`,
      txt: projectedPercentageEmploymentChange,
      icon: <BiTrendingUp />,
    },
  ] as const;

  const handleOnHide = () => {
    // delete the last number in the paths of the url
    // TODO: FIX BUG: this fn can sometimes return undefined
    const newPaths = getNewPathsWhenModalCloses(router.query["search-results"]);
    router.push({ pathname: `/jobviz${newPaths}` }, undefined, {
      scroll: false,
    });
    setSelectedJob(null);
  };

  useEffect(() => {
    setIsJobModal(true);
  }, []);

  return (
    <Modal
      show={!!selectedJob}
      onHide={handleOnHide}
      contentClassName="selectedJobModal"
      dialogClassName="dialogJobVizModal"
    >
      <Header className="selectedJobHeader border-0 pb-0 pt-3" closeButton>
        <Title className="w-100 pt-1">
          <h3 className="text-center text-sm-start pt-2 pt-sm-0 mb-0">
            {jobTitle}
          </h3>
        </Title>
      </Header>
      <Body className="selectedJobBody">
        {def && (
          <section>
            <h5>{def}</h5>
          </section>
        )}
        <section className="jobInfoStatSec pt-3">
          {infoCards.map((card, index) => {
            const { icon, title, txt, id } = card;

            console.log(`txt value: ${txt}`);

            let _txt = txt;

            if (id === "employmentStartYr" && typeof _txt === "number") {
              _txt = formatToCurrency(_txt);
            } else if (id === "employmentStartYr" && !_txt) {
              _txt = "Data Unavailable";
            }

            if (id === "employmentChange" && typeof _txt === "number") {
              _txt = `${Math.sign(_txt) ? "+" : ""}${_txt.toLocaleString()}%`;
            } else if (id === "employmentChange") {
              _txt = "Data Unavailable";
            }

            if (id === "employmentEndYr" && typeof _txt === "number") {
              _txt = formatToCurrency(_txt);
            } else if (id === "employmentEndYr" && !_txt) {
              _txt = "Data Unavailable";
            }

            return (
              <div className="d-block jobInfoStatCard shadow" key={index}>
                <div className="d-flex align-items-center justify-content-center border h-100">
                  <section className="d-flex flex-column w-75 position-relative">
                    <section className="w-100">{icon}</section>
                    <section className="w-100 mt-1">
                      <h5 className="fw-bold">{title}</h5>
                    </section>
                    <section className="w-100 position-absolute">
                      <span className="d-inline-block w-100">{_txt}</span>
                    </section>
                  </section>
                </div>
              </div>
            );
          })}
        </section>
      </Body>
    </Modal>
  );
};

export default SelectedJob;
