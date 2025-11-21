import * as React from "react";
import { useRouter } from "next/router";
import styles from "../../styles/jobvizGlass.module.css";
import { LucideIcon } from "./LucideIcon";
import {
  AssignmentParams,
  buildJobvizUrl,
  getNodeBySocCode,
} from "./jobvizUtils";

interface AssignmentBannerProps {
  unitName?: string | null;
  jobs?: [string, string][] | null;
  assignmentParams?: AssignmentParams;
  onJobClick?: (socCode: string) => void;
}

export const AssignmentBanner: React.FC<AssignmentBannerProps> = ({
  unitName,
  jobs,
  assignmentParams,
  onJobClick,
}) => {
  const router = useRouter();
  const [clickedSocCodes, setClickedSocCodes] = React.useState<Set<string>>(
    new Set()
  );

  if (!unitName && !jobs?.length) return null;

  const handleJobClick = (socCode: string) => {
    setClickedSocCodes((prev) => {
      const next = new Set(prev);
      next.add(socCode);
      return next;
    });

    if (onJobClick) {
      onJobClick(socCode);
      return;
    }

    const node = getNodeBySocCode(socCode);
    if (!node) return;

    const url = buildJobvizUrl({ fromNode: node }, assignmentParams);
    router.push(url, undefined, { scroll: false });
  };

  const splitJobs = React.useMemo(() => {
    if (!jobs?.length) return [];
    const midpoint = Math.ceil(jobs.length / 2);
    return [jobs.slice(0, midpoint), jobs.slice(midpoint)];
  }, [jobs]);

  return (
    <div
      className={`${styles.assignmentBanner} ${styles.assignmentBannerSticky}`}
      role="status"
      aria-live="polite"
    >
      {unitName && (
        <div className={styles.assignmentUnitBadge} aria-hidden="true">
          Jobs related to the <em>{unitName}</em>
        </div>
      )}

      <div className={styles.assignmentMarker}>
        <LucideIcon name="Rocket" />
        <span>Assignment</span>
      </div>
      <div className={styles.assignmentContent}>
        <p className={styles.assignmentCopy}>
          Assignment: Explore these jobs and explain <em>with data</em> which you
          would be most or least interested in.
        </p>

        {splitJobs.length > 0 && (
          <div className={styles.assignmentListWrap}>
            {splitJobs.map((jobGroup, idx) => (
              <ul key={idx} className={styles.assignmentList}>
                {jobGroup.map(([title, soc]) => (
                  <li key={soc}>
                    <button
                      type="button"
                      className={`${styles.assignmentLink} ${
                        clickedSocCodes.has(soc)
                          ? styles.assignmentLinkClicked
                          : ""
                      }`}
                      onClick={() => handleJobClick(soc)}
                    >
                      {title}
                    </button>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
