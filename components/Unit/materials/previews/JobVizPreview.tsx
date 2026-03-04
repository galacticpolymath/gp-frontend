import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Network, NotebookPen } from 'lucide-react';
import { LucideIcon } from '../../../JobViz/LucideIcon';
import styles from '../../UnitPage.module.css';

type TJobVizPreviewProps = {
  hasJobVizConnections: boolean;
  unitTitle: string;
  jobVizConnections: any[];
  jobVizConnectionIcons: Map<string, { primaryIconName?: string; secondaryIconName?: string }>;
  isGpPlusUser: boolean;
  isAuthenticated: boolean;
  isSavingJobVizTour: boolean;
  handlePreviewJobVizAssignmentClick: () => void;
  handleSaveJobVizTourClick: () => void;
  jobVizSaveMessage: string | null;
  jobVizSaveError: string | null;
};

const JobVizPreview: React.FC<TJobVizPreviewProps> = ({
  hasJobVizConnections,
  unitTitle,
  jobVizConnections,
  jobVizConnectionIcons,
  isGpPlusUser,
  isAuthenticated,
  isSavingJobVizTour,
  handlePreviewJobVizAssignmentClick,
  handleSaveJobVizTourClick,
  jobVizSaveMessage,
  jobVizSaveError,
}) => {
  return (
    <article className={`${styles.lessonPreviewItem} ${styles.jobVizPreviewCard}`}>
      <header className={styles.lessonPreviewHeader}>
        <div className={styles.jobVizPreviewTitleRow}>
          <h3 className={styles.lessonCardHeading}>
            <Image
              alt="JobViz Career Connections icon"
              width={20}
              height={20}
              src="/imgs/jobViz/jobviz_rocket_logo_black.svg"
              className={styles.jobVizActionIcon}
            />
            <span>JobViz Career Connections</span>
          </h3>
          <Image alt="GP+ icon" width={18} height={18} src="/plus/plus.png" />
        </div>
      </header>
      {hasJobVizConnections ? (
        <div className={styles.jobVizPreviewPane}>
          <p className={styles.jobVizPreviewContext}>
            JobViz connects classroom learning to the real world-helping students see how
            knowledge links to jobs, industries, and the wider economy. With data on 800+
            jobs, it&apos;s a springboard for systems thinking and exploring the full
            landscape of opportunity.
          </p>
          <div className={styles.jobVizTourStopsBubble}>
            <p className={styles.jobVizPreviewHeading}>
              Jobs and careers related to the {unitTitle} unit:
            </p>
            <ul className={styles.jobVizPreviewList}>
              {jobVizConnections.map((jobConnection, index) => (
                <li
                  key={`${jobConnection.soc_code}-${index}`}
                  className={styles.jobVizPreviewListItem}
                >
                  <span className={styles.jobVizJobIconStack}>
                    <span className={styles.jobVizJobIconBubblePrimary}>
                      <LucideIcon
                        name={
                          jobVizConnectionIcons.get(jobConnection.soc_code)?.primaryIconName ??
                          'BriefcaseBusiness'
                        }
                        width={14}
                        height={14}
                      />
                    </span>
                    <span className={styles.jobVizJobIconBubbleSecondary}>
                      <LucideIcon
                        name={
                          jobVizConnectionIcons.get(jobConnection.soc_code)
                            ?.secondaryIconName ?? 'Sparkles'
                        }
                        width={11}
                        height={11}
                      />
                    </span>
                  </span>
                  <span>
                    {jobConnection.job_title}
                    {!isGpPlusUser && index >= 2 && (
                      <span className={styles.jobVizPreviewLocked}> - Unlock with GP+</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.jobVizPreviewActions}>
            <button
              type="button"
              className={`${styles.gpFunctionActionBtn} ${styles.jobVizPreviewActionBtn} ${styles.jobVizPreviewGpBtn}`}
              onClick={handlePreviewJobVizAssignmentClick}
            >
              <span className={styles.lessonProcedureToggleText}>
                <Network size={16} aria-hidden="true" />
                <span>Preview Job Exploration Assignment</span>
              </span>
            </button>
            {isGpPlusUser && isAuthenticated ? (
              <button
                type="button"
                className={`${styles.gpFunctionActionBtn} ${styles.jobVizPreviewActionBtn} ${styles.jobVizPreviewGpBtn}`}
                onClick={handleSaveJobVizTourClick}
                disabled={isSavingJobVizTour}
              >
                <span className={styles.lessonProcedureToggleText}>
                  <NotebookPen size={16} aria-hidden="true" />
                  <span>{isSavingJobVizTour ? 'Saving tour...' : 'Save Tour (Allows Edit)'}</span>
                </span>
              </button>
            ) : (
              <Link
                href="/plus"
                className={`${styles.gpFunctionActionBtn} ${styles.jobVizPreviewActionBtn} ${styles.jobVizPreviewGpBtn}`}
              >
                <span className={styles.lessonProcedureToggleText}>
                  <Image alt="GP+ icon" width={16} height={16} src="/plus/plus.png" />
                  <span>Get GP+</span>
                </span>
              </Link>
            )}
          </div>
          {!!jobVizSaveMessage && (
            <p className={styles.copyAllHelperText}>
              {jobVizSaveMessage}{' '}
              <Link href="/search?typeFilter=Job%20Tour&mine=1">Open My JobViz Tours</Link>
            </p>
          )}
          {!!jobVizSaveError && <p className={styles.copyAllHelperText}>{jobVizSaveError}</p>}
        </div>
      ) : (
        <p className={styles.unitMutedText}>JobViz connections are not available for this unit yet.</p>
      )}
    </article>
  );
};

export default JobVizPreview;
