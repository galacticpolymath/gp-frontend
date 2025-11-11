import React from "react";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import JobToursCard, { IJobToursCard } from "../JobTours/JobToursCard";

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
            <>Jobs related to GP units</>
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

            <div className="row row-cols-sm-2 row-cols-1 position-relative">
              <div className="col">
                <JobToursCard
                  jobTitleAndSocCodePairs={jobTitleAndSocCodePairs}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pb-5 animate-slideup position-relative d-flex justify-content-center align-items-center">
          <div className="gp-plus-user-jobviz-logo-shell">
            <div className="jobviz-logo-inner">
              <img
                src="https://dev.galacticpolymath.com/_next/image?url=%2Fimgs%2FjobViz%2Fjobviz_icon.png&w=3840&q=75"
                alt="JobViz Logo"
                className="jobviz-logo-img"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroForGpPlusUsers;
