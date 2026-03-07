import * as React from "react";
import Link from "next/link";
import styles from "./JobVizNotices.module.scss";

interface JobVizNoticesProps {
  tourLoadError: string | null;
  teacherEditDenied: boolean;
  showUnitPreviewAssignmentBanner: boolean;
  isTourPreviewMode: boolean;
  isStudentLinkView: boolean;
  previewLimit: number;
  previewLockedCount: number;
}

export const JobVizNotices: React.FC<JobVizNoticesProps> = ({
  tourLoadError,
  teacherEditDenied,
  showUnitPreviewAssignmentBanner,
  isTourPreviewMode,
  isStudentLinkView,
  previewLimit,
  previewLockedCount,
}) => {
  const hasNotices =
    Boolean(tourLoadError) ||
    teacherEditDenied ||
    showUnitPreviewAssignmentBanner ||
    (isTourPreviewMode && !isStudentLinkView);

  if (!hasNotices) return null;

  return (
    <>
      {tourLoadError && (
        <div className={styles.notice} role="alert">
          <strong>Tour unavailable:</strong> {tourLoadError}
        </div>
      )}
      {teacherEditDenied && (
        <div className={styles.notice} role="alert">
          <strong>Looking for edit controls?</strong> GP+ members can turn on tour
          editing to build and save custom JobViz+ assignments. Sign in with a GP+
          account or remove the <code>?edit=1</code> parameter to preview the
          student view.
        </div>
      )}
      {showUnitPreviewAssignmentBanner && (
        <div className={styles.notice} role="status">
          <strong>GP+ JobViz Career Tour Assignment Preview</strong>
        </div>
      )}
      {isTourPreviewMode && !isStudentLinkView && (
        <div className={styles.previewNotice} role="status">
          <div>
            <strong>Preview mode:</strong> First {previewLimit} jobs are unlocked.{" "}
            {previewLockedCount > 0
              ? `${previewLockedCount} additional jobs are locked.`
              : "This sample is ready to explore."}
          </div>
          <Link href="/gp-plus" className={styles.previewCta}>
            Get GP+ to Assign or Create Tours
          </Link>
        </div>
      )}
    </>
  );
};
