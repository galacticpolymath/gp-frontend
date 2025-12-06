import * as React from "react";
import { useRouter } from "next/router";
import styles from "../../styles/jobvizBurst.module.scss";
import { LucideIcon } from "./LucideIcon";
import {
  AssignmentParams,
  buildJobvizUrl,
  getIconNameForNode,
  getJobSpecificIconName,
  getNodeBySocCode,
} from "./jobvizUtils";

interface AssignmentBannerProps {
  unitName?: string | null;
  jobs?: [string, string][] | null;
  assignmentParams?: AssignmentParams;
  onJobClick?: (socCode: string) => void;
  variant?: "mobile" | "desktop";
}

const ASSIGNMENT_LOGO = "/plus/GP+ Submark.png";

export const AssignmentBanner: React.FC<AssignmentBannerProps> = ({
  unitName,
  jobs,
  assignmentParams,
  onJobClick,
  variant = "mobile",
}) => {
  const router = useRouter();
  const [clickedSocCodes, setClickedSocCodes] = React.useState<Set<string>>(
    new Set()
  );
  const [activeJobIdx, setActiveJobIdx] = React.useState(0);
  const [slideDir, setSlideDir] = React.useState<"next" | "prev" | null>(null);
  const [flash, setFlash] = React.useState(false);
  const shouldRenderBanner =
    Boolean(unitName) || Boolean(jobs?.length);

  const handleJobClick = (socCode: string) => {
    setClickedSocCodes((prev) => {
      const next = new Set(prev);
      next.add(socCode);
      return next;
    });

    if (onJobClick) {
      onJobClick(socCode);
      return;
    }

    const node = getNodeBySocCode(socCode);
    if (!node) return;

    const url = buildJobvizUrl({ fromNode: node }, assignmentParams);
    router.push(url, undefined, { scroll: false });
  };

  const jobItems = React.useMemo(() => {
    if (!jobs?.length) return [];
    return jobs.map(([title, soc]) => {
      const node = getNodeBySocCode(soc);
      const iconName = node ? getIconNameForNode(node) : "CircleDot";
      const jobIconName = node ? getJobSpecificIconName(node) : undefined;
      return { title, soc, iconName, jobIconName };
    });
  }, [jobs]);

  const splitJobs = React.useMemo(() => {
    if (!jobItems.length) return [];
    const midpoint = Math.ceil(jobItems.length / 2);
    return [jobItems.slice(0, midpoint), jobItems.slice(midpoint)];
  }, [jobItems]);

  const handlePrev = () => {
    setSlideDir("prev");
    setActiveJobIdx((idx) => (idx - 1 + jobItems.length) % jobItems.length);
  };

  const handleNext = () => {
    setSlideDir("next");
    setActiveJobIdx((idx) => (idx + 1) % jobItems.length);
  };

  React.useEffect(() => {
    if (!jobItems.length) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 250);
    return () => clearTimeout(t);
  }, [activeJobIdx, jobItems.length]);

  if (!shouldRenderBanner) {
    return null;
  }

  const wrapperClass =
    variant === "desktop"
      ? styles.assignmentDesktopDock
      : styles.assignmentMobileWrapper;

  return (
    <div
      className={`${styles.assignmentBannerShell} ${wrapperClass}`}
      data-mode={variant === "desktop" ? "docked" : "default"}
    >
      <div
        className={`${styles.assignmentBanner} ${styles.assignmentBannerSticky} ${
          variant === "desktop"
            ? styles.assignmentBannerDock
            : styles.assignmentBannerDefault
        }`}
        role="status"
        aria-live="polite"
      >
        <div
          className={`${styles.assignmentInner} ${
            flash ? styles.assignmentInnerFlash : ""
          }`}
        >
      {unitName && (
        <span className={styles.assignmentUnitLabelInline}>
          <span> Jobs related to the <span className={styles.assignmentUnitName}>{unitName}</span> unit
        </span></span> 
      )}
          <div className={styles.assignmentMarker}>
            <span className={styles.assignmentMarkerLabel}>
              <img
                src={ASSIGNMENT_LOGO}
                alt="GP+"
                className={styles.assignmentMarkerLogo}
                width={26}
                height={26}
              />
              JobViz | Assignment
            </span>
            <p className={styles.assignmentCopy}>
              Explore these jobs and explain <em>with data</em> which you would
              be most or least interested in.
            </p>
          </div>
          <div
            className={`${styles.assignmentContent} ${
              variant === "mobile" ? styles.assignmentMobileContentSticky : ""
            }`}
          >
            {variant === "desktop" && splitJobs.length > 0 && (
              <div className={styles.assignmentListWrap}>
                {splitJobs.map((jobGroup, idx) => (
                  <ul key={idx} className={styles.assignmentList}>
                    {jobGroup.map(({ title, soc, iconName, jobIconName }) => (
                      <li key={soc} className={styles.assignmentListItem}>
                        <button
                          type="button"
                          className={`${styles.assignmentLink} ${
                            clickedSocCodes.has(soc)
                              ? styles.assignmentLinkClicked
                              : ""
                          }`}
                          onClick={() => handleJobClick(soc)}
                        >
                          <span className={styles.assignmentListIconWrap}>
                            <LucideIcon
                              name={iconName}
                              className={styles.assignmentListIcon}
                            />
                            {jobIconName && (
                              <span className={styles.assignmentListNestedIcon}>
                                <LucideIcon name={jobIconName} />
                              </span>
                            )}
                          </span>
                          {title}
                        </button>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            )}

            {variant === "mobile" && jobItems.length > 0 && (
              <div
                className={styles.assignmentCarousel}
                aria-label="Assignment jobs carousel"
              >
                <button
                  type="button"
                  className={styles.assignmentCarouselBtn}
                  onClick={handlePrev}
                  aria-label="Previous job"
                >
                  <LucideIcon name="ChevronLeft" />
                </button>
                <div
                  key={jobItems[activeJobIdx].soc}
                  className={`${styles.assignmentCarouselItem} ${
                    slideDir === "next"
                      ? styles.assignmentCarouselItemNext
                      : slideDir === "prev"
                        ? styles.assignmentCarouselItemPrev
                        : ""
                  }`}
                >
                  <button
                    type="button"
                    className={`${styles.assignmentCarouselLink} ${
                      clickedSocCodes.has(jobItems[activeJobIdx].soc)
                        ? styles.assignmentLinkClicked
                        : ""
                    }`}
                    onClick={() => handleJobClick(jobItems[activeJobIdx].soc)}
                  >
                    <div className={styles.assignmentCarouselRow}>
                      <span className={styles.assignmentListIconWrap}>
                        <LucideIcon
                          name={jobItems[activeJobIdx].iconName}
                          className={styles.assignmentListIcon}
                        />
                        {jobItems[activeJobIdx].jobIconName && (
                          <span className={styles.assignmentListNestedIcon}>
                            <LucideIcon name={jobItems[activeJobIdx].jobIconName!} />
                          </span>
                        )}
                      </span>
                      <span className={styles.assignmentCarouselText}>
                        <span className={styles.assignmentCarouselTitle}>
                          {jobItems[activeJobIdx].title}
                        </span>
                        <span className={styles.assignmentCarouselMeta}>
                          {activeJobIdx + 1}/{jobItems.length}
                        </span>
                      </span>
                    </div>
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.assignmentCarouselBtn}
                  onClick={handleNext}
                  aria-label="Next job"
                >
                  <LucideIcon name="ChevronRight" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
