import React, { useEffect, useMemo, useRef, useState } from "react";
import { IJobVizConnection } from "../../../backend/models/Unit/JobViz";
import { IConnectionJobViz } from "../../../backend/models/Unit/JobViz";
import { GpPlusBtn } from "../../../pages/gp-plus";
import { useRouter, usePathname } from "next/navigation";
import JobToursModal from "../Modals/JobToursModal";
import { DISABLE_FOOTER_PARAM_NAME } from "../../../components/Footer";
import { DISABLE_NAVBAR_PARAM_NAME } from "../../../components/Navbar";
import Image from "next/image";
import CopyableTxt from "../../CopyableTxt";
import { getSessionStorageItem } from "../../../shared/fns";
import { useUserContext } from "../../../providers/UserProvider";
import { MdOutlineRocketLaunch } from "react-icons/md";
import {
  showJobNotFoundToast,
  useCreateHandleJobTitleTxtClick,
} from "../../JobViz/JobTours/JobToursCard";
import { toast } from "react-toastify";
import jobVizDataObj from "../../../data/Jobviz/jobVizDataObj.json";
import {
  ISelectedJob,
  useModalContext,
} from "../../../providers/ModalProvider";

interface IJobVizConnectionsProps {
  unitName?: string;
  jobVizConnections?: IConnectionJobViz[] | IJobVizConnection[] | null;
}

export const SOC_CODES_PARAM_NAME = "socCodes";
export const UNIT_NAME_PARAM_NAME = "unitName";

interface IJobTitle {
  handleJobTitleBtnClick: () => void;
  jobTitle: string;
}

const JobTitle: React.FC<IJobTitle> = ({
  handleJobTitleBtnClick,
  jobTitle,
}) => {
  const [wasClicked, setWasClicked] = useState(false);

  return (
    <li
      onClick={() => {
        setWasClicked(true);
        handleJobTitleBtnClick();
      }}
      style={{
        width: "fit-content",
        maxWidth: "400px",
        color: wasClicked ? "#00008B" : "#3d8dc8",
        textDecoration: wasClicked ? "underline" : "none",
      }}
      className="text-primary li-dot-black"
    >
      <span
        style={{
          color: wasClicked ? "#00008B" : "#3d8dc8",
          textDecoration: wasClicked ? "underline" : "none",
        }}
        className="underline-on-hover"
      >
        {jobTitle}
      </span>
    </li>
  );
};

const JobVizConnections: React.FC<IJobVizConnectionsProps> = ({
  jobVizConnections,
  unitName,
}) => {
  useEffect(() => {
    console.log("jobVizConnections: ", jobVizConnections);
  })
  const pathname = usePathname();
  const {
    _selectedJob: [, setSelectedJob],
  } = useModalContext();
  const {
    _isGpPlusMember: [isGpPlusMember],
  } = useUserContext();
  const didInitialRenderOccur = useRef(false);
  const isUserAGpPlusMember = useMemo(() => {
    return !!getSessionStorageItem("isGpPlusUser");
  }, [isGpPlusMember]);
  const [isJobsToursUpSellModalOn, setIsJobsToursUpSellModalOn] =
    useState(false);
  const jobVizConnectionsArr = useMemo(() => {
    const _jobVizConnections = jobVizConnections?.filter((jobVizConnection) => {
      return (
        // check for nulls
        jobVizConnection &&
        jobVizConnection?.job_title &&
        jobVizConnection?.soc_code
      );
    }) as IJobVizConnection[] | IConnectionJobViz[];
    jobVizConnections = _jobVizConnections;

    if (!jobVizConnections?.length) {
      console.error(
        "Developer Error: jobVizConnections is empty or undefined in JobVizConnections component."
      );

      return [];
    }

    let jobVizConnectionsDeprecated: IJobVizConnection[] | null = null;

    for (const { soc_code, job_title } of jobVizConnections) {
      if (Array.isArray(soc_code) || Array.isArray(job_title)) {
        jobVizConnectionsDeprecated = jobVizConnections as IJobVizConnection[];
        break;
      }
    }

    if (jobVizConnectionsDeprecated?.length) {
      return jobVizConnectionsDeprecated
        .map(({ job_title, soc_code }) => {
          const jobTitle = job_title[0];
          const socCode = soc_code[0];

          if (!socCode || !jobTitle) {
            return null;
          }

          return {
            job_title: jobTitle,
            soc_code: socCode,
          };
        })
        .filter(Boolean) as IConnectionJobViz[];
    }

    return jobVizConnections as IConnectionJobViz[];
  }, []);
  const jobTitleAndSocCodePairs: [string, string][] = jobVizConnectionsArr.map(
    (job) => [job.job_title, job.soc_code]
  );
  const jobsToursUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const url = new URL(`${window.location.origin}/jobviz`);
    const socCodesStr = jobVizConnectionsArr
      .map((jobVizConnection) => {
        return jobVizConnection.soc_code;
      })
      .join(",");

    url.searchParams.append(SOC_CODES_PARAM_NAME, socCodesStr);

    if (unitName) {
      url.searchParams.append(UNIT_NAME_PARAM_NAME, unitName);
    }

    return url.href;
  }, []);

  useEffect(() => {
    didInitialRenderOccur.current = true;
  }, []);

  if (!jobVizConnectionsArr?.length) {
    console.error(
      "Developer Error: 'jobVizConnectionsArr' is populated, but the component does not handle this case. Please check the JobVizConnections implementation."
    );

    return (
      <div className="mt-4 text-red-600 font-semibold">
        Error: Unable to load job connections for this unit. Please try again
        later.
      </div>
    );
  }

  const handlePreviewCareerTourAssignmentsBtnClick = () => {
    window.open(jobsToursUrl);
  };

  const handleSubscribeToTourAssignmentBtnClick = () => {
    setIsJobsToursUpSellModalOn(true);
  };

  return (
    <div className="mt-4">
      <div className="my-2 d-flex flex-column flex-sm-row">
        <div className="d-flex pt-1">
          <MdOutlineRocketLaunch size={25} className="d-none d-sm-inline" />
          <MdOutlineRocketLaunch size={40} className="d-inline d-sm-none mb-2" />
        </div>
        <div
          className="d-flex p-0 ms-sm-1"
          style={{ fontSize: "20px", fontWeight: 300 }}
        >
          JobViz connects classroom learning to the real world—helping students
          see how knowledge links to jobs, industries, and the wider economy.
          With data on 1,000+ occupations, it's a springboard for systems
          thinking and exploring the full landscape of opportunity.
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-3 mt-3">
        Jobs and careers related to the &quot;{unitName ?? "Not found"}&quot;
        unit:
      </h3>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        {jobVizConnectionsArr.map(({ job_title, soc_code }, index) => {
          const targetJob = jobVizDataObj.data.find(
            (job) => job.soc_code === soc_code
          ) as ISelectedJob | undefined;

          return (
            <JobTitle
              jobTitle={job_title}
              key={index}
              handleJobTitleBtnClick={() => {
                if (!targetJob) {
                  showJobNotFoundToast();
                  return;
                }

                setSelectedJob(targetJob);
              }}
            />
          );
        })}
      </ul>
      <div className="d-flex justify-content-center justify-content-sm-start">
        {isUserAGpPlusMember && didInitialRenderOccur.current ? (
          <div
            style={{
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
              display: "flex",
              maxWidth: "500px",
              width: "100%",
              position: "relative",
              minWidth: "270px",
            }}
            className=""
          >
            <Image
              src="/plus/plus.png"
              alt="GP Plus logo"
              width={30}
              height={30}
              className="top-0 left-0 ms-2 mt-1 position-absolute"
            />
            <div
              style={{
                gap: "12px",
                flex: 1,
              }}
              className="tours-btn-container px-1 px-sm-4 pb-4 w-100"
            >
              <div className="w-100 d-flex justify-content-center align-items-center">
                <button
                  onClick={handlePreviewCareerTourAssignmentsBtnClick}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    width: "fit-content",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  className="tours-btn"
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 400,
                      color: "#000",
                      display: "inline-block", // ensure the element behaves like inline-flex
                      width: "fit-content", // allow width to shrink to content size
                    }}
                    className="w-100 text-center"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        flexShrink: 0,
                      }}
                      className="me-1"
                    >
                      <path
                        d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Open Career Tour Assignment
                  </div>
                </button>
              </div>
              <div className="w-100 d-flex justify-content-center align-items-center">
                <CopyableTxt
                  implementLogicOnClick={() => {
                    navigator.clipboard.writeText(jobsToursUrl);
                  }}
                  copyTxtIndicator="Copy link"
                  txtCopiedIndicator="Link copied ✅!"
                  parentClassName="pointer mt-2"
                >
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      gap: "12px",
                      cursor: "pointer",
                      width: "fit-content",
                    }}
                    className="tours-btn"
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 400,
                        color: "#000",
                        display: "inline-block", // ensure the element behaves like inline-flex
                        // alignItems: "flex-start",
                        width: "fit-content", // allow width to shrink to content size
                      }}
                      className="w-100 text-center"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          flexShrink: 0,
                          fontSize: "18px",
                          marginBottom: "1px",
                        }}
                        className="me-1"
                      >
                        <rect
                          x="8"
                          y="8"
                          width="12"
                          height="12"
                          rx="2"
                          stroke="black"
                          strokeWidth="2"
                        />
                        <path
                          d="M16 8V6C16 4.89543 15.1046 4 14 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H8"
                          stroke="black"
                          strokeWidth="2"
                        />
                      </svg>
                      Copy Assignment Link
                    </div>
                  </button>
                </CopyableTxt>
              </div>
            </div>
          </div>
        ) : (
          <GpPlusBtn
            onClick={handleSubscribeToTourAssignmentBtnClick}
            className="px-3 py-2 w-100 w-sm-auto"
            styles={{
              minHeight: "48px",
              backgroundColor: "white",
              border: "solid 3px #2339C4",
              borderRadius: "1.5em",
              textTransform: "none",
              minWidth: "auto",
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <div
              style={{
                lineHeight: "1.4",
                fontSize: "18px",
              }}
              className="d-flex flex-column text-black text-center text-sm-start"
            >
              Preview Job Exploration Assignment
            </div>
          </GpPlusBtn>
        )}
      </div>
      <JobToursModal
        _isModalDisplayed={[
          isJobsToursUpSellModalOn,
          setIsJobsToursUpSellModalOn,
        ]}
        url={`${jobsToursUrl}&${DISABLE_FOOTER_PARAM_NAME}=true&${DISABLE_NAVBAR_PARAM_NAME}=true#job-tours-section`}
        jobTitleAndSocCodePairs={jobTitleAndSocCodePairs}
        unitName={unitName ?? "Not found"}
      />
    </div>
  );
};

export default JobVizConnections;
