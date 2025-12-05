import * as React from "react";
import { JobVizCard } from "./JobVizCard";
import styles from "../../styles/jobvizBurst.module.scss";

export interface JobVizGridItem {
  id: string;
  title: string;
  iconName: string;
  level: 1 | 2;
  highlight?: boolean;
  highlightClicked?: boolean;
  showBookmark?: boolean;
  jobsCount?: number;
  growthPercent?: number | string | null;
  wage?: number | null;
  education?: string | null;
  jobIconName?: string;
}

export interface JobVizGridProps {
  items: JobVizGridItem[];
  onItemClick?: (item: JobVizGridItem) => void;
}

export const JobVizGrid: React.FC<JobVizGridProps> = ({ items, onItemClick }) => {
  return (
    <div className="row g-4">
      {items.map((item) => (
        <div className="col-12 col-md-6 col-xl-4" key={item.id}>
          <JobVizCard
            title={item.title}
            iconName={item.iconName}
            level={item.level}
            jobsCount={item.jobsCount}
            growthPercent={item.growthPercent}
            wage={item.wage}
            education={item.education}
            jobIconName={item.jobIconName}
            highlight={item.highlight}
            highlightClicked={item.highlightClicked}
            showBookmark={item.showBookmark}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
          />
        </div>
      ))}
    </div>
  );
};
