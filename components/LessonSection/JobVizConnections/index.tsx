import React, { useEffect, useMemo, useState } from "react";
import { IJobVizConnection } from "../../../backend/models/Unit/JobViz";
import { IConnectionJobViz } from "../../../backend/models/Unit/JobViz";
import { GpPlusBtn } from "../../../pages/gp-plus";
import { useRouter } from "next/navigation";
import JobToursModal from "../Modals/JobToursModal";
import { DISABLE_FOOTER_PARAM_NAME } from "../../../components/Footer";
import { DISABLE_NAVBAR_PARAM_NAME } from "../../../components/Navbar";
import Image from "next/image";

interface IJobVizConnectionsProps {
  unitName?: string;
  jobVizConnections?: IConnectionJobViz[] | IJobVizConnection[] | null;
}

export const SOC_CODES_PARAM_NAME = "socCodes";
export const UNIT_NAME_PARAM_NAME = "unitName";

const JobVizConnections: React.FC<IJobVizConnectionsProps> = ({
  jobVizConnections,
  unitName,
}) => {
  const router = useRouter();
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
    router.push(jobsToursUrl);
  };

  const handleSubscribeToTourAssignmentBtnClick = () => {
    setIsJobsToursUpSellModalOn(true);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">
        Jobs and careers related to the &quot;{unitName ?? "Not found"}&quot;
        unit:
      </h3>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        {jobVizConnectionsArr.map(({ job_title }, index) => {
          return (
            <li key={index} className="text-base">
              {job_title}
            </li>
          );
        })}
      </ul>
      <div className="d-flex justify-content-center justify-content-sm-start">
        <div
          style={{
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            display: "flex",
            maxWidth: "500px",
            width: "100%",
            position: "relative",
          }}
          className="d-flex d-sm-block justify-content-center align-items-center flex-sm-row flex-column"
        >
          <Image
            src="/plus/plus.png"
            alt="GP Plus logo"
            width={30}
            height={30}
            className="top-0 left-0 ms-2 mt-1 position-absolute d-sm-block d-none"
          />
          <div className="pt-2 w-100 d-sm-none d-flex justify-content-center align-items-center">
            <Image
              src="/plus/plus.png"
              alt="GP Plus logo"
              width={30}
              height={30}
              className=""
            />
          </div>
          <div
            style={{
              gap: "12px",
              flex: 1,
            }}
            className="py-4 w-100 d-flex justify-content-center align-items-center flex-column"
          >
            <button
              onClick={handlePreviewCareerTourAssignmentsBtnClick}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                textAlign: "left",
              }}
              className="tours-btn d-flex justify-content-center justify-content-sm-start align-items-center align-items-sm-stretch"
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 400,
                  color: "#000",
                  // width: "fit-content",
                }}
                className="d-flex justify-content-center align-items-center"
              >
                <div className="tours-btn-icon-container me-1 d-sm-block d-flex justify-content-center align-items-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="tours-btn-txt">
                  Preview Career Tour Assignment
                </div>
              </div>
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(jobsToursUrl)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                gap: "12px",
                cursor: "pointer",
              }}
              className="tours-btn d-flex justify-content-center justify-content-sm-start align-items-center align-items-sm-stretch"
            >
              {/* <div className="tours-btn-icon-container me-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
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
              </div>
              <div
                style={{ fontSize: "15px", fontWeight: 400, color: "#000" }}
                className="text-nowrap"
              >
                Copy assignment link
              </div> */}
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 400,
                  color: "#000",
                  // width: "fit-content",
                }}
                className="d-flex justify-content-center align-items-center"
              >
                <div className="tours-btn-icon-container me-1 d-sm-block d-flex justify-content-center align-items-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ flexShrink: 0 }}
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
                </div>
                <div className="tours-btn-txt">
                  Copy assignment link
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* <GpPlusBtn
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
              fontSize: "clamp(14px, 4vw, 18px)",
            }}
            className="d-flex flex-column text-black text-center text-sm-start"
          >
            Preview job exploration assignment
          </div>
        </GpPlusBtn> */}
      </div>
      <JobToursModal
        _isModalDisplayed={[
          isJobsToursUpSellModalOn,
          setIsJobsToursUpSellModalOn,
        ]}
        url={`${jobsToursUrl}&${DISABLE_FOOTER_PARAM_NAME}=true&${DISABLE_NAVBAR_PARAM_NAME}=true#job-tours-section`}
      />
    </div>
  );
};

export default JobVizConnections;
