import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { IoIosSchool } from "react-icons/io";
import { BiTrendingUp } from "react-icons/bi";
import {
  MdOutlineTransferWithinAStation,
  MdOutlineDirectionsWalk,
  MdSupervisedUserCircle,
  MdAttachMoney,
} from "react-icons/md";
import { ISelectedJob, useModalContext } from "../../providers/ModalProvider";
import jobVizDataObj from "../../data/Jobviz/jobVizDataObj.json";
import { useRouter } from "next/router";
import getNewPathsWhenModalCloses from "../../helperFns/getNewPathsWhenModalCloses";
import { replaceCharAt } from "../../shared/fns";
import CopyableTxt from "../CopyableTxt";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { createSelectedJobVizJobLink } from "../JobViz/JobTours/JobToursCard";

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

const formatDataTxtToCurrency = (dataTxt: number | null) => {
  if (typeof dataTxt === "number") {
    return formatToCurrency(dataTxt);
  }

  return "Data unavailable";
};

const createInfoCards = (selectedJob: ISelectedJob | null) => {
  if (!selectedJob) {
    return [];
  }

  // Destructure all the properties needed by infoCards from selectedJob
  const {
    median_annual_wage,
    typical_education_needed_for_entry,
    employment_start_yr,
    employment_end_yr,
    employment_change_percent,
  } = selectedJob;
  const onTheJobTraining =
    selectedJob[
      "typical_on-the-job_training_needed_to_attain_competency_in_the_occupation"
    ];
  const infoCards = [
    {
      id: "medianAnnualWage",
      title: `Median ${DATA_START_YR} Annual Wage`,
      txt: formatDataTxtToCurrency(median_annual_wage),
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
      txt: employment_start_yr.toLocaleString(),
      icon: <MdOutlineDirectionsWalk />,
    },
    {
      id: "employmentEndYr",
      title: `Predicted ${DATA_END_YR} Employment`,
      txt: employment_end_yr.toLocaleString(),
      icon: <MdOutlineTransferWithinAStation />,
    },
    {
      id: "employmentChange",
      title: `Predicted change in Employment ${DATA_START_YR} - ${DATA_END_YR}`,
      txt: employment_change_percent,
      icon: <BiTrendingUp />,
    },
  ] as const;

  return infoCards;
};

const InfoCards: React.FC<{
  infoCards: ReturnType<typeof createInfoCards>;
}> = ({ infoCards }) => {
  return infoCards.map((card, index) => {
    const { icon, title, txt, id } = card;
    let _txt = txt;

    if (typeof _txt === "string" && _txt.split(" ").length === 2) {
      const txtSplitted = _txt.split(" ");
      let [firstWord, secondWord] = txtSplitted;
      const firstChar = firstWord.charAt(0);
      firstWord = replaceCharAt(firstWord, 0, firstChar.toUpperCase());
      _txt = `${firstWord} ${secondWord}`;
    }

    if (id === "employmentChange" && typeof _txt === "number") {
      _txt = `${Math.sign(_txt) ? "+" : ""}${_txt.toLocaleString()}%`;
    } else if (id === "employmentChange") {
      _txt = "Data unavailable";
    }

    return (
      <div className="col-6 col-md-4" key={index}>
        <div className="jobInfoStatCard shadow h-100">
          <div className="d-flex align-items-center justify-content-center border h-100">
            <section className="d-flex flex-column w-75 position-relative">
              <section className="w-100">{icon}</section>
              <section className="w-100 mt-1">
                <h5 className="fw-bold">{title}</h5>
              </section>
              <section className="w-100 position-absolute">
                <span className="d-inline-block w-100 ">{_txt}</span>
              </section>
            </section>
          </div>
        </div>
      </div>
    );
  });
};

const CopyLinkTxtAndIcon: React.FC = () => {
  return (
    <>
      <span className="me-1">Copy Link</span>
      <svg
        width="16"
        height="16"
        className="mb-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    </>
  );
};

const SelectedJob: React.FC = () => {
  const { _selectedJob, _isJobModalOn, _jobToursModalCssProps } =
    useModalContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedJob, setSelectedJob] = _selectedJob;
  const [jobLink, setJobLink] = useState("");
  const [isJobModal, setIsJobModal] = _isJobModalOn;
  const [, setJobToursModalCssProps] = _jobToursModalCssProps;
  let { soc_title, def: _def, title, BLS_link } = selectedJob ?? {};
  let jobTitle = soc_title ?? title;
  jobTitle = jobTitle === "Total, all" ? "All US Jobs" : jobTitle;
  let def: string | null = _def ?? "";
  def =
    def.toLowerCase() === "no definition found for this summary category."
      ? null
      : def;

  // on first render, update the meta tags for the job viz page with the following info:
  // og:title: JobViz Career Explorer
  // og:description: Coaches and Scouts: {projectedPercentageEmploymentChange} in demand by 2031

  const infoCards = createInfoCards(selectedJob);

  const handleOnHide = () => {
    const searchResults = router.query["search-results"];

    if (router.asPath.includes("jobviz") && Array.isArray(searchResults)) {
      const newPaths = getNewPathsWhenModalCloses(
        router.query["search-results"]
      );
      const paramsStr = searchParams.toString();
      const url = paramsStr.length
        ? `${window.location.origin}/jobviz${newPaths}?${paramsStr}`
        : `${window.location.origin}/jobviz${newPaths}`;

      console.log("Navigating to URL on modal close: ", url);

      router.push(url, undefined, {
        scroll: false,
      });
    }

    setSelectedJob(null);
    setJobToursModalCssProps({
      zIndex: 10000,
    });
  };

  const handleCopyLinkBtnClick = () => {
    if (jobLink) {
      navigator.clipboard.writeText(jobLink);
      return;
    }

    console.error("BLS_link is falsy. Cannot copy link.");
  };

  const toastLinkCopied = useRef("");

  const handleCopyLinkBtnPressOnMobile = () => {
    if (toastLinkCopied.current) {
      toast.dismiss(toastLinkCopied.current);
    }

    if (jobLink) {
      navigator.clipboard.writeText(jobLink);
      return;
    }

    console.error("BLS_link is falsy. Cannot copy link.");
  };

  useEffect(() => {
    setIsJobModal(true);
  }, []);

  return (
    <Modal
      show={!!selectedJob}
      onHide={handleOnHide}
      onShow={() => {
        const jobLink = selectedJob
          ? createSelectedJobVizJobLink(selectedJob)
          : null;

        console.log(`Job link: ${jobLink}`);

        if (selectedJob && jobLink) {
          setJobLink(jobLink);
          return;
        }

        console.error("selectedJob is falsy. Cannot create job link.");
      }}
      contentClassName="selectedJobModal"
      dialogClassName="dialogJobVizModal py-2"
      fullscreen="md-down"
      style={{
        zIndex: 10000000,
      }}
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
            <h5 className="text-center text-sm-start">{def}</h5>
          </section>
        )}
        <section className="jobInfoStatSec pt-3 d-none d-sm-flex">
          <InfoCards infoCards={infoCards} />
        </section>
        <section className="jobInfoStatSec pt-3 row g-2 d-flex d-sm-none">
          <InfoCards infoCards={infoCards} />
        </section>
        <section className="flex-column flex-sm-row d-flex align-items-center justify-content-between pt-2 mt-3 border-top">
          <div
            className={`d-flex align-items-center justify-content-center text-sm-start text-center ${
              BLS_link ? "" : "pe-none invisible"
            }`}
          >
            <span className="me-sm-2 ">
              Learn More:{" "}
              <span
                onClick={() => {
                  if (BLS_link) {
                    window.open(BLS_link);
                  }
                }}
                className="text-decoration-underline no-link-decoration pointer"
              >
                Occupational Outlook Handbook
              </span>
            </span>
          </div>
          <div className="mt-2 mt-sm-0 d-flex align-items-center gap-2 px-2 py-1 bg-transparent small no-btn-styles underline-on-hover">
            <CopyableTxt
              implementLogicOnClick={handleCopyLinkBtnClick}
              copyTxtIndicator="Copy link."
              txtCopiedIndicator="Link copied ✅!"
              parentClassName="pointer d-sm-block d-none"
            >
              <CopyLinkTxtAndIcon />
            </CopyableTxt>
            <CopyableTxt
              implementLogicOnClick={handleCopyLinkBtnPressOnMobile}
              copyTxtIndicator="Copy link."
              txtCopiedIndicator="Link copied ✅!"
              parentClassName="pointer d-sm-none d-block"
              disableTxtCopiedShow
              willDisplayModalOnHover={false}
            >
              <CopyLinkTxtAndIcon />
            </CopyableTxt>
          </div>
        </section>
      </Body>
    </Modal>
  );
};

export default SelectedJob;
