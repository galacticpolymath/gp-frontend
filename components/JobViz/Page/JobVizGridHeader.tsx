import * as React from "react";
import { JobVizBreadcrumb } from "../JobVizBreadcrumb";
import { LucideIcon } from "../LucideIcon";
import type { BreadcrumbSegment } from "../JobVizBreadcrumb";
import styles from "./JobVizGridHeader.module.scss";

interface ViewingHeaderData {
  title: string;
  meta: string;
  iconName: string;
}

interface JobVizGridHeaderProps {
  isShowingAssignmentScope: boolean;
  isShowingSavedScope: boolean;
  breadcrumbs: BreadcrumbSegment[];
  outgoingViewingHeader: ViewingHeaderData | null;
  activeViewingHeader: ViewingHeaderData;
  isViewingHeaderTransitioning: boolean;
  hierarchyHeadingId: string;
}

export const JobVizGridHeader: React.FC<JobVizGridHeaderProps> = ({
  isShowingAssignmentScope,
  isShowingSavedScope,
  breadcrumbs,
  outgoingViewingHeader,
  activeViewingHeader,
  isViewingHeaderTransitioning,
  hierarchyHeadingId,
}) => {
  return (
    <>
      <div className={styles.pathHeader}>
        <div className={styles.gridContextLabel}>Current Path</div>
        {isShowingAssignmentScope ? (
          <div className={styles.scopeMessage}>
            <LucideIcon name="Sparkles" />
            Showing tour jobs across multiple categories
          </div>
        ) : isShowingSavedScope ? (
          <div className={styles.scopeMessage}>
            <LucideIcon name="Star" />
            Showing your saved jobs
          </div>
        ) : (
          <JobVizBreadcrumb segments={breadcrumbs} />
        )}
      </div>
      <div className={styles.viewingHeader}>
        {outgoingViewingHeader && (
          <div
            className={`${styles.viewingHeaderLayer} ${styles.viewingHeaderLayerOutgoing}`}
            aria-hidden="true"
          >
            <div className={styles.viewingIdentity}>
              <span className={styles.viewingIcon}>
                <LucideIcon name={outgoingViewingHeader.iconName} />
              </span>
              <div>
                <h3 className={styles.viewingTitle}>{outgoingViewingHeader.title}</h3>
                <p className={styles.viewingMeta}>{outgoingViewingHeader.meta}</p>
              </div>
            </div>
          </div>
        )}
        <div
          className={`${styles.viewingHeaderLayer} ${
            isViewingHeaderTransitioning ? styles.viewingHeaderLayerIncoming : ""
          }`}
        >
          <div className={styles.viewingIdentity}>
            <span className={styles.viewingIcon}>
              <LucideIcon name={activeViewingHeader.iconName} />
            </span>
            <div>
              <h3 id={hierarchyHeadingId} className={styles.viewingTitle}>
                {activeViewingHeader.title}
              </h3>
              <p className={styles.viewingMeta}>{activeViewingHeader.meta}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
