import * as React from "react";
import styles from "../../styles/jobvizGlass.module.css";
import { LucideIcon } from "./LucideIcon";

interface AssignmentBannerProps {
  unitName?: string | null;
  jobs?: [string, string][] | null;
}

export const AssignmentBanner: React.FC<AssignmentBannerProps> = ({
  unitName,
  jobs,
}) => {
  if (!unitName && !jobs?.length) return null;

  return (
    <div className={styles.assignmentBanner} role="status" aria-live="polite">
      <div className={styles.assignmentMarker}>
        <LucideIcon name="Sparkles" />
        <span>Assignment mode</span>
      </div>
      <div className={styles.assignmentContent}>
        {unitName && <h3 className={styles.assignmentTitle}>{unitName}</h3>}
        {jobs?.length ? (
          <p className={styles.assignmentCopy}>
            {jobs.length} linked job{jobs.length === 1 ? "" : "s"} tracked.
            You&apos;ll stay in your assignment context as you explore.
          </p>
        ) : (
          <p className={styles.assignmentCopy}>
            You&apos;ll stay in your assignment context as you explore.
          </p>
        )}
      </div>
    </div>
  );
};
