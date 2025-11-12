import React from "react";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import JobToursCard, { IJobToursCard } from "../JobTours/JobToursCard";
import Image from "next/image";

interface IHeroForGpPlusUsersProps
  extends Pick<IJobToursCard, "jobTitleAndSocCodePairs" | "unitName"> {
  className?: string;
}

const HeroForGpPlusUsers: React.FC<IHeroForGpPlusUsersProps> = ({
  className = "jobviz-hero text-center text-light position-relative overflow-hidden",
  jobTitleAndSocCodePairs,
  unitName,
}) => {
  return (
    <section className={className}>
      <div className="jobviz-bg"></div>

      <div className="container pt-5 pb-4 position-relative">
        <h1 className="fw-bold display-5 mb-3 animate-fadein">
          JobViz Career Explorer+
        </h1>
        <p
          className="lead mx-auto animate-fadein delay-1"
          style={{ maxWidth: "700px" }}
        >
          {unitName ? (
            <>
              Jobs related to our <em>{unitName}</em> unit
            </>
          ) : (
            <>
              Discover how classroom learning connects to real-world careers
              across industries and the economy.
            </>
          )}
        </p>
      </div>

      {jobTitleAndSocCodePairs?.length ? (
        <div className="container pb-5 animate-slideup position-relative d-flex justify-content-center align-items-center">
          <div className="assignment-card p-4 shadow-sm bg-white position-relative rounded-4 text-start overflow-hidden">
            <HiOutlineRocketLaunch className="wm-rocket" aria-hidden="true" />

            <p className="assignment-title mb-3 text-dark d-flex align-items-center flex-wrap position-relative">
              <HiOutlineRocketLaunch
                className="assignment-icon me-2"
                name="rocket-outline"
              />
              <strong>Assignment:</strong>&nbsp;Explore these jobs and
              explain&nbsp;<em>with data</em>&nbsp;which you would be most or
              least interested in.
            </p>
            <JobToursCard jobTitleAndSocCodePairs={jobTitleAndSocCodePairs} />
          </div>
        </div>
      ) : (
        <div className="pb-5 animate-slideup position-relative d-flex justify-content-center align-items-center">
          <div className="gp-plus-user-jobviz-logo-shell">
            <div className="jobviz-logo-inner position-relative">
              <Image
                src="/imgs/jobViz/icon_jobviz.png"
                alt="JobViz Logo"
                className="jobviz-logo-img"
                fill
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroForGpPlusUsers;
