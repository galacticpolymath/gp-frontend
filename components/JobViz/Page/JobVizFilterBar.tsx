import * as React from "react";
import { LucideIcon } from "../LucideIcon";
import { JobVizSortControl } from "../JobVizSortControl";
import type { JobVizSortOption } from "../jobvizSorting";
import styles from "./JobVizFilterBar.module.scss";

interface JobVizFilterBarProps {
  isShowingSavedScope: boolean;
  isShowingAssignmentScope: boolean;
  hasAssignmentList: boolean;
  isTourPreviewMode: boolean;
  isStudentMode: boolean;
  status: string;
  sortOptionId: string;
  sortOptions: JobVizSortOption[];
  onSavedToggleClick: () => void;
  onAssignedToggleClick: () => void;
  onBackToAssignmentClick: () => void;
  onSortChange: (id: string) => void;
}

export const JobVizFilterBar: React.FC<JobVizFilterBarProps> = ({
  isShowingSavedScope,
  isShowingAssignmentScope,
  hasAssignmentList,
  isTourPreviewMode,
  isStudentMode,
  status,
  sortOptionId,
  sortOptions,
  onSavedToggleClick,
  onAssignedToggleClick,
  onBackToAssignmentClick,
  onSortChange,
}) => {
  return (
    <div className={styles.gridFilterRow}>
      <div className={styles.gridFilterActions}>
        <div className={styles.filterGroup}>
          <span className={styles.gridFilterLabel}>Filter</span>
          <button
            type="button"
            className={`${styles.filterButton} ${isShowingSavedScope ? styles.filterButtonActive : ""} ${
              status !== "authenticated" ? styles.filterButtonMuted : ""
            }`}
            onClick={onSavedToggleClick}
            aria-pressed={isShowingSavedScope}
            aria-label={
              status === "authenticated"
                ? "Only saved jobs"
                : "Sign in required to view saved jobs"
            }
          >
            <span
              className={`${styles.filterIcon} ${
                isShowingSavedScope ? styles.filterIconSavedActive : ""
              }`}
              aria-hidden="true"
            >
              <LucideIcon
                name="Star"
                strokeWidth={1}
                fill={isShowingSavedScope ? "currentColor" : "none"}
              />
            </span>
            Saved Jobs
          </button>
          {hasAssignmentList && (
            <button
              type="button"
              className={`${styles.filterButton} ${isShowingAssignmentScope ? styles.filterButtonActive : ""}`}
              disabled={isTourPreviewMode}
              onClick={onAssignedToggleClick}
              aria-pressed={isShowingAssignmentScope}
            >
              <span className={styles.filterIndicator} aria-hidden="true" />
              Tour Jobs
            </button>
          )}
        </div>
        {hasAssignmentList && isStudentMode && !isShowingAssignmentScope && (
          <button
            type="button"
            className={styles.assignmentReturnButton}
            onClick={onBackToAssignmentClick}
          >
            <LucideIcon name="ArrowLeft" />
            Back to assignment
          </button>
        )}
      </div>
      <JobVizSortControl
        activeOptionId={sortOptionId}
        onChange={onSortChange}
        options={sortOptions}
      />
    </div>
  );
};
