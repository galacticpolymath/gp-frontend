import * as React from "react";
import { JobVizCard } from "./JobVizCard";

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
  socCode?: string | null;
  isAssignmentJob?: boolean;
}

export interface JobVizGridProps {
  items: JobVizGridItem[];
  onItemClick?: (item: JobVizGridItem) => void;
}

const STAGGER_INTERVAL_MS = 90;
const CARD_ANIMATION_MS = 620;
const ANIMATION_BUFFER_MS = 200;

export const JobVizGrid: React.FC<JobVizGridProps> = ({ items, onItemClick }) => {
  const [displayItems, setDisplayItems] = React.useState(items);
  const [animationWave, setAnimationWave] = React.useState(0);
  const [activeWave, setActiveWave] = React.useState(0);
  const [isExiting, setIsExiting] = React.useState(false);
  const latestItemsRef = React.useRef(items);
  React.useEffect(() => {
    latestItemsRef.current = items;
  }, [items]);
  const itemsSignature = React.useMemo(
    () => items.map((item) => `${item.id}-${item.level}`).join("|"),
    [items]
  );
  const signatureRef = React.useRef(itemsSignature);
  const exitTimeoutRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (signatureRef.current === itemsSignature) return;
    if (exitTimeoutRef.current) {
      window.clearTimeout(exitTimeoutRef.current);
    }
    setIsExiting(true);
    const timeoutId = window.setTimeout(() => {
      setDisplayItems(latestItemsRef.current);
      setIsExiting(false);
      setAnimationWave((prev) => prev + 1);
    }, CARD_ANIMATION_MS);
    exitTimeoutRef.current = timeoutId;
    signatureRef.current = itemsSignature;
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [itemsSignature]);
  React.useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        window.clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);
  React.useEffect(() => {
    if (isExiting) return;
    if (signatureRef.current === itemsSignature) {
      setDisplayItems(items);
    }
  }, [items, itemsSignature, isExiting]);
  const totalAnimationDuration = React.useMemo(() => {
    if (!displayItems.length) {
      return CARD_ANIMATION_MS + ANIMATION_BUFFER_MS;
    }
    const maxDelay = Math.max(displayItems.length - 1, 0) * STAGGER_INTERVAL_MS;
    return maxDelay + CARD_ANIMATION_MS + ANIMATION_BUFFER_MS;
  }, [displayItems.length]);
  React.useEffect(() => {
    if (!animationWave) return;
    setActiveWave(animationWave);
    const timeout = window.setTimeout(
      () => setActiveWave(0),
      totalAnimationDuration
    );
    return () => window.clearTimeout(timeout);
  }, [animationWave, totalAnimationDuration]);
  const shouldAnimate =
    !isExiting && activeWave === animationWave && activeWave !== 0;
  const delayForIndex = (index: number) =>
    (shouldAnimate || isExiting ? index * STAGGER_INTERVAL_MS : 0);
  return (
    <div className="row g-4">
      {displayItems.map((item, index) => (
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
            socCode={item.socCode}
            isAssignmentJob={item.isAssignmentJob}
            highlight={item.highlight}
            highlightClicked={item.highlightClicked}
            showBookmark={item.showBookmark}
            shouldAnimate={shouldAnimate}
            isExiting={isExiting}
            animationDelayMs={delayForIndex(index)}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
          />
        </div>
      ))}
    </div>
  );
};
