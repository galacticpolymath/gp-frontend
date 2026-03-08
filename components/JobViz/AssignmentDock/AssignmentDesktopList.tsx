import * as React from "react";
import { LucideIcon } from "../LucideIcon";
import styles from "./AssignmentDock.module.scss";

interface AssignmentDesktopItem {
  title: string;
  soc: string;
  iconName: string;
  jobIconName?: string;
}

interface AssignmentDesktopListProps {
  activeSocCode: string | null;
  clickedSocCodes: Set<string>;
  hasHydratedRatings: boolean;
  highlightedSoc: string | null;
  isDesktopVariant: boolean;
  isEnticementReady: boolean;
  jobItems: AssignmentDesktopItem[];
  nextUnratedSoc: string | null;
  normalizedRatings: Record<string, string | undefined>;
  onJobClick: (socCode: string) => void;
  registerJobButtonRef: (soc: string) => (node: HTMLButtonElement | null) => void;
  showRatingHint: boolean;
  shouldDelayAnimations: boolean;
  suppressedSocCodes: Set<string>;
}

export const AssignmentDesktopList: React.FC<AssignmentDesktopListProps> = ({
  activeSocCode,
  clickedSocCodes,
  hasHydratedRatings,
  highlightedSoc,
  isDesktopVariant,
  isEnticementReady,
  jobItems,
  nextUnratedSoc,
  normalizedRatings,
  onJobClick,
  registerJobButtonRef,
  showRatingHint,
  shouldDelayAnimations,
  suppressedSocCodes,
}) => {
  if (!jobItems.length) return null;

  const midpoint = Math.ceil(jobItems.length / 2);
  const groups = [jobItems.slice(0, midpoint), jobItems.slice(midpoint)].filter(
    (group) => group.length
  );

  return (
    <div className={styles.listWrap}>
      {groups.map((group, groupIndex) => (
        <ul key={`group-${groupIndex}`} className={styles.list}>
          {group.map(({ title, soc, iconName, jobIconName }, itemIndex) => {
            const ratingValue = normalizedRatings[soc];
            const isHighlighted = highlightedSoc === soc;
            const isSuppressed = suppressedSocCodes.has(soc);
            const shouldPulseDesktopJob =
              isDesktopVariant &&
              !shouldDelayAnimations &&
              !ratingValue &&
              nextUnratedSoc === soc &&
              isEnticementReady;
            const shouldGlowQuestion = !ratingValue && !isSuppressed;
            const displayEmoji = ratingValue ?? "?";

            return (
              <li key={soc} className={styles.listItem}>
                {showRatingHint && groupIndex === 0 && itemIndex === 0 ? (
                  <div className={styles.hintArrow}>
                    <span>Click to explore and rate</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  className={`${styles.assignmentLink} ${
                    clickedSocCodes.has(soc) ? styles.linkClicked : ""
                  } ${activeSocCode === soc ? styles.linkActive : ""} ${
                    shouldPulseDesktopJob ? styles.linkEntice : ""
                  }`}
                  onClick={() => onJobClick(soc)}
                  data-assignment-soc={soc}
                  ref={registerJobButtonRef(soc)}
                >
                  <span className={styles.listIconWrap}>
                    <LucideIcon name={iconName} className={styles.listIcon} />
                    {jobIconName ? (
                      <span className={styles.listNestedIcon}>
                        <LucideIcon name={jobIconName} />
                      </span>
                    ) : null}
                  </span>
                  <span className={styles.jobTitle}>{title}</span>
                  {hasHydratedRatings ? (
                    <span
                      className={`${styles.listRating} ${
                        shouldGlowQuestion ? styles.listRatingGradient : ""
                      } ${shouldPulseDesktopJob ? styles.listRatingHalo : ""}`}
                    >
                      <span
                        className={`${styles.listRatingInner} ${
                          shouldPulseDesktopJob ? styles.listRatingNudge : ""
                        } ${
                          isSuppressed ? styles.listRatingInnerHidden : ""
                        } ${isHighlighted ? styles.listRatingPulse : ""}`}
                      >
                        {isSuppressed ? "\u00A0" : displayEmoji}
                      </span>
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
};
