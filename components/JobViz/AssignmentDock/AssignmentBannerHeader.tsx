import * as React from "react";
import styles from "./AssignmentDock.module.scss";

const ASSIGNMENT_LOGO = "/plus/gp-plus-submark.png";

interface AssignmentBannerHeaderProps {
  headerActions?: React.ReactNode;
  markerLabel: string;
  previewBanner?: React.ReactNode;
  resolvedAssignmentCopy: React.ReactNode;
  resolvedTeacherCtaCopy?: string | null;
  resolvedUnitLabel?: string | null;
}

export const AssignmentBannerHeader: React.FC<AssignmentBannerHeaderProps> = ({
  headerActions,
  markerLabel,
  previewBanner,
  resolvedAssignmentCopy,
  resolvedTeacherCtaCopy,
  resolvedUnitLabel,
}) => {
  return (
    <div className={styles.infoBlock}>
      {previewBanner ? <div className={styles.previewBanner}>{previewBanner}</div> : null}
      {resolvedUnitLabel || headerActions ? (
        <div className={styles.headerRow}>
          {resolvedUnitLabel ? (
            <span className={styles.unitLabel}>{resolvedUnitLabel}</span>
          ) : null}
          {headerActions ? (
            <div className={styles.headerActions}>{headerActions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={styles.marker}>
        <span className={styles.markerLabel}>
          <img
            src={ASSIGNMENT_LOGO}
            alt="GP+"
            className={styles.markerLogo}
            width={28}
            height={28}
          />
          {markerLabel}
        </span>
        <p className={styles.copy}>{resolvedAssignmentCopy}</p>
        {resolvedTeacherCtaCopy ? (
          <p className={styles.copy}>{resolvedTeacherCtaCopy}</p>
        ) : null}
      </div>
    </div>
  );
};
