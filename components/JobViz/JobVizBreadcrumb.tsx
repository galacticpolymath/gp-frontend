import * as React from "react";
import styles from "../../styles/jobvizBurst.module.scss";
import { LucideIcon } from "./LucideIcon";

export interface BreadcrumbSegment {
  label: string;
  iconName: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface JobVizBreadcrumbProps {
  segments: BreadcrumbSegment[];
}

export const JobVizBreadcrumb: React.FC<JobVizBreadcrumbProps> = ({
  segments,
}) => {
  if (!segments.length) return null;

  return (
    <nav className={styles.jobvizBreadcrumb} aria-label="JobViz navigation">
      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        const content = (
          <span
            className={
              seg.isActive || isLast
                ? styles.breadcrumbSegmentActive
                : styles.breadcrumbSegment
            }
          >
            <LucideIcon name={seg.iconName} />
            <span className={styles.breadcrumbLabel}>{seg.label}</span>
          </span>
        );

        return (
          <React.Fragment key={`${seg.label}-${idx}`}>
            {idx > 0 && (
              <span className={styles.breadcrumbSeparator}>/</span>
            )}
            {seg.onClick && !isLast ? (
              <button
                type="button"
                onClick={seg.onClick}
                className={styles.breadcrumbButton}
              >
                {content}
              </button>
            ) : (
              content
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
