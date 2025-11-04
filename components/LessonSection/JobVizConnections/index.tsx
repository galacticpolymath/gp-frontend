import React, { useEffect, useMemo, useState } from "react";
import { IJobVizConnection } from "../../../backend/models/Unit/JobViz";
import { IConnectionJobViz } from "../../../backend/models/Unit/JobViz";
import { GpPlusBtn } from "../../../pages/gp-plus";
import { useRouter } from "next/navigation";
import JobToursModal from "../Modals/JobToursModal";
import { DISABLE_FOOTER_PARAM_NAME } from "../../../components/Footer";
import { DISABLE_NAVBAR_PARAM_NAME } from "../../../components/Navbar";

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
              fontSize: "clamp(14px, 4vw, 18px)",
            }}
            className="d-flex flex-column text-black text-center text-sm-start"
          >
            Preview job exploration assignment
          </div>
        </GpPlusBtn>
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
