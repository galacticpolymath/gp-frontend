import * as React from "react";
import { LucideIcon } from "../LucideIcon";
import styles from "./AssignmentDock.module.scss";

interface AssignmentProgressProps {
  allowShare: boolean;
  hasJobs: boolean;
  isAssignmentComplete: boolean;
  jobItemsLength: number;
  onOpenSummaryModal: () => void;
  progress: { rated: number; total: number };
  safeDisplayedProgressRated: number;
  shouldAnimateProgress: boolean;
  variant: "mobile" | "desktop";
}

export const AssignmentProgress: React.FC<AssignmentProgressProps> = ({
  allowShare,
  hasJobs,
  isAssignmentComplete,
  jobItemsLength,
  onOpenSummaryModal,
  progress,
  safeDisplayedProgressRated,
  shouldAnimateProgress,
  variant,
}) => {
  if (!hasJobs) return null;

  if (isAssignmentComplete && allowShare) {
    if (variant === "mobile") {
      return (
        <button
          type="button"
          className={styles.summaryLink}
          onClick={onOpenSummaryModal}
          disabled={!jobItemsLength}
        >
          Finalize &amp; Share
        </button>
      );
    }

    return (
      <button
        type="button"
        className={styles.summaryButton}
        onClick={onOpenSummaryModal}
        disabled={!jobItemsLength}
      >
        <span>Finalize &amp; Share</span>
        <LucideIcon name="Sparkles" />
      </button>
    );
  }

  return (
    <div className={styles.progressRow}>
      <div className={styles.progressLabel}>
        {isAssignmentComplete && !allowShare
          ? "Preview complete. Unlock GP+ to assign and share full tours."
          : `Rated ${safeDisplayedProgressRated}/${progress.total} jobs`}
      </div>
      <div
        className={`${styles.progressTrack} ${
          shouldAnimateProgress ? styles.progressTrackPulse : ""
        }`}
      >
        <div
          className={`${styles.progressFill} ${
            shouldAnimateProgress ? styles.progressFillPulse : ""
          }`}
          style={{
            width: `${
              progress.total ? (safeDisplayedProgressRated / progress.total) * 100 : 0
            }%`,
          }}
        />
      </div>
    </div>
  );
};
