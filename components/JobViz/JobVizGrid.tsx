import * as React from "react";
import { JobVizCard } from "./JobVizCard";
import styles from "../../styles/jobvizGlass.module.css";

export interface JobVizGridItem {
  id: string;
  title: string;
  iconName: string;
  level: 1 | 2;
  highlight?: boolean;
  highlightClicked?: boolean;
  showBookmark?: boolean;
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
