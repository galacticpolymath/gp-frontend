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
  socCode?: string | null;
  isAssignmentJob?: boolean;
  isLocked?: boolean;
}

export interface CardAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type JobVizNavigationDirection = "down" | "up";

export interface JobVizNavigationHint {
  wave: number;
  direction: JobVizNavigationDirection;
  anchor?: CardAnchor | null;
  pivotId?: string | null;
}

export interface JobVizGridProps {
  items: JobVizGridItem[];
  onItemClick?: (
    item: JobVizGridItem,
    meta?: { cardRect?: CardAnchor | null; itemId?: string }
  ) => void;
  navigationHint?: JobVizNavigationHint | null;
  onExitComplete?: () => void;
}

const STAGGER_INTERVAL_MS = 140;
const CARD_ANIMATION_MS = 860;
const ANIMATION_BUFFER_MS = 320;
const SWAP_DELAY_DOWN = 820;
const SWAP_DELAY_UP = 740;
const GRID_ENTRANCE_HOLD_MS = 320;

export const JobVizGrid: React.FC<JobVizGridProps> = ({
  items,
  onItemClick,
  navigationHint,
  onExitComplete,
}) => {
  const [displayItems, setDisplayItems] = React.useState(items);
  const [animationWave, setAnimationWave] = React.useState(0);
  const [activeWave, setActiveWave] = React.useState(0);
  const [handledWave, setHandledWave] = React.useState<number | null>(null);
  const [isExiting, setIsExiting] = React.useState(false);
  const [activeDirection, setActiveDirection] =
    React.useState<JobVizNavigationDirection>("down");
  const [activePivotId, setActivePivotId] = React.useState<string | null>(null);
  const [pivotShift, setPivotShift] = React.useState<{ dx: number; dy: number }>(
    { dx: 0, dy: 0 }
  );
  const initialWaveAppliedRef = React.useRef(false);

  const latestItemsRef = React.useRef(items);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const exitSignatureRef = React.useRef<string | null>(null);
  const exitTimerDoneRef = React.useRef(false);
  const pendingItemsReadyRef = React.useRef(false);

  React.useEffect(() => {
    latestItemsRef.current = items;
  }, [items]);

  const itemsSignature = React.useMemo(
    () => items.map((item) => `${item.id}-${item.level}`).join("|"),
    [items]
  );
  const signatureRef = React.useRef(itemsSignature);

  React.useEffect(() => {
    if (initialWaveAppliedRef.current) return;
    if (!items.length) return;
    initialWaveAppliedRef.current = true;
    setAnimationWave(1);
  }, [items.length]);

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
    shouldAnimate || isExiting ? index * STAGGER_INTERVAL_MS : 0;

  const maybeEnterNextWave = React.useCallback(() => {
    if (!isExiting) return;
    if (!exitTimerDoneRef.current) return;
    if (!pendingItemsReadyRef.current) return;
    exitSignatureRef.current = null;
    pendingItemsReadyRef.current = false;
    exitTimerDoneRef.current = false;
    setDisplayItems(latestItemsRef.current);
    setIsExiting(false);
    setAnimationWave((prev) => prev + 1);
    setActivePivotId(null);
    setPivotShift({ dx: 0, dy: 0 });
  }, [isExiting]);

  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  React.useEffect(() => {
    signatureRef.current = itemsSignature;
    if (isExiting) {
      if (
        exitSignatureRef.current &&
        exitSignatureRef.current !== itemsSignature
      ) {
        pendingItemsReadyRef.current = true;
        maybeEnterNextWave();
      }
      return;
    }
    setDisplayItems(items);
    setAnimationWave((prev) => prev + 1);
  }, [items, itemsSignature, isExiting, maybeEnterNextWave]);

  React.useEffect(() => {
    if (!navigationHint || navigationHint.wave === handledWave) return;
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
    setActiveDirection(navigationHint.direction);
    setActivePivotId(
      navigationHint.direction === "down" ? navigationHint.pivotId ?? null : null
    );
    setHandledWave(navigationHint.wave);
    exitSignatureRef.current = signatureRef.current;
    exitTimerDoneRef.current = false;
    pendingItemsReadyRef.current = false;
    setIsExiting(true);
    const swapDelay =
      navigationHint.direction === "down" ? SWAP_DELAY_DOWN : SWAP_DELAY_UP;
    const totalDelay = swapDelay + GRID_ENTRANCE_HOLD_MS;
    const swapId = setTimeout(() => {
      exitTimerDoneRef.current = true;
      maybeEnterNextWave();
      onExitComplete?.();
    }, totalDelay);
    timeoutsRef.current.push(swapId);
  }, [
    navigationHint,
    handledWave,
    onExitComplete,
    maybeEnterNextWave,
  ]);

  React.useLayoutEffect(() => {
    if (
      !navigationHint ||
      navigationHint.direction !== "down" ||
      !navigationHint.anchor ||
      !navigationHint.pivotId
    ) {
      setPivotShift({ dx: 0, dy: 0 });
      return;
    }
    const stageRect = stageRef.current?.getBoundingClientRect();
    if (!stageRect) {
      setPivotShift({ dx: 0, dy: 0 });
      return;
    }
    const anchor = navigationHint.anchor;
    const cardCenterX = anchor.x + anchor.width / 2;
    const stageCenterX = stageRect.left + stageRect.width / 2;
    setPivotShift({
      dx: stageCenterX - cardCenterX,
      dy: 0,
    });
  }, [
    navigationHint?.anchor,
    navigationHint?.direction,
    navigationHint?.pivotId,
  ]);

  const exitDirection = isExiting ? activeDirection : null;
  const entranceDirection = shouldAnimate ? activeDirection : "down";

  return (
    <div className={styles.jobvizGridStage} ref={stageRef}>
      <div className="row g-4">
        {displayItems.map((item, index) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.id}>
          <JobVizCard
            title={item.title}
            iconName={item.iconName}
            level={item.level}
            cardId={item.id}
              jobsCount={item.jobsCount}
              growthPercent={item.growthPercent}
              wage={item.wage}
              education={item.education}
              jobIconName={item.jobIconName}
              socCode={item.socCode}
              isAssignmentJob={item.isAssignmentJob}
              isLocked={item.isLocked}
              highlight={item.highlight}
              highlightClicked={item.highlightClicked}
              showBookmark={item.showBookmark}
              shouldAnimate={shouldAnimate}
              isExiting={isExiting}
              entranceDirection={entranceDirection}
              exitDirection={exitDirection}
              isPivot={activePivotId === item.id && exitDirection === "down"}
              pivotShift={pivotShift}
              animationDelayMs={delayForIndex(index)}
              onCardAction={
                onItemClick
                  ? (meta) =>
                      onItemClick(item, {
                        ...meta,
                        itemId: item.id,
                      })
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};
