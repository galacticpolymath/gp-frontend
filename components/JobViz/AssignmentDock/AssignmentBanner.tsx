import * as React from "react";
import { useRouter } from "next/router";
import confetti from "canvas-confetti";
import { LucideIcon } from "../LucideIcon";
import {
  areJobRatingsHydrated,
  countRatings,
  JOB_RATINGS_STORAGE_KEY,
  onJobRatingsHydrated,
  ratingEmoji,
  useJobRatings,
} from "../jobRatingsStore";
import type { JobRatingsMap } from "../jobRatingsStore";
import {
  AssignmentParams,
  buildJobvizUrl,
  getIconNameForNode,
  getJobSpecificIconName,
  getNodeBySocCode,
} from "../jobvizUtils";
import { useModalContext } from "../../../providers/ModalProvider";
import {
  computeScrollTipOverlay,
  isScrollTargetHidden,
} from "../assignmentScrollHelpers";
import { useDelayedProgressAnimation } from "../useDelayedProgressAnimation";
import {
  toRectLike,
  useAssignmentDockViewport,
} from "../useAssignmentDockViewport";
import { AssignmentBannerHeader } from "./AssignmentBannerHeader";
import { AssignmentDesktopList } from "./AssignmentDesktopList";
import { AssignmentMobileCarousel } from "./AssignmentMobileCarousel";
import { AssignmentProgress } from "./AssignmentProgress";
import styles from "./AssignmentDock.module.scss";

interface AssignmentBannerProps {
  unitName?: string | null;
  jobs?: [string, string][] | null;
  assignmentParams?: AssignmentParams;
  onJobClick?: (socCode: string) => void;
  variant?: "mobile" | "desktop";
  assignmentUnitLabelOverride?: string | null;
  assignmentCopyOverride?: string | null;
  teacherCtaCopy?: string | null;
  mode?: "assignment" | "tour-editor";
  headerActions?: React.ReactNode;
  markerLabelOverride?: string | null;
  allowShare?: boolean;
  previewBanner?: React.ReactNode;
}

const COMPLETION_MODAL_DELAY_MS = 900;
const RATING_EMOJI_DURATION_MS = 900;
const ASSIGNMENT_EMOJI_ENTRANCE_MS = 200;
const PROGRESS_EMOJI_TOTAL_DELAY_MS =
  RATING_EMOJI_DURATION_MS + ASSIGNMENT_EMOJI_ENTRANCE_MS;
const PROGRESS_ANIMATION_DURATION_MS = 950;

export const AssignmentBanner: React.FC<AssignmentBannerProps> = ({
  unitName,
  jobs,
  assignmentParams,
  onJobClick,
  variant = "mobile",
  assignmentUnitLabelOverride,
  assignmentCopyOverride,
  teacherCtaCopy,
  mode = "assignment",
  headerActions,
  markerLabelOverride,
  allowShare = true,
  previewBanner,
}) => {
  const router = useRouter();
  const modalContext = useModalContext();
  const [, setJobvizSummaryModal] = modalContext._jobvizSummaryModal;
  const [, setJobvizCompletionModal] = modalContext._jobvizCompletionModal;
  const [, setIsJobModalOn] = modalContext._isJobModalOn;
  const [, setSelectedJob] = modalContext._selectedJob;

  const bannerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const completionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const highlightTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const jobButtonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const [activeJobIdx, setActiveJobIdx] = React.useState(0);
  const [clickedSocCodes, setClickedSocCodes] = React.useState<Set<string>>(new Set());
  const [dockCollapsed, setDockCollapsed] = React.useState(false);
  const [flash, setFlash] = React.useState(false);
  const [highlightedSoc, setHighlightedSoc] = React.useState<string | null>(null);
  const [hasCelebratedCompletion, setHasCelebratedCompletion] = React.useState(false);
  const [isEnticementReady, setIsEnticementReady] = React.useState(true);
  const [mobileCollapsed, setMobileCollapsed] = React.useState(false);
  const [scrollTipDismissed, setScrollTipDismissed] = React.useState(false);
  const [scrollTipNeeded, setScrollTipNeeded] = React.useState(false);
  const [showRatingHint, setShowRatingHint] = React.useState(true);
  const [slideDir, setSlideDir] = React.useState<"next" | "prev" | null>(null);
  const [suppressedSocCodes, setSuppressedSocCodes] = React.useState<Set<string>>(
    new Set()
  );
  const [activeSocCode, setActiveSocCode] = React.useState<string | null>(null);
  const [hasStoredRatings, setHasStoredRatings] = React.useState<boolean | null>(
    null
  );
  const [ratingsHydrated, setRatingsHydrated] = React.useState(() =>
    typeof window === "undefined" ? false : areJobRatingsHydrated()
  );

  const shouldRenderBanner = Boolean(unitName) || Boolean(jobs?.length);
  const isDesktopVariant = variant === "desktop";
  const isDockCollapsed = isDesktopVariant && dockCollapsed;

  const { ratings, clearRatings } = useJobRatings();
  const normalizedRatings = React.useMemo<JobRatingsMap>(() => {
    const next: JobRatingsMap = {};
    Object.entries(ratings).forEach(([key, value]) => {
      if (!key) return;
      next[key.trim()] = value;
    });
    return next;
  }, [ratings]);

  const assignmentSocCodes = React.useMemo(
    () =>
      (jobs?.map(([, soc]) => soc?.trim()).filter(
        (soc): soc is string => Boolean(soc)
      ) ?? []),
    [jobs]
  );

  const jobItems = React.useMemo(
    () =>
      (jobs ?? [])
        .map(([title, soc]) => {
          const normalizedSoc = (soc ?? "").trim();
          const node = getNodeBySocCode(normalizedSoc);
          if (!normalizedSoc) return null;
          return {
            iconName: node ? getIconNameForNode(node) : "CircleDot",
            jobIconName: node ? getJobSpecificIconName(node) : undefined,
            soc: normalizedSoc,
            title,
          };
        })
        .filter(Boolean) as {
        iconName: string;
        jobIconName?: string;
        soc: string;
        title: string;
      }[],
    [jobs]
  );

  const clientProgress = React.useMemo(
    () => countRatings(assignmentSocCodes, normalizedRatings),
    [assignmentSocCodes, normalizedRatings]
  );
  const shouldDelayAnimations =
    typeof window === "undefined"
      ? true
      : hasStoredRatings === null
        ? true
        : hasStoredRatings
          ? !ratingsHydrated
          : false;
  const hasHydratedRatings = !shouldDelayAnimations;
  const progress = hasHydratedRatings
    ? clientProgress
    : { rated: 0, total: assignmentSocCodes.length };
  const isAssignmentComplete =
    progress.total > 0 && progress.rated === progress.total;

  const nextUnratedSoc = React.useMemo(() => {
    const nextJob = jobItems.find(({ soc }) => !normalizedRatings[soc]);
    return nextJob?.soc ?? null;
  }, [jobItems, normalizedRatings]);
  const emojiRatings = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(normalizedRatings).map(([soc, value]) => [
          soc,
          value ? ratingEmoji(value) : undefined,
        ])
      ),
    [normalizedRatings]
  );

  const assignmentUnitLabelValue = assignmentUnitLabelOverride?.trim();
  const resolvedUnitLabel = assignmentUnitLabelValue
    ? assignmentUnitLabelValue
    : unitName
      ? `Jobs related to the ${unitName} unit`
      : null;
  const assignmentCopyOverrideValue = assignmentCopyOverride?.trim();
  const resolvedAssignmentCopy = assignmentCopyOverrideValue ? (
    assignmentCopyOverrideValue
  ) : (
    <>
      Explore and rate each of these jobs. Be prepared to explain your ratings{" "}
      <em>with data</em> and other reasoning.
    </>
  );
  const resolvedTeacherCtaCopy = teacherCtaCopy?.trim() || null;
  const markerLabel =
    markerLabelOverride?.trim() ||
    (mode === "tour-editor" ? "JobViz+ | Tour Builder" : "JobViz+ | Assignment");

  const handleJobClick = React.useCallback(
    (socCode: string) => {
      setClickedSocCodes((prev) => new Set(prev).add(socCode));
      if (onJobClick) {
        onJobClick(socCode);
        return;
      }
      const node = getNodeBySocCode(socCode);
      if (!node) return;
      router.push(buildJobvizUrl({ fromNode: node }, assignmentParams), undefined, {
        scroll: false,
        shallow: true,
      });
    },
    [assignmentParams, onJobClick, router]
  );

  const closeJobModal = React.useCallback(() => {
    setSelectedJob(null);
    setIsJobModalOn(false);
  }, [setIsJobModalOn, setSelectedJob]);

  const handleOpenSummaryModal = React.useCallback(() => {
    if (!allowShare || !jobItems.length) return;
    closeJobModal();
    setJobvizSummaryModal({
      isDisplayed: true,
      unitName,
      jobs: jobItems.map(({ title, soc }) => ({ title, soc })),
      payload: null,
      allowEditing: true,
    });
  }, [allowShare, closeJobModal, jobItems, setJobvizSummaryModal, unitName]);

  const handleProgressAnimationComplete = React.useCallback(() => {
    setIsEnticementReady(true);
  }, []);

  const {
    displayedRated: safeDisplayedProgressRated,
    isAnimating: shouldAnimateProgress,
  } = useDelayedProgressAnimation({
    rated: progress.rated,
    total: progress.total,
    delayMs: PROGRESS_EMOJI_TOTAL_DELAY_MS,
    animationDurationMs: PROGRESS_ANIMATION_DURATION_MS,
    onAnimationComplete: handleProgressAnimationComplete,
  });

  const activeJob = jobItems[activeJobIdx] ?? null;
  const isActiveJobUnrated = Boolean(activeJob && !normalizedRatings[activeJob.soc]);
  const isActiveJobSuppressed = Boolean(
    activeJob && suppressedSocCodes.has(activeJob.soc)
  );
  const isActiveJobNextToRate = Boolean(
    !isDesktopVariant && activeJob && activeJob.soc === nextUnratedSoc
  );
  const shouldGlowActiveJob = Boolean(
    !shouldDelayAnimations &&
      isActiveJobNextToRate &&
      isActiveJobUnrated &&
      !isActiveJobSuppressed &&
      isEnticementReady
  );
  const shouldPulseNextArrow = Boolean(
    !shouldDelayAnimations &&
      !isDesktopVariant &&
      activeJob &&
      normalizedRatings[activeJob.soc] &&
      isEnticementReady
  );

  const registerJobButtonRef = React.useCallback(
    (soc: string) => (node: HTMLButtonElement | null) => {
      if (!node) {
        jobButtonRefs.current.delete(soc);
        return;
      }
      jobButtonRefs.current.set(soc, node);
    },
    []
  );

  const triggerAssignmentConfetti = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const duration = 2200;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 40,
      spread: 90,
      ticks: 110,
      gravity: 1,
      decay: 0.92,
      colors: ["#ffd966", "#9ff2c1", "#6ec8ff", "#f6a6ff"],
      disableForReducedMotion: true,
    };
    const frame = () => {
      const timeLeft = animationEnd - Date.now();
      const particleCount = Math.round(12 * Math.max(timeLeft / duration, 0));
      if (particleCount > 0) {
        confetti({
          ...defaults,
          origin: { x: Math.random(), y: Math.random() * 0.4 + 0.2 },
          particleCount,
        });
        window.requestAnimationFrame(frame);
      }
    };
    window.requestAnimationFrame(frame);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(JOB_RATINGS_STORAGE_KEY);
      setHasStoredRatings(Boolean(stored));
    } catch {
      setHasStoredRatings(false);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (areJobRatingsHydrated()) {
      setRatingsHydrated(true);
      return;
    }
    return onJobRatingsHydrated(() => setRatingsHydrated(true));
  }, []);

  React.useEffect(() => {
    if (!jobItems.length) return;
    const timer = setTimeout(() => setShowRatingHint(false), 4000);
    return () => clearTimeout(timer);
  }, [jobItems.length]);

  React.useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!jobItems.length) return;
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 250);
    return () => clearTimeout(timer);
  }, [activeJobIdx, jobItems.length]);

  React.useEffect(() => {
    if (!allowShare || !isAssignmentComplete || hasCelebratedCompletion) return;
    setHasCelebratedCompletion(true);
    setMobileCollapsed(true);
    setDockCollapsed(true);
    triggerAssignmentConfetti();
    closeJobModal();
    completionTimeoutRef.current = setTimeout(() => {
      setJobvizCompletionModal({
        isDisplayed: true,
        unitName,
        onShare: handleOpenSummaryModal,
      });
      completionTimeoutRef.current = null;
    }, COMPLETION_MODAL_DELAY_MS);
  }, [
    allowShare,
    closeJobModal,
    handleOpenSummaryModal,
    hasCelebratedCompletion,
    isAssignmentComplete,
    setJobvizCompletionModal,
    triggerAssignmentConfetti,
    unitName,
  ]);

  React.useEffect(() => {
    if (isAssignmentComplete || !hasCelebratedCompletion) return;
    setHasCelebratedCompletion(false);
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
    setJobvizCompletionModal((prev) => ({
      ...prev,
      isDisplayed: false,
      onShare: null,
    }));
  }, [hasCelebratedCompletion, isAssignmentComplete, setJobvizCompletionModal]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleHighlight = (event: Event) => {
      const detail = (event as CustomEvent<{ socCode?: string; phase?: string }>).detail;
      const socCode = detail?.socCode;
      if (!socCode) return;
      if (detail?.phase === "start") {
        setIsEnticementReady(false);
        setSuppressedSocCodes((prev) => new Set(prev).add(socCode));
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        setHighlightedSoc((current) => (current === socCode ? null : current));
        return;
      }
      setSuppressedSocCodes((prev) => {
        const next = new Set(prev);
        next.delete(socCode);
        return next;
      });
      setHighlightedSoc(socCode);
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedSoc((current) => (current === socCode ? null : current));
        highlightTimeoutRef.current = null;
      }, 600);
    };

    const handleActiveSoc = (event: Event) => {
      const detail = (event as CustomEvent<{ socCode?: string | null }>).detail;
      setActiveSocCode(detail?.socCode ?? null);
    };

    window.addEventListener("jobviz-rating-highlight", handleHighlight);
    window.addEventListener("jobviz-modal-soc-change", handleActiveSoc);
    return () => {
      window.removeEventListener("jobviz-rating-highlight", handleHighlight);
      window.removeEventListener("jobviz-modal-soc-change", handleActiveSoc);
    };
  }, []);

  const activateJobAtIndex = React.useCallback(
    (index: number, direction: "next" | "prev") => {
      if (!jobItems.length) return;
      const normalizedIndex = ((index % jobItems.length) + jobItems.length) % jobItems.length;
      setSlideDir(direction);
      setActiveJobIdx(normalizedIndex);
      handleJobClick(jobItems[normalizedIndex].soc);
    },
    [handleJobClick, jobItems]
  );

  const handlePrev = React.useCallback(() => {
    activateJobAtIndex(activeJobIdx - 1, "prev");
  }, [activateJobAtIndex, activeJobIdx]);

  const handleNext = React.useCallback(() => {
    activateJobAtIndex(activeJobIdx + 1, "next");
  }, [activateJobAtIndex, activeJobIdx]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDesktopVariant || isDockCollapsed || !bannerRef.current) {
      document.documentElement.style.setProperty("--jobviz-desktop-dock-width", "0px");
      return;
    }
    const updateWidth = () => {
      const width = bannerRef.current?.getBoundingClientRect().width ?? 0;
      document.documentElement.style.setProperty(
        "--jobviz-desktop-dock-width",
        `${width}px`
      );
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(bannerRef.current);
    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty("--jobviz-desktop-dock-width", "0px");
    };
  }, [isDesktopVariant, isDockCollapsed]);

  const viewport = useAssignmentDockViewport({
    enabled: isDesktopVariant && !isDockCollapsed && shouldRenderBanner,
  });

  const registerScrollNode = React.useCallback(
    (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      viewport.registerScrollNode(node);
    },
    [viewport]
  );

  const registerFooterNode = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewport.registerFooterNode(node);
    },
    [viewport]
  );

  React.useEffect(() => {
    if (
      !viewport.contentRect ||
      !nextUnratedSoc ||
      !isDesktopVariant ||
      isDockCollapsed ||
      scrollTipDismissed
    ) {
      setScrollTipNeeded(false);
      return;
    }
    const target = jobButtonRefs.current.get(nextUnratedSoc);
    if (!target) {
      setScrollTipNeeded(false);
      return;
    }
    setScrollTipNeeded(
      isScrollTargetHidden(
        toRectLike(target.getBoundingClientRect()),
        viewport.contentRect
      )
    );
  }, [
    isDesktopVariant,
    isDockCollapsed,
    nextUnratedSoc,
    scrollTipDismissed,
    viewport.contentRect,
  ]);

  React.useEffect(() => {
    if (!scrollTipNeeded || scrollTipDismissed || !scrollRef.current) return;
    const handleScroll = () => setScrollTipDismissed(true);
    const node = scrollRef.current;
    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, [scrollTipDismissed, scrollTipNeeded]);

  const scrollTipStyle = React.useMemo(() => {
    if (
      !scrollTipNeeded ||
      scrollTipDismissed ||
      !viewport.footerRect ||
      !viewport.windowSize.width ||
      !viewport.windowSize.height
    ) {
      return null;
    }
    return computeScrollTipOverlay(viewport.footerRect, viewport.windowSize);
  }, [scrollTipDismissed, scrollTipNeeded, viewport.footerRect, viewport.windowSize]);

  if (!shouldRenderBanner) return null;

  const header = (
    <AssignmentBannerHeader
      headerActions={headerActions}
      markerLabel={markerLabel}
      previewBanner={previewBanner}
      resolvedAssignmentCopy={resolvedAssignmentCopy}
      resolvedTeacherCtaCopy={resolvedTeacherCtaCopy}
      resolvedUnitLabel={resolvedUnitLabel}
    />
  );

  const progressSection = (
    <AssignmentProgress
      allowShare={allowShare}
      hasJobs={assignmentSocCodes.length > 0}
      isAssignmentComplete={isAssignmentComplete}
      jobItemsLength={jobItems.length}
      onOpenSummaryModal={handleOpenSummaryModal}
      progress={progress}
      safeDisplayedProgressRated={safeDisplayedProgressRated}
      shouldAnimateProgress={shouldAnimateProgress}
      variant={variant}
    />
  );

  return (
    <>
      <div
        ref={bannerRef}
        className={`${styles.shell} ${
          isDesktopVariant ? styles.desktopDock : styles.mobileWrapper
        }`}
        data-collapsed={isDockCollapsed ? "true" : "false"}
      >
        <div className={styles.desktopFrame}>
          {isDesktopVariant ? (
            <button
              type="button"
              className={styles.dockToggle}
              onClick={() => setDockCollapsed((prev) => !prev)}
              aria-label={isDockCollapsed ? "Show assignment" : "Hide assignment"}
            >
              <LucideIcon name={isDockCollapsed ? "ChevronsLeft" : "ChevronsRight"} />
            </button>
          ) : null}
          {isDesktopVariant ? (
            <div className={styles.collapsedRailLabel}>
              {mode === "tour-editor" ? "Tour Builder" : "Assignment"}
            </div>
          ) : null}
          <div
            className={`${styles.banner} ${
              isDesktopVariant ? styles.desktopBanner : ""
            }`}
          >
            <div className={`${styles.inner} ${flash ? styles.innerFlash : ""}`}>
              {!isDesktopVariant ? (
                <div className={styles.mobileControls}>
                  <button
                    type="button"
                    className={styles.collapseToggle}
                    onClick={() => setMobileCollapsed((prev) => !prev)}
                  >
                    {mobileCollapsed ? "Show assignment" : "Hide assignment"}
                    <LucideIcon
                      name={mobileCollapsed ? "ChevronDown" : "ChevronUp"}
                      className={styles.collapseIcon}
                    />
                  </button>
                  {!mobileCollapsed && mode === "assignment" ? (
                    <button
                      type="button"
                      className={styles.clearButtonInline}
                      onClick={clearRatings}
                    >
                      Clear ratings
                    </button>
                  ) : null}
                </div>
              ) : null}

              {!mobileCollapsed ? header : null}
              {!mobileCollapsed ? progressSection : null}

              {!mobileCollapsed ? (
                <div
                  ref={isDesktopVariant ? registerScrollNode : undefined}
                  className={`${styles.content} ${
                    isDesktopVariant ? styles.desktopContent : ""
                  }`}
                >
                  {isDesktopVariant ? (
                    <AssignmentDesktopList
                      activeSocCode={activeSocCode}
                      clickedSocCodes={clickedSocCodes}
                      hasHydratedRatings={hasHydratedRatings}
                      highlightedSoc={highlightedSoc}
                      isDesktopVariant={isDesktopVariant}
                      isEnticementReady={isEnticementReady}
                      jobItems={jobItems.map((item) => ({
                        ...item,
                        title: item.title,
                      }))}
                      nextUnratedSoc={nextUnratedSoc}
                      normalizedRatings={emojiRatings}
                      onJobClick={handleJobClick}
                      registerJobButtonRef={registerJobButtonRef}
                      showRatingHint={showRatingHint}
                      shouldDelayAnimations={shouldDelayAnimations}
                      suppressedSocCodes={suppressedSocCodes}
                    />
                  ) : (
                    <AssignmentMobileCarousel
                      activeJob={
                        activeJob
                          ? {
                              ...activeJob,
                              title: activeJob.title,
                            }
                          : null
                      }
                      activeJobIdx={activeJobIdx}
                      activeSocCode={activeSocCode}
                      clickedSocCodes={clickedSocCodes}
                      handleNext={handleNext}
                      handlePrev={handlePrev}
                      hasHydratedRatings={hasHydratedRatings}
                      highlightedSoc={highlightedSoc}
                      isActiveJobNextToRate={isActiveJobNextToRate}
                      isActiveJobSuppressed={isActiveJobSuppressed}
                      isActiveJobUnrated={isActiveJobUnrated}
                      normalizedRatings={emojiRatings}
                      onJobClick={handleJobClick}
                      shouldGlowActiveJob={shouldGlowActiveJob}
                      shouldPulseNextArrow={shouldPulseNextArrow}
                      showRatingHint={showRatingHint}
                      slideDir={slideDir}
                    />
                  )}
                </div>
              ) : null}
            </div>
          </div>
          {isDesktopVariant && !isDockCollapsed ? (
            <div ref={registerFooterNode} className={styles.clearFooter}>
              <button type="button" onClick={clearRatings}>
                Clear ratings
              </button>
            </div>
          ) : null}
          {isDesktopVariant ? (
            <div className={styles.collapsedNotice}>
              <LucideIcon name="ClipboardList" aria-hidden="true" />
              <span>Show more</span>
            </div>
          ) : null}
        </div>
      </div>
      {scrollTipStyle ? (
        <div
          className={`${styles.scrollTip} ${styles.scrollTipOverlay}`}
          role="status"
          style={{
            bottom: `${scrollTipStyle.bottom}px`,
            left: `${scrollTipStyle.left}px`,
            width: `${scrollTipStyle.width}px`,
          }}
        >
          <LucideIcon name="ArrowDown" aria-hidden="true" />
          <span>Scroll to the next job...</span>
        </div>
      ) : null}
    </>
  );
};
