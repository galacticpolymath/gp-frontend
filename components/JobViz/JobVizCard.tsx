import * as React from "react";
import styles from "../../styles/jobvizGlass.module.css";
import { LucideIcon } from "./LucideIcon";

export interface JobVizCardProps {
  title: string;
  iconName: string;
  level: 1 | 2;
  onClick?: () => void;
  highlight?: boolean;
  highlightClicked?: boolean;
  showBookmark?: boolean;
}

export const JobVizCard: React.FC<JobVizCardProps> = ({
  title,
  iconName,
  level,
  onClick,
  highlight,
  highlightClicked,
  showBookmark,
}) => {
  const levelClass =
    level === 1 ? styles.categoryCardLevel1 : styles.categoryCardLevel2;

  return (
    <article
      className={`${styles.categoryCard} ${levelClass} ${
        highlight ? styles.categoryCardHighlight : ""
      } ${highlightClicked ? styles.categoryCardClicked : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {showBookmark && (
        <div
          className={`${styles.categoryBookmark} ${
            highlightClicked ? styles.categoryBookmarkVisited : ""
          }`}
        >
          <LucideIcon name="Bookmark" className={styles.categoryBookmarkIcon} />
        </div>
      )}
      <div className={styles.categoryHeader}>
        <div className={styles.categoryIconWrap}>
          <LucideIcon name={iconName} />
        </div>
        <h3 className={styles.categoryTitle}>{title}</h3>
      </div>
      <div className={styles.categoryFooter}>
        <span className={styles.categoryExplore}>Explore</span>
      </div>
    </article>
  );
};
