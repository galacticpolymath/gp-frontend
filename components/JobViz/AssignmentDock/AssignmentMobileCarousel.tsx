import * as React from "react";
import { LucideIcon } from "../LucideIcon";
import styles from "./AssignmentDock.module.scss";

interface AssignmentMobileItem {
  title: string;
  soc: string;
  iconName: string;
  jobIconName?: string;
}

interface AssignmentMobileCarouselProps {
  activeJob: AssignmentMobileItem | null;
  activeJobIdx: number;
  activeSocCode: string | null;
  clickedSocCodes: Set<string>;
  handleNext: () => void;
  handlePrev: () => void;
  hasHydratedRatings: boolean;
  highlightedSoc: string | null;
  isActiveJobNextToRate: boolean;
  isActiveJobSuppressed: boolean;
  isActiveJobUnrated: boolean;
  normalizedRatings: Record<string, string | undefined>;
  onJobClick: (socCode: string) => void;
  shouldGlowActiveJob: boolean;
  shouldPulseNextArrow: boolean;
  showRatingHint: boolean;
  slideDir: "next" | "prev" | null;
}

const formatAssignmentTitle = (value: string) =>
  value.replace(/\sand\s/gi, " & ");

export const AssignmentMobileCarousel: React.FC<
  AssignmentMobileCarouselProps
> = ({
  activeJob,
  activeJobIdx,
  activeSocCode,
  clickedSocCodes,
  handleNext,
  handlePrev,
  hasHydratedRatings,
  highlightedSoc,
  isActiveJobNextToRate,
  isActiveJobSuppressed,
  isActiveJobUnrated,
  normalizedRatings,
  onJobClick,
  shouldGlowActiveJob,
  shouldPulseNextArrow,
  showRatingHint,
  slideDir,
}) => {
  if (!activeJob) return null;

  return (
    <div className={styles.carousel} aria-label="Assignment jobs carousel">
      <div
        className={`${styles.carouselSlide} ${
          slideDir === "next"
            ? styles.carouselItemNext
            : slideDir === "prev"
              ? styles.carouselItemPrev
              : ""
        }`}
        key={activeJob.soc}
      >
        {showRatingHint && activeJobIdx === 0 ? (
          <div className={`${styles.hintArrow} ${styles.hintArrowFloating}`}>
            <span>Click to explore and rate</span>
          </div>
        ) : null}
        <button
          type="button"
          className={styles.carouselArrow}
          onClick={handlePrev}
          aria-label="Previous job"
        >
          <LucideIcon name="ChevronLeft" className={styles.carouselArrowIcon} />
        </button>
        <button
          type="button"
          className={`${styles.carouselLink} ${
            clickedSocCodes.has(activeJob.soc) ? styles.linkClicked : ""
          } ${activeSocCode === activeJob.soc ? styles.linkActive : ""}`}
          onClick={() => onJobClick(activeJob.soc)}
          data-assignment-soc={activeJob.soc}
        >
          <div className={styles.carouselRow}>
            <span
              className={`${styles.listRating} ${
                shouldGlowActiveJob ? styles.listRatingGradient : ""
              }`}
            >
              <span
                className={`${styles.listRatingInner} ${
                  isActiveJobNextToRate && isActiveJobUnrated
                    ? styles.listRatingNudge
                    : ""
                } ${
                  isActiveJobSuppressed ? styles.listRatingInnerHidden : ""
                } ${
                  highlightedSoc === activeJob.soc ? styles.listRatingPulse : ""
                }`}
              >
                {isActiveJobSuppressed
                  ? "\u00A0"
                  : hasHydratedRatings
                    ? normalizedRatings[activeJob.soc] ?? "?"
                    : "?"}
              </span>
            </span>
            <span className={styles.listIconWrap}>
              <LucideIcon name={activeJob.iconName} className={styles.listIcon} />
              {activeJob.jobIconName ? (
                <span className={styles.listNestedIcon}>
                  <LucideIcon name={activeJob.jobIconName} />
                </span>
              ) : null}
            </span>
            <span className={styles.carouselText}>
              <span className={styles.carouselTitle}>
                {formatAssignmentTitle(activeJob.title)}
              </span>
            </span>
          </div>
        </button>
        <button
          type="button"
          className={`${styles.carouselArrow} ${
            shouldPulseNextArrow ? styles.carouselArrowHighlight : ""
          }`}
          onClick={handleNext}
          aria-label="Next job"
        >
          <LucideIcon
            name="ChevronRight"
            className={`${styles.carouselArrowIcon} ${
              shouldPulseNextArrow ? styles.carouselArrowNudge : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
};
