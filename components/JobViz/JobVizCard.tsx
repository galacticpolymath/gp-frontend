import * as React from "react";
import styles from "../../styles/jobvizBurst.module.scss";
import { LucideIcon } from "./LucideIcon";
import { ratingEmoji, useJobRatings } from "./jobRatingsStore";
import type { JobRatingValue } from "./jobRatingsStore";
import { useJobTourEditorOptional } from "./jobTourEditorContext";

type CardAnimationStyle = React.CSSProperties & {
  "--card-stagger-delay"?: string;
  "--card-pivot-dx"?: string;
  "--card-pivot-dy"?: string;
};

type CardDirection = "down" | "up";

export interface JobVizCardProps {
  title: string;
  iconName: string;
  level: 1 | 2;
  cardId?: string;
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
  shouldAnimate?: boolean;
  animationDelayMs?: number;
  isExiting?: boolean;
  entranceDirection?: CardDirection;
  exitDirection?: CardDirection | null;
  isPivot?: boolean;
  pivotShift?: { dx: number; dy: number };
  onCardAction?: (meta: { cardRect?: { x: number; y: number; width: number; height: number } | null }) => void;
}

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactTitle = (value: string) =>
  value
    .replace(/\sand\s/gi, " & ")
    .replace(/occupations/gi, (match) =>
      match[0] === match[0].toUpperCase() ? "Jobs" : "jobs"
    );

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
  shouldAnimate = false,
  animationDelayMs = 0,
  isExiting = false,
  entranceDirection = "down",
  exitDirection = null,
  isPivot = false,
  pivotShift,
  onCardAction,
  cardId,
}) => {
  const [isHovered, setHover] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const jobTourEditor = useJobTourEditorOptional();
  React.useEffect(() => setIsClient(true), []);
  const cardRef = React.useRef<HTMLElement | null>(null);
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
  const defaultRatingLabel = isAssignmentJob
    ? "Rate this assignment job"
    : "View job details";
  const ratingLabel = React.useMemo(() => {
    if (!isClient) {
      return defaultRatingLabel;
    }
    if (currentRating) {
      return ratingMessages[currentRating as JobRatingValue];
    }
    return defaultRatingLabel;
  }, [isClient, currentRating, defaultRatingLabel]);
  const isAnimating = shouldAnimate || isExiting;
  const animationClass = shouldAnimate
    ? entranceDirection === "up"
      ? styles.cardEntranceUp
      : styles.cardEntrance
    : "";
  const exitClass = isExiting
    ? exitDirection === "up"
      ? styles.cardExitUp
      : isPivot
        ? styles.cardExitDownPivot
        : styles.cardExitDown
    : "";
  const animationStyle: CardAnimationStyle | undefined = isAnimating
    ? {
        "--card-stagger-delay": `${animationDelayMs}ms`,
        "--card-pivot-dx": `${pivotShift?.dx ?? 0}px`,
        "--card-pivot-dy": `${pivotShift?.dy ?? 0}px`,
      }
    : undefined;
  const isInteractive = Boolean(onClick || onCardAction);
  const canBookmark =
    Boolean(jobTourEditor?.isEditing) && level === 2 && Boolean(socCode);
  const isBookmarked =
    canBookmark && socCode ? jobTourEditor?.isSelected(socCode) : false;
  const emitCardAction = React.useCallback(() => {
    const rect = cardRef.current?.getBoundingClientRect() ?? null;
    if (onCardAction) {
      onCardAction({
        cardRect: rect
          ? {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
            }
          : null,
      });
      onClick?.();
      return;
    }
    onClick?.();
  }, [onCardAction, onClick]);
  const handleCardClick = () => {
    if (!isInteractive) return;
    emitCardAction();
  };
  const handleKeyActivate = (event: React.KeyboardEvent) => {
    if (!isInteractive) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      emitCardAction();
    }
  };

  return (
    <article
      ref={cardRef}
      className={`${containerClass} ${highlightClass} ${visitedClass} ${animationClass} ${exitClass}`}
      style={animationStyle}
      data-jobviz-card-id={cardId}
      onClick={isInteractive ? handleCardClick : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onKeyDown={handleKeyActivate}
      aria-label={level === 1 ? "Click to view jobs" : "Click for job details"}
      aria-describedby={isHovered ? tooltipId : undefined}
    >
      {canBookmark && socCode && (
        <button
          type="button"
          className={`${styles.jobvizBookmarkButton} ${
            isBookmarked ? styles.jobvizBookmarkButtonActive : ""
          }`}
          aria-label={
            isBookmarked ? "Remove job from tour" : "Click to add job to tour"
          }
          title={isBookmarked ? "Remove from tour" : "Click to add job to tour"}
          data-active={isBookmarked ? "true" : "false"}
          onClick={(event) => {
            event.stopPropagation();
            jobTourEditor?.toggleJob(socCode);
          }}
        >
          <span
            className={styles.jobvizBookmarkDot}
            aria-hidden="true"
            data-active={isBookmarked ? "true" : "false"}
          />
        </button>
      )}
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
        {level === 2 && isAssignmentJob && (
          <div
            className={`${styles.cardRatingRow} ${
              currentRating ? styles.cardRatingRowRated : styles.cardRatingRowIdle
            } ${isAssignmentJob ? styles.cardRatingRowAssignment : ""}`}
          >
            <span
              className={`${styles.cardRatingBadge} ${
                isClient && currentRating
                  ? styles[`cardRating-${currentRating}`]
                  : styles.cardRatingPlaceholder
              }`}
              aria-label={ratingLabel}
            >
              {isClient ? ratingEmoji(currentRating) : "?"}
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
