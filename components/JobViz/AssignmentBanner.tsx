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
import {
  countRatings,
  ratingEmoji,
  useJobRatings,
} from "./jobRatingsStore";

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
  const [mobileCollapsed, setMobileCollapsed] = React.useState(false);
  const shouldRenderBanner =
    Boolean(unitName) || Boolean(jobs?.length);
  const isMobile = variant === "mobile";
  const infoSectionId = isMobile ? "assignmentInfoBlock" : undefined;
  const hideInfoSection = isMobile && mobileCollapsed;
  const { ratings, clearRatings } = useJobRatings();
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  const assignmentSocCodes = React.useMemo(
    () => (jobs?.map(([, soc]) => soc) ?? []).filter(Boolean),
    [jobs]
  );
  const clientProgress = React.useMemo(
    () => countRatings(assignmentSocCodes),
    [assignmentSocCodes, ratings]
  );
  const progress = isMounted
    ? clientProgress
    : { rated: 0, total: assignmentSocCodes.length };

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
  const [showRatingHint, setShowRatingHint] = React.useState(true);
  const [dockCollapsed, setDockCollapsed] = React.useState(false);
  const isDesktopVariant = variant === "desktop";
  const isDockCollapsed = isDesktopVariant && dockCollapsed;
  React.useEffect(() => {
    if (!jobs?.length) return;
    const timer = window.setTimeout(() => setShowRatingHint(false), 4000);
    return () => window.clearTimeout(timer);
  }, [jobs?.length, variant]);

  return (
    <div
      className={`${styles.assignmentBannerShell} ${wrapperClass}`}
      data-mode={variant === "desktop" ? "docked" : "default"}
      data-collapsed={isMobile && mobileCollapsed ? "true" : "false"}
      data-dock-collapsed={isDockCollapsed ? "true" : "false"}
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
          data-mobile-collapsed={isMobile && mobileCollapsed ? "true" : "false"}
        >
          {isDesktopVariant && (
            <button
              type="button"
              className={styles.assignmentDockToggle}
              onClick={() => setDockCollapsed((prev) => !prev)}
              aria-expanded={!isDockCollapsed}
              aria-label={isDockCollapsed ? "Expand assignment" : "Collapse assignment"}
            >
              <LucideIcon name={isDockCollapsed ? "ChevronLeft" : "ChevronRight"} />
            </button>
          )}
          {isMobile && (
            <button
              type="button"
              className={styles.assignmentCollapseToggle}
              aria-expanded={!hideInfoSection}
              aria-controls={infoSectionId}
              onClick={() => setMobileCollapsed((prev) => !prev)}
            >
              {mobileCollapsed ? "Show assignment" : "Hide assignment"}
              <span
                className={styles.assignmentCollapseToggleIcon}
                aria-hidden="true"
              >
                <LucideIcon
                  name={mobileCollapsed ? "ChevronDown" : "ChevronUp"}
                />
              </span>
            </button>
          )}
          {!isDockCollapsed && (
            <>
              <div
                id={infoSectionId}
                hidden={hideInfoSection}
                className={styles.assignmentInfoBlock}
              >
                {unitName && (
                  <span className={styles.assignmentUnitLabelInline}>
                    <span>
                      {" "}
                      Jobs related to the{" "}
                      <span className={styles.assignmentUnitName}>{unitName}</span>{" "}
                      unit
                    </span>
                  </span>
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
                    Explore and rate each of these jobs. Be prepared to explain your
                    ratings <em>with data</em>.
                  </p>
                  <button
                    type="button"
                    className={styles.assignmentClearButton}
                    onClick={clearRatings}
                  >
                    Clear ratings
                  </button>
                </div>
              </div>
              {assignmentSocCodes.length > 0 && (
                <div className={styles.assignmentProgressRow}>
                  <div className={styles.assignmentProgressLabel}>
                    Rated {progress.rated}/{progress.total} jobs
                  </div>
                  <div className={styles.assignmentProgressTrack}>
                    <div
                      className={styles.assignmentProgressFill}
                      style={{
                        width: `${progress.total ? (progress.rated / progress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <div
                className={`${styles.assignmentContent} ${
                  variant === "mobile" ? styles.assignmentMobileContentSticky : ""
                }`}
              >
                {variant === "desktop" && splitJobs.length > 0 && (
                  <div className={styles.assignmentListWrap}>
                    {splitJobs.map((jobGroup, idx) => (
                      <ul key={idx} className={styles.assignmentList}>
                        {jobGroup.map(({ title, soc, iconName, jobIconName }, jobIdx) => {
                          const ratingValue = ratings[soc];
                          return (
                            <li key={soc} className={styles.assignmentListItem}>
                              {showRatingHint && idx === 0 && jobIdx === 0 && (
                                <div className={styles.assignmentHintArrow}>
                                  <span>Click to explore and rate</span>
                                </div>
                              )}
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
                                {isMounted ? (
                                  <span className={styles.assignmentListRating}>
                                    {ratingEmoji(ratingValue)}
                                  </span>
                                ) : null}
                                {title}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ))}
                  </div>
                )}

                          )}
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
                          <span className={styles.assignmentListRating}>
                            {isMounted
                              ? ratingEmoji(ratings[jobItems[activeJobIdx].soc])
                              : "?"}
                          </span>
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
                      <button
                        type="button"
                        className={styles.assignmentCarouselArrow}
                        onClick={handleNext}
                        aria-label="Next job"
                      >
                        <LucideIcon name="ChevronRight" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            {variant === "mobile" && jobItems.length > 0 && (
              <div
                className={styles.assignmentCarousel}
                aria-label="Assignment jobs carousel"
              >
                <div
                  className={`${styles.assignmentCarouselSlide} ${
                    slideDir === "next"
                      ? styles.assignmentCarouselItemNext
                      : slideDir === "prev"
                        ? styles.assignmentCarouselItemPrev
                        : ""
                  }`}
                  key={jobItems[activeJobIdx].soc}
                >
                  {showRatingHint && variant === "mobile" && activeJobIdx === 0 && (
                    <div className={`${styles.assignmentHintArrow} ${styles.assignmentHintArrowFloating}`}>
                      <span>Click to explore and rate</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.assignmentCarouselArrow}
                    onClick={handlePrev}
                    aria-label="Previous job"
                  >
                    <LucideIcon name="ChevronLeft" />
                  </button>
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
                      <span className={styles.assignmentListRating}>
                        {isMounted
                          ? ratingEmoji(ratings[jobItems[activeJobIdx].soc])
                          : "?"}
                      </span>
                      <span className={styles.assignmentListIconWrap}>
                        <LucideIcon
                          name={jobItems[activeJobIdx].iconName}
                          className={styles.assignmentListIcon}
                        />
                        {jobItems[activeJobIdx].jobIconName && (
                          <span className={styles.assignmentListNestedIcon}>
                            <LucideIcon
                              name={jobItems[activeJobIdx].jobIconName!}
                            />
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
                  <button
                    type="button"
                    className={styles.assignmentCarouselArrow}
                    onClick={handleNext}
                    aria-label="Next job"
                  >
                    <LucideIcon name="ChevronRight" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {variant === "desktop" && (
          <div className={styles.assignmentClearFooter}>
            <button type="button" onClick={clearRatings}>
              Clear ratings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
