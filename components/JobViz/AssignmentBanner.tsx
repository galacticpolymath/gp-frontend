/* eslint-disable @next/next/no-img-element */
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
} from "./jobRatingsStore";
import { useModalContext } from "../../providers/ModalProvider";

interface AssignmentBannerProps {
  unitName?: string | null;
  jobs?: [string, string][] | null;
  assignmentParams?: AssignmentParams;
  onJobClick?: (socCode: string) => void;
  variant?: "mobile" | "desktop";
}

const ASSIGNMENT_LOGO = "/plus/GP+ Submark.png";
const COMPLETION_MODAL_DELAY_MS = 900;
const formatAssignmentTitle = (value: string) =>
  value.replace(/\sand\s/gi, " & ");

export const AssignmentBanner: React.FC<AssignmentBannerProps> = ({
  unitName,
  jobs,
  assignmentParams,
  onJobClick,
  variant = "mobile",
}) => {
  const router = useRouter();
  const modalContext = useModalContext();
  const [, setJobvizSummaryModal] = modalContext._jobvizSummaryModal;
  const [, setJobvizCompletionModal] = modalContext._jobvizCompletionModal;
  const [, setIsJobModalOn] = modalContext._isJobModalOn;
  const [, setSelectedJob] = modalContext._selectedJob;
  const [clickedSocCodes, setClickedSocCodes] = React.useState<Set<string>>(
    new Set()
  );
  const bannerRef = React.useRef<HTMLDivElement | null>(null);
  const infoBlockRef = React.useRef<HTMLDivElement | null>(null);
  const [activeJobIdx, setActiveJobIdx] = React.useState(0);
  const [slideDir, setSlideDir] = React.useState<"next" | "prev" | null>(null);
  const [flash, setFlash] = React.useState(false);
  const highlightTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const completionModalTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [highlightedSoc, setHighlightedSoc] = React.useState<string | null>(null);
  const [suppressedSocCodes, setSuppressedSocCodes] = React.useState<Set<string>>(new Set());
  const [mobileCollapsed, setMobileCollapsed] = React.useState(false);
  const [hasCelebratedCompletion, setHasCelebratedCompletion] = React.useState(false);
  const shouldRenderBanner =
    Boolean(unitName) || Boolean(jobs?.length);
  const isMobile = variant === "mobile";
  const infoSectionId = isMobile ? "assignmentInfoBlock" : undefined;
  const hideInfoSection = isMobile && mobileCollapsed;
  const shouldShowAssignmentBody = !isMobile || !mobileCollapsed;
  const shouldShowCollapsedMobileContent = isMobile;
  const { ratings, clearRatings } = useJobRatings();
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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
    if (typeof window === "undefined") return undefined;
    const handleHighlight = (event: Event) => {
      const detail = (event as CustomEvent<{ socCode?: string; phase?: "start" | "finish" }>).detail;
      const socCode = detail?.socCode;
      const phase = detail?.phase ?? "finish";
      if (!socCode) return;
      if (phase === "start") {
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

  React.useEffect(() => {
    return () => {
      if (completionModalTimeoutRef.current) {
        clearTimeout(completionModalTimeoutRef.current);
        completionModalTimeoutRef.current = null;
      }
    };
  }, []);

  const assignmentSocCodes = React.useMemo(
    () => (jobs?.map(([, soc]) => soc) ?? []).filter(Boolean),
    [jobs]
  );
  const clientProgress = React.useMemo(() => {
    return countRatings(assignmentSocCodes, ratings);
  }, [assignmentSocCodes, ratings]);
  const progress = isMounted
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
      const node = getNodeBySocCode(soc);
      const iconName = node ? getIconNameForNode(node) : "CircleDot";
      const jobIconName = node ? getJobSpecificIconName(node) : undefined;
      return { title, soc, iconName, jobIconName };
    });
  }, [jobs]);

  const handleOpenSummaryModal = React.useCallback(() => {
    if (!jobItems.length) return;
    setJobvizSummaryModal({
      isDisplayed: true,
      unitName,
      jobs: jobItems.map(({ title, soc }) => ({ title, soc })),
      payload: null,
      allowEditing: true,
    });
  }, [jobItems, setJobvizSummaryModal, unitName]);

  const closeJobModal = React.useCallback(() => {
    setSelectedJob(null);
    setIsJobModalOn(false);
  }, [setIsJobModalOn, setSelectedJob]);

  const triggerAssignmentConfetti = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const duration = 1000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 4,
        startVelocity: 35,
        spread: 90,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() * 0.5 + 0.2 },
      });
      if (Date.now() < end) {
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

    if (!isAssignmentComplete || hasCelebratedCompletion) {
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
    const nextJob = jobItems.find(({ soc }) => !ratings[soc]);
    return nextJob?.soc ?? null;
  }, [jobItems, ratings]);

  const splitJobs = React.useMemo(() => {
    if (!jobItems.length) return [];
    const midpoint = Math.ceil(jobItems.length / 2);
    return [jobItems.slice(0, midpoint), jobItems.slice(midpoint)];
  }, [jobItems]);

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

  const wrapperClass =
    variant === "desktop"
      ? styles.assignmentDesktopDock
      : styles.assignmentMobileWrapper;
  const [showRatingHint, setShowRatingHint] = React.useState(true);
  const [dockCollapsed, setDockCollapsed] = React.useState(false);
  const isDesktopVariant = variant === "desktop";
  const isDockCollapsed = isDesktopVariant && dockCollapsed;
  React.useEffect(() => {
    if (!jobs?.length) return;
    const timer = setTimeout(() => setShowRatingHint(false), 4000);
    return () => clearTimeout(timer);
  }, [jobs?.length, variant]);

  const showAssignmentPanel = !isDesktopVariant || !isDockCollapsed;
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
  const activeJob = jobItems[activeJobIdx] ?? null;
  const isActiveJobUnrated =
    Boolean(isMobile && activeJob && !ratings[activeJob.soc]);
  const isActiveJobSuppressed = Boolean(
    activeJob && suppressedSocCodes.has(activeJob.soc)
  );
  const shouldGlowActiveJob = Boolean(
    isActiveJobUnrated && !isActiveJobSuppressed
  );
  const shouldPulseNextArrow = Boolean(
    isMobile && activeJob && !!ratings[activeJob.soc]
  );

  React.useEffect(() => {
    if (variant !== "mobile" || !shouldRenderBanner) return undefined;
    if (typeof window === "undefined") return undefined;
    const element = bannerRef.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;

    let rafId: number | null = null;
    const readNavOffset = () => {
      const nav =
        document.querySelector("nav.fixed-top") ||
        document.querySelector("nav.navbar") ||
        document.querySelector("nav");
      if (!nav) {
        const header = document.querySelector("header");
        return header ? header.getBoundingClientRect().height : 64;
      }
      if (
        nav instanceof HTMLElement &&
        nav.dataset.navHidden === "true"
      ) {
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

    const updateOffsets = () => {
      const height = element.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--jobviz-assignment-offset",
        `${height}px`
      );
      document.documentElement.style.setProperty(
        "--jobviz-nav-offset",
        `${readNavOffset()}px`
      );
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        document.documentElement.style.setProperty(
          "--jobviz-nav-offset",
          `${readNavOffset()}px`
        );
      });
    };

    const handleResize = () => {
      updateOffsets();
    };

    document.body.dataset.jobvizAssignment = "true";
    updateOffsets();

    const observer = new ResizeObserver(updateOffsets);
    observer.observe(element);

    let navMutation: MutationObserver | null = null;
    const navTarget =
      document.querySelector("nav.fixed-top") ||
      document.querySelector("nav.navbar");
    const handleNavTransition = () => {
      document.documentElement.style.setProperty(
        "--jobviz-nav-offset",
        `${readNavOffset()}px`
      );
    };

    if (navTarget) {
      navTarget.addEventListener("transitionend", handleNavTransition);
      if (typeof MutationObserver !== "undefined") {
        navMutation = new MutationObserver(handleNavTransition);
        navMutation.observe(navTarget, { attributes: true, attributeFilter: ["style", "class"] });
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (navTarget) {
        navTarget.removeEventListener("transitionend", handleNavTransition);
      }
      if (navMutation) {
        navMutation.disconnect();
      }
      document.documentElement.style.setProperty(
        "--jobviz-assignment-offset",
        "0px"
      );
      document.documentElement.style.setProperty("--jobviz-nav-offset", "0px");
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
          <span>Assignment</span>
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
                {!mobileCollapsed && (
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
                {unitName && (
                  <span className={styles.assignmentUnitLabelInline}>
                    <span>
                      {" "}
                      Jobs related to the{" "}
                      <span className={styles.assignmentUnitName}>{unitName}</span>{" "}
                      unit
                    </span>
                  </span>
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
                  JobViz+ | ASSIGNMENT
                </span>
                  <p className={styles.assignmentCopy}>
                    Explore and rate each of these jobs. Be prepared to explain your
                    ratings <em>with data</em>.
                  </p>
                </div>
              </div>
            )}
            {assignmentSocCodes.length > 0 &&
              (shouldShowAssignmentBody || isMobile) &&
              (isAssignmentComplete ? (
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
                    Rated {progress.rated}/{progress.total} jobs
                  </div>
                  <div className={styles.assignmentProgressTrack}>
                    <div
                      className={styles.assignmentProgressFill}
                      style={{
                        width: `${progress.total ? (progress.rated / progress.total) * 100 : 0}%`,
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
              >
              {variant === "desktop" && splitJobs.length > 0 && (
                <div className={styles.assignmentListWrap}>
                  {splitJobs.map((jobGroup, idx) => (
                    <ul key={idx} className={styles.assignmentList}>
                      {jobGroup.map(({ title, soc, iconName, jobIconName }, jobIdx) => {
                        const ratingValue = ratings[soc];
                        const isHighlighted = highlightedSoc === soc;
                        const isSuppressed = suppressedSocCodes.has(soc);
                        const shouldPulseDesktopJob =
                          isDesktopVariant && !ratingValue && nextUnratedSoc === soc;
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
                              }`}
                              onClick={() => handleJobClick(soc)}
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
                              {isMounted ? (
                                <span
                                  className={`${styles.assignmentListRating} ${
                                    shouldGlowQuestion
                                      ? styles.assignmentListRatingGradient
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
                              isActiveJobUnrated ? styles.assignmentListRatingNudge : ""
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
                              : isMounted
                                ? ratingEmoji(activeJob ? ratings[activeJob.soc] : undefined)
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
        <div className={styles.assignmentClearFooter}>
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
  );
};
