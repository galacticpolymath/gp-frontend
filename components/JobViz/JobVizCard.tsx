import * as React from "react";
import styles from "../../styles/jobvizBurst.module.scss";
import { LucideIcon } from "./LucideIcon";

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
}

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatPercent = (raw?: number | string | null) => {
  if (raw === null || raw === undefined) return "—";
  const numeric =
    typeof raw === "number" ? raw : Number.parseFloat(String(raw));
  if (!Number.isFinite(numeric)) return "—";
  return `${numeric > 0 ? "+" : ""}${numeric.toFixed(1).replace(/\\.0$/, "")}%`;
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
}) => {
  const containerClass = level === 1 ? styles.categoryCard : styles.jobCard;
  const highlightClass =
    highlight && level === 1
      ? styles.categoryCardHighlight
      : highlight && level === 2
        ? styles.jobCardHighlight
        : "";
  const visitedClass =
    highlightClicked && level === 2 ? styles.jobCardVisited : "";

  return (
    <article
      className={`${containerClass} ${highlightClass} ${visitedClass}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {level === 1 ? (
        <>
          <div className={styles.categoryTop}>
            <div className={styles.categoryIconBadge}>
              <LucideIcon name={iconName} />
            </div>
            <h3 className={styles.categoryTitle}>{title}</h3>
          </div>
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
              <span className={styles.categoryLabel}>Growth</span>
              <strong className={styles.categoryValue}>
                {formatPercent(growthPercent)}
              </strong>
            </div>
          </div>
        </>
      ) : (
        <>
          {showBookmark && (
            <div
              className={`${styles.categoryBookmark} ${
                highlightClicked ? styles.categoryBookmarkVisited : ""
              }`}
            ></div>
          )}
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
              <h3 className={styles.cardTitle}>{title}</h3>
            </div>
          </div>
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
    </article>
  );
};
