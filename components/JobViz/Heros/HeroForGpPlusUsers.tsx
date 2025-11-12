import React, { CSSProperties, useEffect, useRef } from "react";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import JobToursCard, { IJobToursCard } from "../JobTours/JobToursCard";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { useLessonContext } from "../../../providers/LessonProvider";

interface IHeroForGpPlusUsersProps
  extends Pick<IJobToursCard, "jobTitleAndSocCodePairs" | "unitName"> {
  className?: string;
}

interface IJobToursCardWithRocketProps
  extends Pick<IJobToursCard, "jobTitleAndSocCodePairs" | "unitName"> {
  className: string;
  cardClassName: string;
  style?: CSSProperties;
  willTrackViewportLocation: boolean,
  useInViewThreshold?: number
}

export const JobToursCardWithRocket: React.FC<IJobToursCardWithRocketProps> = ({
  jobTitleAndSocCodePairs,
  className = "pb-5 animate-slideup position-relative d-flex justify-content-center align-items-center",
  cardClassName = "assignment-card p-4 shadow-sm bg-white position-relative rounded-4 text-start overflow-hidden",
  style,
  willTrackViewportLocation,
  useInViewThreshold,
}) => {
  const didRenderInitially = useRef(false);
  const { ref, inView } = useInView({ threshold: useInViewThreshold ?? 0.7 });
  const {
    _isJobToursStickyTopCardDisplayed: [
      isJobToursStickTopCardDisplayed,
      setIsJobToursStickyTopCardDisplayed,
    ],
    _willRenderJobToursStickyTopCard: [
      willRenderJobToursStickyTopCard,
      setWillRenderJobToursStickTopCard,
    ],
  } = useLessonContext();

  // TODO: write a clean-up function

  useEffect(() => {
    console.log(`inView: ${inView}`);

    console.log(`didRenderInitially.current: `, didRenderInitially.current);

    if (!willTrackViewportLocation) {
      return;
    }

    if (
      didRenderInitially.current &&
      !inView &&
      !willRenderJobToursStickyTopCard
    ) {
      console.log("job tours is not on dom, will render it and display it");
      setIsJobToursStickyTopCardDisplayed(true);
      setWillRenderJobToursStickTopCard(true);
      return;
    }

    if (
      didRenderInitially.current &&
      !inView
    ) {
      console.log("is not dom, will will make it visable to the user.");
      setIsJobToursStickyTopCardDisplayed(true);
      return;
    }

    if (
      isJobToursStickTopCardDisplayed &&
      didRenderInitially.current &&
      inView
    ) {
      console.log("will take job tours card off of the dom");
      setIsJobToursStickyTopCardDisplayed(false);
      return;
    }
  }, [inView]);

  useEffect(() => {
    didRenderInitially.current = true;
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      <div className={cardClassName}>
        <HiOutlineRocketLaunch className="wm-rocket" aria-hidden="true" />

        <p className="assignment-title mb-3 text-dark d-flex align-items-center flex-wrap position-relative">
          <HiOutlineRocketLaunch
            className="assignment-icon me-2"
            name="rocket-outline"
          />
          <strong>Assignment:</strong>&nbsp;Explore these jobs and explain&nbsp;
          <em>with data</em>&nbsp;which you would be most or least interested
          in.
        </p>
        <JobToursCard jobTitleAndSocCodePairs={jobTitleAndSocCodePairs} />
      </div>
    </div>
  );
};

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
        <JobToursCardWithRocket
          className="container pb-5 animate-slideup position-relative d-flex justify-content-center align-items-center"
          jobTitleAndSocCodePairs={jobTitleAndSocCodePairs}
          cardClassName="assignment-card p-4 shadow-sm bg-white position-relative rounded-4 text-start overflow-hidden"
          willTrackViewportLocation
        />
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
