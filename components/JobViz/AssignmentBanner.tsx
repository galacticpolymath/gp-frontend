import * as React from "react";
import { useRouter } from "next/router";
import styles from "../../styles/jobvizGlass.module.css";
import { LucideIcon } from "./LucideIcon";
import {
  AssignmentParams,
  buildJobvizUrl,
  getIconNameForNode,
  getNodeBySocCode,
} from "./jobvizUtils";

interface AssignmentBannerProps {
  unitName?: string | null;
  jobs?: [string, string][] | null;
  assignmentParams?: AssignmentParams;
  onJobClick?: (socCode: string) => void;
}

export const AssignmentBanner: React.FC<AssignmentBannerProps> = ({
  unitName,
  jobs,
  assignmentParams,
  onJobClick,
}) => {
  const router = useRouter();
  const [clickedSocCodes, setClickedSocCodes] = React.useState<Set<string>>(
    new Set()
  );
  const [activeJobIdx, setActiveJobIdx] = React.useState(0);
  const [slideDir, setSlideDir] = React.useState<"next" | "prev" | null>(null);
  const [flash, setFlash] = React.useState(false);

  if (!unitName && !jobs?.length) return null;

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
      return { title, soc, iconName };
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

  return (
    <div className={styles.assignmentBannerShell}>
      {unitName && (
        <div className={styles.assignmentUnitLabelInline}>
          Jobs related to the <em>{unitName}</em> unit{" "}
          <LucideIcon name="CornerRightDown" className={styles.assignmentUnitIcon} />
        </div>
      )}
      <div
        className={`${styles.assignmentBanner} ${styles.assignmentBannerSticky}`}
        role="status"
        aria-live="polite"
      >
        <div
          className={`${styles.assignmentInner} ${
            flash ? styles.assignmentInnerFlash : ""
          }`}
        >
          <div className={styles.assignmentMarker}>
            <span className={styles.assignmentMarkerLabel}>Assignment</span>
            <LucideIcon name="Rocket" className={styles.assignmentMarkerIcon} />
          </div>
          <div className={styles.assignmentContent}>
            <p className={styles.assignmentCopy}>
              Explore these jobs and explain <em>with data</em> which you would
              be most or least interested in.
            </p>

            {splitJobs.length > 0 && (
              <div className={styles.assignmentListWrap}>
                {splitJobs.map((jobGroup, idx) => (
                  <ul key={idx} className={styles.assignmentList}>
                    {jobGroup.map(({ title, soc, iconName }) => (
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
                          <LucideIcon
                            name={iconName}
                            className={styles.assignmentListIcon}
                          />
                          {title}
                        </button>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            )}

            {jobItems.length > 0 && (
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
                  <LucideIcon
                    name={jobItems[activeJobIdx].iconName}
                    className={styles.assignmentListIcon}
                  />
                  <button
                    type="button"
                    className={`${styles.assignmentLink} ${
                      clickedSocCodes.has(jobItems[activeJobIdx].soc)
                        ? styles.assignmentLinkClicked
                        : ""
                    }`}
                    onClick={() => handleJobClick(jobItems[activeJobIdx].soc)}
                  >
                    {jobItems[activeJobIdx].title}
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
                <div className={styles.assignmentCarouselMeta}>
                  {activeJobIdx + 1} / {jobItems.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
