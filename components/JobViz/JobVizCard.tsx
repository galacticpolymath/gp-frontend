import * as React from "react";
import styles from "../../styles/jobvizBurst.module.scss";
import { LucideIcon } from "./LucideIcon";
import { ratingEmoji, useJobRatings } from "./jobRatingsStore";
import type { JobRatingValue } from "./jobRatingsStore";

export interface JobVizCardProps {
  title: string;
  iconName: string;
  level: 1 | 2;
  onClick?: () => void;
  highlight?: boolean;
  highlightClicked?: boolean;
  showBookmark?: boolean;
  jobsCount?: number;
  growthPercent?: number | string | null;
  wage?: number | null;
  education?: string | null;
  jobIconName?: string;
  socCode?: string | null;
  isAssignmentJob?: boolean;
}

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactTitle = (value: string) => value.replace(/\sand\s/gi, " & ");

const formatPercent = (raw?: number | string | null) => {
  if (raw === null || raw === undefined) return "—";
  const numeric =
    typeof raw === "number" ? raw : Number.parseFloat(String(raw));
  if (!Number.isFinite(numeric)) return "—";
  return `${numeric > 0 ? "+" : ""}${numeric.toFixed(1).replace(/\\.0$/, "")}%`;
};

const ratingMessages: Record<JobRatingValue, string> = {
  love: "You love this job",
  like: "You like this job",
  dislike: "Not your pick",
};

export const JobVizCard: React.FC<JobVizCardProps> = ({
  title,
  iconName,
  level,
  onClick,
  highlight,
  highlightClicked,
  showBookmark,
  jobsCount,
  growthPercent,
  wage,
  education,
  jobIconName,
  socCode,
  isAssignmentJob,
}) => {
  const [isHovered, setHover] = React.useState(false);
  const containerClass = level === 1 ? styles.categoryCard : styles.jobCard;
  const highlightClass =
    highlight && level === 1
      ? styles.categoryCardHighlight
      : highlight && level === 2
        ? styles.jobCardHighlight
        : "";
  const visitedClass =
    highlightClicked && level === 2 ? styles.jobCardVisited : "";
  const tooltipId = React.useId();
  const { ratings } = useJobRatings();
  const currentRating = socCode ? ratings[socCode] : undefined;
  const ratingLabel = currentRating
    ? ratingMessages[currentRating as JobRatingValue]
    : isAssignmentJob
      ? "Rate this assignment job"
      : "Rate this unassigned job";

  return (
    <article
      className={`${containerClass} ${highlightClass} ${visitedClass}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={level === 1 ? "Click to view jobs" : "Click for job details"}
      aria-describedby={isHovered ? tooltipId : undefined}
    >
      {level === 1 ? (
        <>
          <div className={styles.categoryTop}>
            <div className={styles.categoryIconBadge}>
              <LucideIcon name={iconName} />
            </div>
            <h3 className={styles.categoryTitle}>{compactTitle(title)}</h3>
          </div>
          <p className={styles.categoryDeck}>GROUPING</p>
          <div className={styles.categoryMetaRow}>
            <div>
              <span className={styles.categoryLabel}>Jobs</span>
              <strong className={styles.categoryValue}>
                {jobsCount !== undefined
                  ? numberFormatter.format(jobsCount)
                  : "—"}
              </strong>
            </div>
            <div>
              <span className={styles.categoryLabel}>Avg. Growth</span>
              <strong className={styles.categoryValue}>
                {formatPercent(growthPercent)}
              </strong>
            </div>
          </div>
        </>
      ) : (
        <>
        <div className={styles.cardHeader}>
            <div className={styles.iconBadge}>
              <LucideIcon name={iconName} />
              {jobIconName && (
                <span className={styles.nestedIcon}>
                  <LucideIcon name={jobIconName} />
                </span>
              )}
            </div>
          <div className={styles.cardHeading}>
            <h3 className={styles.cardTitle}>{compactTitle(title)}</h3>
            {isAssignmentJob && (
              <span
                className={styles.assignmentBadgeDot}
                title="Part of this assignment"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
        {level === 2 && (
          <div
            className={`${styles.cardRatingRow} ${
              currentRating ? styles.cardRatingRowRated : styles.cardRatingRowIdle
            } ${isAssignmentJob ? styles.cardRatingRowAssignment : ""}`}
          >
            <span
              className={`${styles.cardRatingBadge} ${
                currentRating
                  ? styles[`cardRating-${currentRating}`]
                  : styles.cardRatingPlaceholder
              }`}
              aria-label={ratingLabel}
            >
              {ratingEmoji(currentRating)}
            </span>
            <span className={styles.cardRatingLabel}>{ratingLabel}</span>
          </div>
        )}
        <div className={styles.statRow}>
            <div className={styles.statChip}>
              <span className={styles.statLabel}>Median wage</span>
              <strong className={styles.statValue}>
                {typeof wage === "number"
                  ? currencyFormatter.format(wage)
                  : "—"}
              </strong>
            </div>
            <div className={styles.statChip}>
              <span className={styles.statLabel}>Growth</span>
              <strong className={styles.statValue}>
                {formatPercent(growthPercent)}
              </strong>
            </div>
            <div className={styles.statChip}>
              <span className={styles.statLabel}>Entry edu.</span>
              <strong className={styles.statValue}>
                {education && education !== "data unavailable"
                  ? education
                  : "—"}
              </strong>
            </div>
          </div>
        </>
      )}
      {isHovered && onClick && (
        <div className={styles.cardTooltip} id={tooltipId} role="status">
          {level === 1 ? "Click to view jobs" : "Click for job details"}
        </div>
      )}
    </article>
  );
};
