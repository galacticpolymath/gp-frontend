 
import * as React from "react";
import { useRouter } from "next/router";
import confetti from "canvas-confetti";
import styles from "../../styles/jobvizBurst.module.scss";
import { LucideIcon } from "./LucideIcon";
import {
  AssignmentParams,
  buildJobvizUrl,
  getIconNameForNode,
  getJobSpecificIconName,
  getNodeBySocCode,
} from "./jobvizUtils";
import {
  countRatings,
  ratingEmoji,
  useJobRatings,
  areJobRatingsHydrated,
  onJobRatingsHydrated,
  JOB_RATINGS_STORAGE_KEY,
} from "./jobRatingsStore";
import type { JobRatingsMap } from "./jobRatingsStore";
import { useModalContext } from "../../providers/ModalProvider";
import {
  useAssignmentDockViewport,
  toRectLike,
  type RectLike,
} from "./useAssignmentDockViewport";
import {
  computeScrollTipOverlay,
  isScrollTargetHidden,
} from "./assignmentScrollHelpers";
import { useDelayedProgressAnimation } from "./useDelayedProgressAnimation";

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
  editorFields?: React.ReactNode;
  markerLabelOverride?: string | null;
  allowShare?: boolean;
}

const ASSIGNMENT_LOGO = "/plus/gp-plus-submark.png";
const COMPLETION_MODAL_DELAY_MS = 900;
const RATING_EMOJI_DURATION_MS = 900;
const ASSIGNMENT_EMOJI_ENTRANCE_MS = 200;
const PROGRESS_EMOJI_TOTAL_DELAY_MS =
  RATING_EMOJI_DURATION_MS + ASSIGNMENT_EMOJI_ENTRANCE_MS;
const PROGRESS_ANIMATION_DURATION_MS = 950;

const formatAssignmentTitle = (value: string) =>
  value.replace(/\sand\s/gi, " & ");

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
  editorFields,
  markerLabelOverride,
  allowShare = true,
}) => {
  const router = useRouter();
  const modalContext = useModalContext();
  const [, setJobvizSummaryModal] = modalContext._jobvizSummaryModal;
  const [, setJobvizCompletionModal] = modalContext._jobvizCompletionModal;
  const [isJobModalOn, setIsJobModalOn] = modalContext._isJobModalOn;
  const [, setSelectedJob] = modalContext._selectedJob;
  const [clickedSocCodes, setClickedSocCodes] = React.useState<Set<string>>(
    new Set()
  );
  const bannerRef = React.useRef<HTMLDivElement | null>(null);
  const infoBlockRef = React.useRef<HTMLDivElement | null>(null);
  const jobButtonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const assignmentScrollNodeRef = React.useRef<HTMLDivElement | null>(null);
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
  const [activeJobIdx, setActiveJobIdx] = React.useState(0);
  const [slideDir, setSlideDir] = React.useState<"next" | "prev" | null>(null);
  const [flash, setFlash] = React.useState(false);
  const highlightTimeoutRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionModalTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [highlightedSoc, setHighlightedSoc] = React.useState<string | null>(null);
  const [suppressedSocCodes, setSuppressedSocCodes] = React.useState<Set<string>>(new Set());
  const [mobileCollapsed, setMobileCollapsed] = React.useState(false);
  const [hasCelebratedCompletion, setHasCelebratedCompletion] = React.useState(false);
  const [scrollTipNeeded, setScrollTipNeeded] = React.useState(false);
  const [scrollTipDismissed, setScrollTipDismissed] = React.useState(false);
  const shouldRenderBanner =
    Boolean(unitName) || Boolean(jobs?.length);
  const isMobile = variant === "mobile";
  const infoSectionId = isMobile ? "assignmentInfoBlock" : undefined;
  const hideInfoSection = isMobile && mobileCollapsed;
  const shouldShowAssignmentBody = !isMobile || !mobileCollapsed;
  const shouldShowCollapsedMobileContent = isMobile;
  const [showRatingHint, setShowRatingHint] = React.useState(true);
  const [dockCollapsed, setDockCollapsed] = React.useState(false);
  const [isEnticementReady, setIsEnticementReady] = React.useState(true);
  const isDesktopVariant = variant === "desktop";
  const isDockCollapsed = isDesktopVariant && dockCollapsed;
  const wrapperClass =
    variant === "desktop"
      ? styles.assignmentDesktopDock
      : styles.assignmentMobileWrapper;
  const showAssignmentPanel = !isDesktopVariant || !isDockCollapsed;
  const isDockViewportEnabled =
    shouldRenderBanner && isDesktopVariant && !isDockCollapsed;
  const {
    registerScrollNode: registerAssignmentScrollNode,
    registerFooterNode: registerAssignmentFooterNode,
    contentRect: assignmentContentRect,
    footerRect: assignmentFooterRect,
    windowSize: assignmentWindowSize,
  } = useAssignmentDockViewport({
    enabled: isDockViewportEnabled,
  });
  const handleAssignmentScrollRegister = React.useCallback(
    (node: HTMLDivElement | null) => {
      assignmentScrollNodeRef.current = node;
      registerAssignmentScrollNode(node);
    },
    [registerAssignmentScrollNode]
  );
  const assignmentUnitLabelValue = assignmentUnitLabelOverride?.trim();
  const resolvedUnitLabel = assignmentUnitLabelValue
    ? assignmentUnitLabelValue
    : unitName
      ? `Jobs related to the ${unitName} unit`
      : null;
  const defaultAssignmentCopyNode = (
    <>
      Explore and rate each of these jobs. Be prepared to explain your ratings{" "}
      <em>with data</em> and other reasoning.
    </>
  );
  const assignmentCopyOverrideValue = assignmentCopyOverride?.trim();
  const hasAssignmentCopyOverride = Boolean(assignmentCopyOverrideValue);
  const resolvedAssignmentCopy = hasAssignmentCopyOverride
    ? assignmentCopyOverrideValue
    : defaultAssignmentCopyNode;
  const resolvedTeacherCtaCopy = teacherCtaCopy?.trim() || null;
  const shouldShowRatings = mode === "assignment";
  const markerLabel =
    markerLabelOverride?.trim() ||
    (mode === "tour-editor" ? "JobViz+ | TOUR BUILDER" : "JobViz+ | ASSIGNMENT");
  const { ratings, clearRatings } = useJobRatings();
  const normalizedRatings = React.useMemo<JobRatingsMap>(() => {
    const next: JobRatingsMap = {};
    Object.entries(ratings).forEach(([key, value]) => {
      if (!key) return;
      next[key.trim()] = value;
    });
    return next;
  }, [ratings]);
  const [hasStoredRatings, setHasStoredRatings] = React.useState<boolean | null>(
    null
  );
  const [ratingsHydrated, setRatingsHydrated] = React.useState(() =>
    typeof window === "undefined" ? false : areJobRatingsHydrated()
  );
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
    if (typeof window === "undefined") return undefined;
    if (areJobRatingsHydrated()) {
      setRatingsHydrated(true);
      return undefined;
    }
    const unsubscribe = onJobRatingsHydrated(() => {
      setRatingsHydrated(true);
    });
    return unsubscribe;
  }, []);
  const shouldDelayAnimations =
    typeof window === "undefined"
      ? true
      : hasStoredRatings === null
        ? true
        : hasStoredRatings
          ? !ratingsHydrated
          : false;
  const hasHydratedRatings = !shouldDelayAnimations;

  React.useEffect(() => {
    if (!isMobile) {
      infoBlockRef.current?.removeAttribute("inert");
      return;
    }
    const infoElement = infoBlockRef.current;
    if (!infoElement) return;
    if (hideInfoSection) {
      infoElement.setAttribute("inert", "");
    } else {
      infoElement.removeAttribute("inert");
    }
  }, [hideInfoSection, isMobile]);

  React.useEffect(() => {
    return () => {
      if (completionModalTimeoutRef.current) {
        clearTimeout(completionModalTimeoutRef.current);
        completionModalTimeoutRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleHighlight = (event: Event) => {
      const detail = (event as CustomEvent<{
        socCode?: string;
        phase?: "start" | "finish";
      }>).detail;
      const socCode = detail?.socCode;
      const phase = detail?.phase ?? "finish";
      if (!socCode) return;
      if (phase === "start") {
        setIsEnticementReady(false);
        setSuppressedSocCodes((prev) => {
          const next = new Set(prev);
          next.add(socCode);
          return next;
        });
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = null;
        }
        setHighlightedSoc((current) => (current === socCode ? null : current));
        return;
      }

      setSuppressedSocCodes((prev) => {
        const next = new Set(prev);
        next.delete(socCode);
        return next;
      });
      setHighlightedSoc(socCode);
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedSoc((current) => (current === socCode ? null : current));
        highlightTimeoutRef.current = null;
      }, 600);
    };

    window.addEventListener("jobviz-rating-highlight", handleHighlight);
    return () => {
      window.removeEventListener("jobviz-rating-highlight", handleHighlight);
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    };
  }, []);

  const assignmentSocCodes = React.useMemo(
    () =>
      (jobs?.map(([, soc]) => soc?.trim()).filter(
        (soc): soc is string => Boolean(soc)
      ) ?? []),
    [jobs]
  );
  const clientProgress = React.useMemo(() => {
    return countRatings(assignmentSocCodes, normalizedRatings);
  }, [assignmentSocCodes, normalizedRatings]);
  const progress = hasHydratedRatings
    ? clientProgress
    : { rated: 0, total: assignmentSocCodes.length };
  const isAssignmentComplete = Boolean(
    progress.total > 0 && progress.rated === progress.total
  );
  const handleJobClick = React.useCallback(
    (socCode: string) => {
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
      router.push(url, undefined, { scroll: false, shallow: true });
    },
    [assignmentParams, onJobClick, router]
  );

  const jobItems = React.useMemo(() => {
    if (!jobs?.length) return [];
    return jobs.map(([title, soc]) => {
      const normalizedSoc = (soc ?? "").trim();
      const node = getNodeBySocCode(normalizedSoc);
      const iconName = node ? getIconNameForNode(node) : "CircleDot";
      const jobIconName = node ? getJobSpecificIconName(node) : undefined;
      return { title, soc: normalizedSoc, iconName, jobIconName };
    });
  }, [jobs]);

  const closeJobModal = React.useCallback(() => {
    setSelectedJob(null);
    setIsJobModalOn(false);
  }, [setIsJobModalOn, setSelectedJob]);

  const handleOpenSummaryModal = React.useCallback(() => {
    if (!allowShare) return;
    if (!jobItems.length) return;
    closeJobModal();
    setJobvizSummaryModal({
      isDisplayed: true,
      unitName,
      jobs: jobItems.map(({ title, soc }) => ({ title, soc })),
      payload: null,
      allowEditing: true,
    });
  }, [allowShare, closeJobModal, jobItems, setJobvizSummaryModal, unitName]);

  const triggerAssignmentConfetti = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const duration = 2400;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 42,
      spread: 95,
      ticks: 120,
      gravity: 1,
      decay: 0.92,
      colors: ["#ffd966", "#9ff2c1", "#6ec8ff", "#f6a6ff"],
      disableForReducedMotion: true,
    };
    const frame = () => {
      const timeLeft = animationEnd - Date.now();
      const progress = Math.max(timeLeft / duration, 0);
      const particleCount = Math.round(12 * progress);
      if (particleCount > 0) {
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random(), y: Math.random() * 0.4 + 0.2 },
        });
        window.requestAnimationFrame(frame);
      }
    };
    window.requestAnimationFrame(frame);
  }, []);

  React.useEffect(() => {
    if (!isAssignmentComplete && hasCelebratedCompletion) {
      setHasCelebratedCompletion(false);
      if (completionModalTimeoutRef.current) {
        clearTimeout(completionModalTimeoutRef.current);
        completionModalTimeoutRef.current = null;
      }
      setJobvizCompletionModal((prev) => ({
        ...prev,
        isDisplayed: false,
        onShare: null,
      }));
      return;
    }

    if (!allowShare || !isAssignmentComplete || hasCelebratedCompletion) {
      return;
    }

    setHasCelebratedCompletion(true);
    setMobileCollapsed(true);
    setDockCollapsed(true);
    triggerAssignmentConfetti();
    closeJobModal();
    if (completionModalTimeoutRef.current) {
      clearTimeout(completionModalTimeoutRef.current);
    }
    completionModalTimeoutRef.current = setTimeout(() => {
      setJobvizCompletionModal({
        isDisplayed: true,
        unitName,
        onShare: handleOpenSummaryModal,
      });
      completionModalTimeoutRef.current = null;
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

  const nextUnratedSoc = React.useMemo(() => {
    if (!jobItems.length) return null;
    const nextJob = jobItems.find(({ soc }) => !normalizedRatings[soc]);
    return nextJob?.soc ?? null;
  }, [jobItems, normalizedRatings]);

  const shouldShowScrollTip =
    isDesktopVariant && !isDockCollapsed && scrollTipNeeded && !scrollTipDismissed;

  React.useEffect(() => {
    if (
      !assignmentContentRect ||
      !isDockViewportEnabled ||
      !nextUnratedSoc ||
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
    const targetRect = toRectLike(target.getBoundingClientRect());
    const hidden = isScrollTargetHidden(targetRect, assignmentContentRect);
    setScrollTipNeeded(hidden);
  }, [
    assignmentContentRect,
    isDockViewportEnabled,
    nextUnratedSoc,
    scrollTipDismissed,
  ]);

  const scrollTipStyle = React.useMemo(() => {
    if (
      !shouldShowScrollTip ||
      !assignmentFooterRect ||
      !assignmentWindowSize.width ||
      !assignmentWindowSize.height
    ) {
      return null;
    }
    return computeScrollTipOverlay(assignmentFooterRect, assignmentWindowSize);
  }, [
    assignmentFooterRect,
    assignmentWindowSize.height,
    assignmentWindowSize.width,
    shouldShowScrollTip,
  ]);

  const splitJobs = React.useMemo(() => {
    if (!jobItems.length) return [];
    const midpoint = Math.ceil(jobItems.length / 2);
    return [jobItems.slice(0, midpoint), jobItems.slice(midpoint)];
  }, [jobItems]);

  React.useEffect(() => {
    if (!shouldShowScrollTip || scrollTipDismissed) {
      return undefined;
    }
    const node = assignmentScrollNodeRef.current;
    if (!node) {
      return undefined;
    }
    const handleScroll = () => {
      setScrollTipDismissed(true);
    };
    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", handleScroll);
    };
  }, [scrollTipDismissed, shouldShowScrollTip]);

  React.useEffect(() => {
    if (!shouldShowScrollTip || scrollTipDismissed) {
      return undefined;
    }
    const handleGlobalScroll = () => {
      setScrollTipDismissed(true);
    };
    const options: AddEventListenerOptions = { passive: true };
    window.addEventListener("wheel", handleGlobalScroll, options);
    window.addEventListener("touchmove", handleGlobalScroll, options);
    return () => {
      window.removeEventListener("wheel", handleGlobalScroll, options);
      window.removeEventListener("touchmove", handleGlobalScroll, options);
    };
  }, [scrollTipDismissed, shouldShowScrollTip]);

  const [activeSocCode, setActiveSocCode] = React.useState<string | null>(null);
  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ socCode?: string | null }>).detail;
      setActiveSocCode(detail?.socCode ?? null);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("jobviz-modal-soc-change", handler);
      handler(new CustomEvent("jobviz-modal-soc-change", { detail: { socCode: null } }));
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("jobviz-modal-soc-change", handler);
      }
    };
  }, []);

  const activateJobAtIndex = React.useCallback(
    (index: number, direction: "next" | "prev") => {
      if (!jobItems.length) return;
      const normalized =
        ((index % jobItems.length) + jobItems.length) % jobItems.length;
      setSlideDir(direction);
      setActiveJobIdx(normalized);
      const job = jobItems[normalized];
      if (job) {
        handleJobClick(job.soc);
      }
    },
    [jobItems, handleJobClick]
  );

  const handlePrev = () => {
    activateJobAtIndex(activeJobIdx - 1, "prev");
  };

  const handleNext = () => {
    activateJobAtIndex(activeJobIdx + 1, "next");
  };

  React.useEffect(() => {
    if (!jobItems.length) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 250);
    return () => clearTimeout(t);
  }, [activeJobIdx, jobItems.length]);

  React.useEffect(() => {
    if (!jobs?.length) return;
    const timer = setTimeout(() => setShowRatingHint(false), 4000);
    return () => clearTimeout(timer);
  }, [jobs?.length, variant]);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (variant !== "desktop" || !showAssignmentPanel) {
      document.documentElement.style.setProperty("--jobviz-desktop-dock-width", "0px");
      return undefined;
    }
    const element = bannerRef.current;
    if (!element) {
      document.documentElement.style.setProperty("--jobviz-desktop-dock-width", "0px");
      return undefined;
    }
    const updateWidth = () => {
      const width = element.getBoundingClientRect().width;
      document.documentElement.style.setProperty(
        "--jobviz-desktop-dock-width",
        `${width}px`
      );
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty("--jobviz-desktop-dock-width", "0px");
    };
  }, [variant, showAssignmentPanel, isDockCollapsed]);
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
  const isActiveJobUnrated = Boolean(
    activeJob && !normalizedRatings[activeJob.soc]
  );
  const isActiveJobSuppressed = Boolean(
    activeJob && suppressedSocCodes.has(activeJob.soc)
  );
  const isActiveJobNextToRate = Boolean(
    isMobile && activeJob && activeJob.soc === nextUnratedSoc
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
      isMobile &&
      activeJob &&
      !!normalizedRatings[activeJob.soc] &&
      isEnticementReady
  );

  React.useEffect(() => {
    if (!shouldRenderBanner || variant !== "mobile") return undefined;
    if (typeof window === "undefined") return undefined;

    const readNavOffset = () => {
      const nav =
        document.querySelector("nav.fixed-top") ||
        document.querySelector("nav.navbar") ||
        document.querySelector("nav");
      if (!nav) {
        return 0;
      }
      if (nav instanceof HTMLElement && nav.dataset.navHidden === "true") {
        return 0;
      }
      const rect = nav.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.max(
        Math.min(rect.bottom, window.innerHeight),
        0
      );
      return Math.max(0, visibleBottom - visibleTop);
    };

    const emitNavOffsetChange = (value: number) => {
      window.dispatchEvent(
        new CustomEvent("jobviz-nav-offset-change", {
          detail: { value },
        })
      );
    };

    const updateNavOffset = () => {
      const value = readNavOffset();
      document.documentElement.style.setProperty(
        "--jobviz-nav-offset",
        `${value}px`
      );
      emitNavOffsetChange(value);
    };

    updateNavOffset();

    const navTarget =
      document.querySelector("nav.fixed-top") ||
      document.querySelector("nav.navbar");
    let navMutation: MutationObserver | null = null;
    let navResizeObserver: ResizeObserver | null = null;
    const handleNavTransition = () => {
      updateNavOffset();
    };

    if (navTarget) {
      navTarget.addEventListener("transitionend", handleNavTransition);
      if (typeof MutationObserver !== "undefined") {
        navMutation = new MutationObserver(handleNavTransition);
        navMutation.observe(navTarget, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
      }
      if (typeof ResizeObserver !== "undefined") {
        navResizeObserver = new ResizeObserver(() => {
          updateNavOffset();
        });
        navResizeObserver.observe(navTarget);
      }
    }

    return () => {
      if (navTarget) {
        navTarget.removeEventListener("transitionend", handleNavTransition);
      }
      if (navMutation) {
        navMutation.disconnect();
      }
      if (navResizeObserver) {
        navResizeObserver.disconnect();
      }
      document.documentElement.style.setProperty("--jobviz-nav-offset", "0px");
      emitNavOffsetChange(0);
    };
  }, [shouldRenderBanner, variant]);

  React.useEffect(() => {
    if (variant !== "mobile" || !shouldRenderBanner) return undefined;
    if (typeof window === "undefined") return undefined;

    const emitAssignmentOffsetChange = (value: number) => {
      window.dispatchEvent(
        new CustomEvent("jobviz-assignment-offset-change", {
          detail: { value },
        })
      );
    };

    const updateAssignmentOffset = () => {
      const target = bannerRef.current;
      if (!target) return;
      const height = target.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--jobviz-assignment-offset",
        `${height}px`
      );
      emitAssignmentOffsetChange(height);
    };

    document.body.dataset.jobvizAssignment = "true";
    updateAssignmentOffset();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && bannerRef.current) {
      observer = new ResizeObserver(() => {
        updateAssignmentOffset();
      });
      observer.observe(bannerRef.current);
    }

    window.addEventListener("resize", updateAssignmentOffset);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateAssignmentOffset);
      document.documentElement.style.setProperty(
        "--jobviz-assignment-offset",
        "0px"
      );
      emitAssignmentOffsetChange(0);
      delete document.body.dataset.jobvizAssignment;
    };
  }, [variant, shouldRenderBanner, mobileCollapsed, showAssignmentPanel]);

  React.useEffect(() => {
    if (!isMobile || !shouldRenderBanner) return undefined;
    if (typeof window === "undefined") return undefined;
    const element = bannerRef.current;
    if (!element) return undefined;

    let releaseTimeout: ReturnType<typeof setTimeout> | null = null;
    const activateIntent = () => {
      document.body.dataset.jobvizAssignmentScrollIntent = "true";
      if (releaseTimeout) {
        clearTimeout(releaseTimeout);
        releaseTimeout = null;
      }
    };
    const scheduleRelease = (delay = 450) => {
      if (releaseTimeout) {
        clearTimeout(releaseTimeout);
      }
      releaseTimeout = setTimeout(() => {
        delete document.body.dataset.jobvizAssignmentScrollIntent;
        releaseTimeout = null;
      }, delay);
    };

    const containsTarget = (target: EventTarget | null) =>
      target instanceof Node && element.contains(target);
    const options: AddEventListenerOptions = { passive: true };

    const handlePointerDown = (event: PointerEvent) => {
      if (containsTarget(event.target)) {
        activateIntent();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (containsTarget(event.target)) {
        activateIntent();
      }
    };

    const handlePointerUp = () => {
      scheduleRelease();
    };

    const handleWheel = (event: WheelEvent) => {
      if (containsTarget(event.target)) {
        activateIntent();
        scheduleRelease();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, options);
    document.addEventListener("pointermove", handlePointerMove, options);
    document.addEventListener("pointerup", handlePointerUp, options);
    document.addEventListener("pointercancel", handlePointerUp, options);
    document.addEventListener("wheel", handleWheel, options);

    let touchCleanup: (() => void) | null = null;
    if (!("PointerEvent" in window)) {
      const handleTouchStart = (event: TouchEvent) => {
        if (containsTarget(event.target)) {
          activateIntent();
        }
      };
      const handleTouchMove = (event: TouchEvent) => {
        if (containsTarget(event.target)) {
          activateIntent();
        }
      };
      const handleTouchEnd = () => {
        scheduleRelease();
      };

      document.addEventListener("touchstart", handleTouchStart, options);
      document.addEventListener("touchmove", handleTouchMove, options);
      document.addEventListener("touchend", handleTouchEnd, options);
      document.addEventListener("touchcancel", handleTouchEnd, options);
      touchCleanup = () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("touchcancel", handleTouchEnd);
      };
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      document.removeEventListener("wheel", handleWheel);
      touchCleanup?.();
      if (releaseTimeout) {
        window.clearTimeout(releaseTimeout);
      }
      delete document.body.dataset.jobvizAssignmentScrollIntent;
    };
  }, [isMobile, shouldRenderBanner]);

  if (!shouldRenderBanner) {
    return null;
  }

  return (
    <>
      <div
      className={`${styles.assignmentBannerShell} ${wrapperClass}`}
      data-mode={variant === "desktop" ? "docked" : "default"}
      data-collapsed={isMobile && mobileCollapsed ? "true" : "false"}
      data-dock-collapsed={isDockCollapsed ? "true" : "false"}
      ref={bannerRef}
    >
      {isDesktopVariant && (
        <button
          type="button"
          className={styles.assignmentDockToggle}
          onClick={() => setDockCollapsed((prev) => !prev)}
          aria-pressed={isDockCollapsed}
          aria-label={isDockCollapsed ? "Show assignment" : "Hide assignment"}
        >
          <LucideIcon
            name={isDockCollapsed ? "ChevronsLeft" : "ChevronsRight"}
          />
        </button>
      )}
      {isDesktopVariant && isDockCollapsed && (
        <div
          className={styles.assignmentDockCollapsedLabel}
          aria-hidden="true"
        >
          <span>{mode === "tour-editor" ? "Tour Builder" : "Assignment"}</span>
        </div>
      )}
      {showAssignmentPanel && (
        <div
          className={`${styles.assignmentBanner} ${styles.assignmentBannerSticky} ${
            variant === "desktop"
              ? styles.assignmentBannerDock
              : styles.assignmentBannerDefault
          }`}
          role="status"
          aria-live="polite"
        >
          <div
            className={`${styles.assignmentInner} ${
              flash ? styles.assignmentInnerFlash : ""
            }`}
            data-mobile-collapsed={isMobile && mobileCollapsed ? "true" : "false"}
          >
            {isMobile && (
              <div className={styles.assignmentMobileControls}>
                <button
                  type="button"
                  className={styles.assignmentCollapseToggle}
                  aria-expanded={!hideInfoSection}
                  aria-controls={infoSectionId}
                  onClick={() => setMobileCollapsed((prev) => !prev)}
                >
                  {mobileCollapsed ? "Show assignment" : "Hide assignment"}
                  <span
                    className={styles.assignmentCollapseToggleIcon}
                    aria-hidden="true"
                  >
                    <LucideIcon
                      name={mobileCollapsed ? "ChevronDown" : "ChevronUp"}
                    />
                  </span>
                </button>
                {!mobileCollapsed && shouldShowRatings && (
                  <button
                    type="button"
                    className={`${styles.assignmentClearButton} ${styles.assignmentClearButtonInline}`}
                    onClick={clearRatings}
                  >
                    Clear ratings
                  </button>
                )}
              </div>
            )}
            {shouldShowAssignmentBody && (
              <div
                id={infoSectionId}
                className={styles.assignmentInfoBlock}
                aria-hidden={hideInfoSection}
                data-hidden={hideInfoSection ? "true" : "false"}
                ref={infoBlockRef}
              >
                {(resolvedUnitLabel || headerActions) && (
                  <div className={styles.assignmentHeaderRow}>
                    {resolvedUnitLabel && (
                      <span className={styles.assignmentUnitLabelInline}>
                        <span>{resolvedUnitLabel}</span>
                      </span>
                    )}
                    {headerActions && (
                      <div className={styles.assignmentHeaderActions}>
                        {headerActions}
                      </div>
                    )}
                  </div>
                )}
                <div className={styles.assignmentMarker}>
                <span className={styles.assignmentMarkerLabel}>
                  <img
                    src={ASSIGNMENT_LOGO}
                    alt="GP+"
                    className={styles.assignmentMarkerLogo}
                    width={26}
                    height={26}
                  />
                  {markerLabel}
                </span>
                  <p className={styles.assignmentCopy}>{resolvedAssignmentCopy}</p>
                  {resolvedTeacherCtaCopy && (
                    <p className={styles.assignmentCopy}>{resolvedTeacherCtaCopy}</p>
                  )}
                </div>
              </div>
            )}
            {shouldShowRatings &&
              assignmentSocCodes.length > 0 &&
              (shouldShowAssignmentBody || isMobile) &&
              (isAssignmentComplete && allowShare ? (
                variant === "mobile" ? (
                  <button
                    type="button"
                    className={`${styles.assignmentSummaryLink} ${styles.assignmentSummaryLinkMobile}`}
                    onClick={handleOpenSummaryModal}
                    disabled={!jobItems.length}
                  >
                    Finalize &amp; Share
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.assignmentSummaryButton}
                    onClick={handleOpenSummaryModal}
                    disabled={!jobItems.length}
                  >
                    <span>Finalize &amp; Share</span>
                    <LucideIcon name="Sparkles" />
                  </button>
                )
              ) : (
                <div className={styles.assignmentProgressRow}>
                  <div className={styles.assignmentProgressLabel}>
                    {isAssignmentComplete && !allowShare
                      ? "Preview complete. Unlock GP+ to assign and share full tours."
                      : `Rated ${safeDisplayedProgressRated}/${progress.total} jobs`}
                  </div>
                <div
                  className={`${styles.assignmentProgressTrack} ${
                    shouldAnimateProgress ? styles.assignmentProgressTrackPulse : ""
                  }`}
                >
                  <div
                    className={`${styles.assignmentProgressFill} ${
                      shouldAnimateProgress ? styles.assignmentProgressFillPulse : ""
                    }`}
                    style={{
                      width: `${
                        progress.total
                          ? (safeDisplayedProgressRated / progress.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                </div>
              ))}
            {(shouldShowAssignmentBody || shouldShowCollapsedMobileContent) && (
              <div
                className={`${styles.assignmentContent} ${
                  variant === "mobile" ? styles.assignmentMobileContentSticky : ""
                }`}
                ref={
                  variant === "desktop"
                    ? handleAssignmentScrollRegister
                    : undefined
                }
              >
              {editorFields && (
                <div className={styles.assignmentEditorFields}>
                  {editorFields}
                </div>
              )}
              {variant === "desktop" && splitJobs.length > 0 && (
                <div className={styles.assignmentListWrap}>
                  {splitJobs.map((jobGroup, idx) => (
                    <ul key={idx} className={styles.assignmentList}>
                      {jobGroup.map(({ title, soc, iconName, jobIconName }, jobIdx) => {
                        const ratingValue = normalizedRatings[soc];
                        const isHighlighted = highlightedSoc === soc;
                        const isSuppressed = suppressedSocCodes.has(soc);
                        const shouldPulseDesktopJob =
                          isDesktopVariant &&
                          !shouldDelayAnimations &&
                          !ratingValue &&
                          nextUnratedSoc === soc &&
                          isEnticementReady;
                        const shouldGlowQuestion =
                          !ratingValue && !isSuppressed;
                        const displayEmoji = ratingValue
                          ? ratingEmoji(ratingValue)
                          : "?";
                        return (
                          <li key={soc} className={styles.assignmentListItem}>
                            {showRatingHint && idx === 0 && jobIdx === 0 && (
                              <div className={styles.assignmentHintArrow}>
                                <span>Click to explore and rate</span>
                              </div>
                            )}
                            <button
                              type="button"
                              className={`${styles.assignmentLink} ${
                                clickedSocCodes.has(soc)
                                  ? styles.assignmentLinkClicked
                                  : ""
                              } ${
                                activeSocCode === soc ? styles.assignmentLinkActive : ""
                              } ${
                                shouldPulseDesktopJob ? styles.assignmentLinkEntice : ""
                              }`}
                              onClick={() => handleJobClick(soc)}
                              data-assignment-soc={soc}
                              ref={
                                isDesktopVariant ? registerJobButtonRef(soc) : undefined
                              }
                            >
                              <span className={styles.assignmentListIconWrap}>
                                <LucideIcon
                                  name={iconName}
                                  className={styles.assignmentListIcon}
                                />
                                {jobIconName && (
                                  <span className={styles.assignmentListNestedIcon}>
                                    <LucideIcon name={jobIconName} />
                                  </span>
                                )}
                              </span>
                              {hasHydratedRatings ? (
                                <span
                                  className={`${styles.assignmentListRating} ${
                                    shouldGlowQuestion
                                      ? styles.assignmentListRatingGradient
                                      : ""
                                  } ${
                                    shouldPulseDesktopJob
                                      ? styles.assignmentListRatingHalo
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`${styles.assignmentListRatingInner} ${
                                      shouldPulseDesktopJob
                                        ? styles.assignmentListRatingNudge
                                        : ""
                                    } ${
                                      isSuppressed
                                        ? styles.assignmentListRatingInnerHidden
                                        : ""
                                    } ${
                                      isHighlighted
                                        ? styles.assignmentListRatingPulse
                                        : ""
                                    }`}
                                  >
                                    {isSuppressed ? "\u00A0" : displayEmoji}
                                  </span>
                                </span>
                              ) : null}
                              {title}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ))}
                </div>
              )}
              {variant === "mobile" && jobItems.length > 0 && (
                <div
                  className={styles.assignmentCarousel}
                  aria-label="Assignment jobs carousel"
                >
                  <div
                    className={`${styles.assignmentCarouselSlide} ${
                      slideDir === "next"
                        ? styles.assignmentCarouselItemNext
                        : slideDir === "prev"
                          ? styles.assignmentCarouselItemPrev
                          : ""
                    }`}
                    key={activeJob ? activeJob.soc : "assignment-carousel"}
                  >
                    {showRatingHint &&
                      variant === "mobile" &&
                      activeJobIdx === 0 && (
                        <div
                          className={`${styles.assignmentHintArrow} ${styles.assignmentHintArrowFloating}`}
                        >
                          <span>Click to explore and rate</span>
                        </div>
                      )}
                    <button
                      type="button"
                      className={styles.assignmentCarouselArrow}
                      onClick={handlePrev}
                      aria-label="Previous job"
                    >
                      <LucideIcon
                        name="ChevronLeft"
                        className={styles.assignmentCarouselArrowIcon}
                      />
                    </button>
                    <button
                      type="button"
                      className={`${styles.assignmentCarouselLink} ${
                        activeJob && clickedSocCodes.has(activeJob.soc)
                          ? styles.assignmentLinkClicked
                          : ""
                      } ${
                        activeJob && activeSocCode === activeJob.soc
                          ? styles.assignmentLinkActive
                          : ""
                      }`}
                      onClick={() => activeJob && handleJobClick(activeJob.soc)}
                      data-assignment-soc={activeJob?.soc ?? undefined}
                    >
                      <div className={styles.assignmentCarouselRow}>
                        <span
                          className={`${styles.assignmentListRating} ${
                            shouldGlowActiveJob
                              ? styles.assignmentListRatingGradient
                              : ""
                          }`}
                        >
                          <span
                            className={`${styles.assignmentListRatingInner} ${
                              isActiveJobNextToRate && isActiveJobUnrated
                                ? styles.assignmentListRatingNudge
                                : ""
                            } ${
                              isActiveJobSuppressed
                                ? styles.assignmentListRatingInnerHidden
                                : ""
                            } ${
                              activeJob && highlightedSoc === activeJob.soc
                                ? styles.assignmentListRatingPulse
                                : ""
                            }`}
                          >
                            {activeJob && suppressedSocCodes.has(activeJob.soc)
                              ? "\u00A0"
                              : hasHydratedRatings
                                ? ratingEmoji(
                                    activeJob
                                      ? normalizedRatings[activeJob.soc]
                                      : undefined
                                  )
                                : "?"}
                          </span>
                        </span>
                        <span className={styles.assignmentListIconWrap}>
                          <LucideIcon
                            name={activeJob?.iconName ?? "CircleDot"}
                            className={styles.assignmentListIcon}
                          />
                          {activeJob?.jobIconName && (
                            <span className={styles.assignmentListNestedIcon}>
                              <LucideIcon
                                name={activeJob.jobIconName!}
                              />
                            </span>
                          )}
                        </span>
                        <span className={styles.assignmentCarouselText}>
                          <span className={styles.assignmentCarouselTitle}>
                            {activeJob ? formatAssignmentTitle(activeJob.title) : ""}
                          </span>
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`${styles.assignmentCarouselArrow} ${
                        shouldPulseNextArrow ? styles.assignmentCarouselArrowHighlight : ""
                      }`}
                      onClick={handleNext}
                      aria-label="Next job"
                    >
                      <LucideIcon
                        name="ChevronRight"
                        className={`${styles.assignmentCarouselArrowIcon} ${
                          shouldPulseNextArrow ? styles.assignmentCarouselArrowNudge : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      )}
      {variant === "desktop" && !isDockCollapsed && (
        <div
          className={styles.assignmentClearFooter}
          ref={registerAssignmentFooterNode}
        >
          <button type="button" onClick={clearRatings}>
            Clear ratings
          </button>
        </div>
      )}
      {isDesktopVariant && isDockCollapsed && (
        <div className={styles.assignmentDockCollapsedNotice}>
          <LucideIcon name="ClipboardList" aria-hidden="true" />
          <span>Show more</span>
        </div>
      )}
    </div>
    {shouldShowScrollTip &&
      scrollTipStyle && (
        <div
          className={`${styles.assignmentScrollTip} ${styles.assignmentScrollTipOverlay}`}
          role="status"
          style={{
            left: `${scrollTipStyle.left}px`,
            width: `${scrollTipStyle.width}px`,
            bottom: `${scrollTipStyle.bottom}px`,
          }}
        >
          <LucideIcon name="ArrowDown" aria-hidden="true" />
          <span>Scroll to the next job...</span>
        </div>
      )}
    </>
  );
};
