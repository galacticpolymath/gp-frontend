import React, { CSSProperties, useEffect, useRef } from "react";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import JobToursCard, { IJobToursCard } from "../JobTours/JobToursCard";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { useLessonContext } from "../../../providers/LessonProvider";

interface IHeroForGpPlusUsersProps
  extends Pick<IJobToursCard, "jobTitleAndSocCodePairs" | "unitName"> {
  className?: string;
  useInViewThreshold?: number;
  willTrackIsInViewport?: boolean;
}

interface IJobToursCardWithRocketProps
  extends Pick<IJobToursCard, "jobTitleAndSocCodePairs" | "unitName"> {
  className: string;
  cardClassName: string;
  style?: CSSProperties;
}

export const JobToursCardWithRocket: React.FC<IJobToursCardWithRocketProps> = ({
  jobTitleAndSocCodePairs,
  className = "pb-5 animate-slideup position-relative d-flex justify-content-center align-items-center",
  cardClassName = "assignment-card p-4 shadow-sm bg-white position-relative rounded-4 text-start overflow-hidden",
  style,
}) => {
  return (
    <div className={className} style={style}>
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

/**
 * A hero component for the JobViz GP+ user page.
 *
 * It displays a background image with a title, a tagline, and a
 * call-to-action button to explore the job titles and their corresponding
 * data.
 *
 * The component uses the useInView hook to track whether the element
 * is in the viewport or not. If it's not in the viewport and the
 * willTrackViewportLocation prop is set to true, it will render the
 * JobToursCardWithRocket component and make it visible to the user.
 *
 * If the element is in the viewport and the willTrackViewportLocation prop
 * is set to true, it will remove the JobToursCardWithRocket component from
 * the dom and make it invisible to the user.
 *
 * @param {string} className - The CSS class name for the hero container.
 * @param {IJobToursCard[]} jobTitleAndSocCodePairs - An array of objects containing
 * the job title and SOC code.
 * @param {string} unitName - The name of the unit related to the job titles.
 * @param {boolean} willTrackViewportLocation - A boolean indicating whether to track
 * the element's visibility in the viewport.
 * @param {number} useInViewThreshold - The threshold value for the useInView hook. For mobile = .2, for desktop .7
 */

const HeroForGpPlusUsers: React.FC<IHeroForGpPlusUsersProps> = ({
  className = "jobviz-hero text-center text-light position-relative overflow-hidden",
  jobTitleAndSocCodePairs,
  unitName,
  willTrackIsInViewport,
  useInViewThreshold,
}) => {
  const didRenderInitially = useRef(false);
  const { ref, inView } = useInView({ threshold: useInViewThreshold });
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

  const cleanup = () => {
    console.log("Cleanup function called");
    setWillRenderJobToursStickTopCard(false);
    setIsJobToursStickyTopCardDisplayed(false);
  };

  useEffect(() => {
    return cleanup;
  }, []);

  useEffect(() => {
    console.log(`inView: ${inView}`);

    console.log(`didRenderInitially.current: `, didRenderInitially.current);

    if (!willTrackIsInViewport) {
      return;
    }

    if (
      didRenderInitially.current &&
      !inView &&
      !willRenderJobToursStickyTopCard
    ) {
      console.log("job tours is not on dom, will render it and display it");
      setIsJobToursStickyTopCardDisplayed(true);
      return;
    }

    if (didRenderInitially.current && !inView) {
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
    <section ref={ref} className={className}>
      <div className="jobviz-bg"></div>

      <div className="container pt-5 pb-4 position-relative">
        <h1 className="fw-bold display-5 mt-2 mt-sm-5 mt-md-0 mb-3 animate-fadein">
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
              A tool for grades 6–adult to explore career possibilities! Browse,
              search & share key details about 1000+ jobs.
            </>
          )}
        </p>
      </div>

      {jobTitleAndSocCodePairs?.length ? (
        <JobToursCardWithRocket
          className="container pb-5 animate-slideup position-relative d-flex justify-content-center align-items-center"
          jobTitleAndSocCodePairs={jobTitleAndSocCodePairs}
          cardClassName="assignment-card p-4 shadow-sm bg-white position-relative rounded-4 text-start overflow-hidden"
        />
      ) : (
        <div className="jobviz-logo-plus-wrapper animate-fadein delay-1">
          <div className="jobviz-logo-plus-img-container position-relative">
            <Image src="/imgs/jobViz/icon_jobviz.png" alt="JobViz logo" fill />
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroForGpPlusUsers;
