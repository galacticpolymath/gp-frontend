import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Modal from "react-bootstrap/Modal";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { LucideIcon } from "../JobViz/LucideIcon";
import { useModalContext } from "../../providers/ModalProvider";
import jobVizDataObj from "../../data/Jobviz/jobVizDataObj.json";
import { createSelectedJobVizJobLink } from "../JobViz/JobTours/JobToursCard";
import { JOBVIZ_BRACKET_SEARCH_ID } from "../JobViz/jobvizConstants";
import {
  buildJobvizUrl,
  getIconNameForNode,
  getJobSpecificIconName,
} from "../JobViz/jobvizUtils";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../LessonSection/JobVizConnections";
import styles from "../../styles/jobvizBurst.module.scss";
import jobvizLogo from "../../assets/img/GP+JobViz_Horiz_white_400px.png";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  infoModalContent,
  InfoModalType,
  resolveTierLabel,
} from "../JobViz/infoModalContent";
import type { JobRatingValue } from "../JobViz/jobRatingsStore";
import { ratingOptions, useJobRatings } from "../JobViz/jobRatingsStore";

const { Body } = Modal;
const DATA_END_YR = jobVizDataObj.data_end_yr?.[0] ?? 2034;

const describe = (value?: string | null) =>
  value && value.trim().length && value.toLowerCase() !== "data unavailable"
    ? value
    : "Data unavailable";

const ratingDescriptions: Record<JobRatingValue, string> = {
  love: "Dream job alert! You’d be excited to study or try this path.",
  like: "Interesting option—you might enjoy learning more about it.",
  dislike: "Not your vibe right now, and that’s okay.",
};

const SelectedJob: React.FC = () => {
  const {
    _selectedJob,
    _isJobModalOn,
    _jobToursModalCssProps,
    _jobvizReturnPath,
  } =
    useModalContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedJob, setSelectedJob] = _selectedJob;
  const [, setIsJobModal] = _isJobModalOn;
  const [, setJobToursModalCssProps] = _jobToursModalCssProps;
  const [jobvizReturnPath, setJobvizReturnPath] = _jobvizReturnPath;
  const [jobLink, setJobLink] = useState("");
  const [infoModal, setInfoModal] = useState<InfoModalType | null>(null);
  const [modalHistory, setModalHistory] = useState<InfoModalType | null>(null);
  const [isInfoClosing, setIsInfoClosing] = useState(false);
  const closeModalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyToastId = useRef<string | number | null>(null);
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [didCopyLink, setDidCopyLink] = useState(false);
  const [shouldGlowRatingLabel, setShouldGlowRatingLabel] = useState(false);
  const [showMobileCue, setShowMobileCue] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const { ratings, setRating } = useJobRatings();
  const [ratingBurst, setRatingBurst] = useState<JobRatingValue | null>(null);
  const [showRatingInfo, setShowRatingInfo] = useState(false);
  const [isFocusAssignmentView, setIsFocusAssignmentView] = useState(false);
  const CARD_TRANSITION_MS = 420;
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileCueDelayRef = useRef<number | null>(null);
  const [visibleJob, setVisibleJob] = useState(selectedJob);
  const [cardPhase, setCardPhase] = useState<"enter" | "exit">(
    selectedJob ? "enter" : "exit"
  );
  const assignmentQueryParam = router.query?.[SOC_CODES_PARAM_NAME];

  const assignmentSocCodes = useMemo(() => {
    const value = Array.isArray(assignmentQueryParam)
      ? assignmentQueryParam.join(",")
      : assignmentQueryParam;
    if (!value) return null;
    return new Set(value.split(",").filter(Boolean));
  }, [assignmentQueryParam]);
  const hasAssignmentParams = Boolean(assignmentSocCodes?.size);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobileViewport(event.matches);
    };
    handleChange(mq);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }
    mq.addListener(handleChange);
    return () => mq.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const readFlag = () =>
      typeof document !== "undefined" &&
      document.body?.dataset?.jobvizFocus === "true";
    setIsFocusAssignmentView(readFlag());
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ value?: boolean }>;
      setIsFocusAssignmentView(Boolean(customEvent.detail?.value));
    };
    window.addEventListener("jobviz-focus-toggle", handleToggle);
    return () => {
      window.removeEventListener("jobviz-focus-toggle", handleToggle);
    };
  }, []);

  useEffect(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    if (selectedJob && !visibleJob) {
      setVisibleJob(selectedJob);
      requestAnimationFrame(() => setCardPhase("enter"));
      return;
    }

    if (!selectedJob && visibleJob) {
      setCardPhase("exit");
      transitionTimeoutRef.current = setTimeout(() => {
        setVisibleJob(null);
        window.dispatchEvent(
          new CustomEvent("jobviz-modal-soc-change", { detail: { socCode: null } })
        );
        transitionTimeoutRef.current = null;
      }, CARD_TRANSITION_MS);
      return;
    }

    if (
      selectedJob &&
      visibleJob &&
      selectedJob.soc_code !== visibleJob.soc_code
    ) {
      setCardPhase("exit");
      transitionTimeoutRef.current = setTimeout(() => {
        setVisibleJob(selectedJob);
        window.dispatchEvent(
          new CustomEvent("jobviz-modal-soc-change", {
            detail: { socCode: selectedJob.soc_code ?? null },
          })
        );
        transitionTimeoutRef.current = null;
        requestAnimationFrame(() => setCardPhase("enter"));
      }, CARD_TRANSITION_MS);
      return;
    }

    if (selectedJob && visibleJob) {
      requestAnimationFrame(() => setCardPhase("enter"));
      window.dispatchEvent(
        new CustomEvent("jobviz-modal-soc-change", {
          detail: { socCode: selectedJob.soc_code ?? null },
        })
      );
    }
  }, [selectedJob, visibleJob, CARD_TRANSITION_MS]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!visibleJob) return;
    const nextLink = createSelectedJobVizJobLink(visibleJob);
    if (nextLink) {
      setJobLink(nextLink);
    } else {
      console.error("selectedJob is falsy. Cannot create job link.");
    }
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTop = 0;
    }
    setShowRatingInfo(false);
  }, [visibleJob]);

  const activeInfoModal = modalHistory ? infoModalContent[modalHistory] : null;
  const shouldRenderInfoModal =
    (infoModal !== null || isInfoClosing) && !!activeInfoModal;
  const currentRating = visibleJob?.soc_code
    ? ratings[visibleJob.soc_code]
    : undefined;
  const isAssignmentJob =
    !!visibleJob?.soc_code &&
    Boolean(assignmentSocCodes?.has(visibleJob.soc_code));

  useEffect(() => {
    const shouldGlow = Boolean(isAssignmentJob && !currentRating);
    setShouldGlowRatingLabel(shouldGlow);
    if (mobileCueDelayRef.current) {
      clearTimeout(mobileCueDelayRef.current);
      mobileCueDelayRef.current = null;
    }
    if (!shouldGlow || !isMobileViewport) {
      setShowMobileCue(false);
      return;
    }
    mobileCueDelayRef.current = window.setTimeout(() => {
      setShowMobileCue(true);
      mobileCueDelayRef.current = null;
    }, 480);
    return () => {
      if (mobileCueDelayRef.current) {
        clearTimeout(mobileCueDelayRef.current);
        mobileCueDelayRef.current = null;
      }
    };
  }, [isAssignmentJob, currentRating, isMobileViewport]);

  useEffect(() => {
    if (!isMobileViewport) return;
    const scrollElement = modalScrollRef.current;
    if (!scrollElement) return;
    const handleScroll = () => {
      if (!showMobileCue) return;
      if (scrollElement.scrollTop > 48) {
        setShowMobileCue(false);
      }
    };
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileViewport, showMobileCue, visibleJob]);

  const dispatchRatingEvent = (socCode: string, phase: "start" | "finish") => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("jobviz-rating-highlight", { detail: { socCode, phase } })
    );
  };

  const handleRatingSelect = (value: JobRatingValue) => {
    if (!isAssignmentJob || !visibleJob?.soc_code) return;
    const socCode = visibleJob.soc_code;
    dispatchRatingEvent(socCode, "start");
    setRating(socCode, value);
    setRatingBurst(value);
    setShouldGlowRatingLabel(false);
    setShowMobileCue(false);
    setTimeout(() => {
      setRatingBurst(null);
      dispatchRatingEvent(socCode, "finish");
    }, 900);
  };

  const triggerHaptic = (duration = 14) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  };

  const openInfoModal = (type: InfoModalType) => {
    triggerHaptic();
    setModalHistory(type);
    setInfoModal(type);
    setIsInfoClosing(false);
  };

  const closeInfoModal = () => {
    triggerHaptic(6);
    setIsInfoClosing(true);
    setInfoModal(null);
    if (closeModalTimeoutRef.current) {
      clearTimeout(closeModalTimeoutRef.current);
    }
    closeModalTimeoutRef.current = setTimeout(() => {
      setIsInfoClosing(false);
      closeModalTimeoutRef.current = null;
    }, 280);
  };

  useEffect(() => {
    return () => {
      if (closeModalTimeoutRef.current) {
        clearTimeout(closeModalTimeoutRef.current);
      }
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsJobModal(true);
  }, [setIsJobModal]);

  const handleOnHide = () => {
    const paramsStr = searchParams.toString();
    if (jobvizReturnPath) {
      router.push(jobvizReturnPath, undefined, {
        scroll: false,
        shallow: true,
      });
      setJobvizReturnPath(null);
    } else {
      const segmentsSource = router.query?.["search-results"];
      const segments = Array.isArray(segmentsSource)
        ? [...segmentsSource]
        : typeof segmentsSource === "string"
          ? segmentsSource.split("/").filter(Boolean)
          : [];
      if (segments.length >= 2) {
        const lastSegment = segments[segments.length - 1];
        const shouldTrimLast =
          visibleJob?.id && String(visibleJob.id) === lastSegment;
        const normalizedSegments = shouldTrimLast
          ? segments.slice(0, -1)
          : segments;
        const basePath = `/${["jobviz", ...normalizedSegments].join("/")}`;
        const nextUrl = paramsStr.length ? `${basePath}?${paramsStr}` : basePath;
        router.push(nextUrl, undefined, {
          scroll: false,
          shallow: true,
        });
      }
    }

    setSelectedJob(null);
    setInfoModal(null);
    setModalHistory(null);
    setIsInfoClosing(false);
    if (closeModalTimeoutRef.current) {
      clearTimeout(closeModalTimeoutRef.current);
      closeModalTimeoutRef.current = null;
    }
    setJobToursModalCssProps({
      zIndex: 10000,
    });
  };

  const handleCopyLink = async () => {
    if (!jobLink) {
      console.error("Job link unavailable. Cannot copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(jobLink);
      if (copyToastId.current) {
        toast.dismiss(copyToastId.current);
      }
      copyToastId.current = toast.success("Link copied!");
      setDidCopyLink(true);
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
      copyResetTimeoutRef.current = setTimeout(() => {
        setDidCopyLink(false);
        copyResetTimeoutRef.current = null;
      }, 1400);
    } catch (error) {
      console.error("Failed to copy job link.", error);
    }
  };

  const handleExploreRelatedCareers = async () => {
    if (!visibleJob) return;

    const socCodesStr = searchParams.get(SOC_CODES_PARAM_NAME);
    const unitNameParam = searchParams.get(UNIT_NAME_PARAM_NAME);
    const url = buildJobvizUrl(
      {
        fromNode: visibleJob,
      },
      {
        socCodes: socCodesStr
          ? new Set(socCodesStr.split(",").filter(Boolean))
          : undefined,
        unitName: unitNameParam ?? undefined,
      }
    );

    const isSamePath = router.asPath === url;
    const scrollToJobs = () => {
      const target = document.getElementById(JOBVIZ_BRACKET_SEARCH_ID);
      if (target) {
        const rect = target.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset;
        window.scrollTo({
          top: absoluteTop - 48,
          behavior: "smooth",
        });
      }
    };

    try {
      if (!isSamePath) {
        await router.push(url, undefined, { scroll: false, shallow: true });
      }
    } catch (e) {
      console.error("Failed to navigate to related careers", e);
    } finally {
      setIsJobModal(false);
      setSelectedJob(null);
      requestAnimationFrame(scrollToJobs);
    }
  };

  const jobTitle =
    visibleJob?.soc_title ?? visibleJob?.title ?? "Job overview";
  const definition =
    visibleJob?.def &&
    visibleJob.def.toLowerCase() !==
      "no definition found for this summary category."
      ? visibleJob.def
      : null;
  const categoryIcon = visibleJob
    ? getIconNameForNode(visibleJob)
    : "Sparkles";
  const jobIcon = visibleJob ? getJobSpecificIconName(visibleJob) : undefined;

  const stats = visibleJob
    ? [
        {
          id: "median",
          label: "Median wage",
          value: formatCurrency(visibleJob.median_annual_wage),
          infoType: "wage" as InfoModalType,
          descriptor: null,
        },
        {
          id: "growth",
          label: "10-year change",
          value: formatPercent(visibleJob.employment_change_percent),
          infoType: "growth" as InfoModalType,
          descriptor: resolveTierLabel(
            "growth",
            visibleJob.employment_change_percent ?? null
          ),
        },
        {
          id: "jobs",
          label: `Jobs by ${DATA_END_YR}`,
          value: formatNumber(visibleJob.employment_end_yr),
          infoType: "jobs" as InfoModalType,
          descriptor: resolveTierLabel(
            "jobs",
            visibleJob.employment_end_yr ?? null
          ),
        },
      ]
    : [];
  const disableExploreRelated = isFocusAssignmentView;

  return (
    <>
      <Modal
        show={!!visibleJob}
        onHide={handleOnHide}
        contentClassName="selectedJobModal"
        dialogClassName={`dialogJobVizModal py-2 d-sm-flex justify-content-center align-items-center ${
          hasAssignmentParams ? "" : "dialogJobVizModalCentered"
        }`}
        backdropClassName="selectedJobBackdrop"
        fullscreen="md-down"
        style={{
          zIndex: 10000000,
        }}
      >
        <Body className="selectedJobBody" ref={modalScrollRef}>
          {visibleJob && (
            <article
              className={styles.modalCard}
              data-phase={cardPhase}
              data-jobviz-active-soc={visibleJob.soc_code}
            >
              <header className={styles.modalHeader}>
              <div className={styles.modalHeaderTop}>
                <p className={styles.modalEyebrow}>
                  Job detail <span className={styles.modalSocCodeInline}>(SOC {visibleJob.soc_code})</span>
                </p>
                <button
                  type="button"
                  className={styles.modalCloseButton}
                  onClick={handleOnHide}
                  aria-label="Close job details"
                >
                  <LucideIcon name="X" />
                </button>
              </div>
              <div className={styles.modalIdentityRow}>
                <div className={`${styles.iconBadge} ${styles.modalIcon}`}>
                  <LucideIcon name={categoryIcon} />
                  {jobIcon && (
                    <span className={styles.nestedIcon}>
                      <LucideIcon name={jobIcon} />
                    </span>
                  )}
                </div>
                <div className={styles.modalTitleGroup}>
                  <h3 className={styles.modalTitle}>{jobTitle}</h3>
                  {isAssignmentJob && (
                    <span
                      className={styles.assignmentBadgeDot}
                      title="Part of this assignment"
                      aria-label="Part of this assignment"
                    />
                  )}
                </div>
              </div>
              </header>
              <p className={styles.modalSummary}>
                {definition ?? "Definition unavailable from the BLS feed."}
              </p>
              {isAssignmentJob ? (
                <section className={styles.modalRatingBlock}>
                  <div className={styles.modalRatingHeader}>
                    <span
                      className={styles.modalRatingLabel}
                      data-glow={shouldGlowRatingLabel ? "true" : "false"}
                    >
                      Rate this job
                    </span>
                    <div className={styles.modalRatingHeaderActions}>
                      {currentRating && (
                        <span className={styles.modalRatingStatus}>
                          <LucideIcon name="Check" />
                          Rated
                        </span>
                      )}
                      <button
                        type="button"
                        className={styles.inlineInfoButton}
                        aria-pressed={showRatingInfo ? "true" : "false"}
                        aria-expanded={showRatingInfo ? "true" : "false"}
                        aria-label="How JobViz+ ratings work"
                        onClick={() => setShowRatingInfo((prev) => !prev)}
                      >
                        <LucideIcon name="Info" />
                      </button>
                    </div>
                  </div>
                  <div className={styles.modalRatingButtons}>
                    {ratingOptions.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={`${styles.modalRatingButton} ${
                          currentRating === option.value
                            ? styles.modalRatingButtonActive
                            : ""
                        }`}
                        onClick={() => handleRatingSelect(option.value)}
                        aria-pressed={currentRating === option.value}
                      >
                        {ratingBurst === option.value && (
                          <span
                            className={`${styles.modalRatingConfetti} ${styles[`modalRatingConfetti-${ratingBurst}`]}`}
                            aria-hidden="true"
                          >
                            {option.emoji}
                          </span>
                        )}
                        <span className={styles.modalRatingEmoji}>{option.emoji}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                  {showRatingInfo && (
                    <div className={styles.modalRatingInfo}>
                      <p>How to use these ratings:</p>
                      <ul className={styles.modalRatingInfoList}>
                        {ratingOptions.map((option) => (
                          <li key={`rating-info-${option.value}`}>
                            <span className={styles.modalRatingInfoEmoji}>
                              {option.emoji}
                            </span>
                            <span className={styles.modalRatingInfoText}>
                              {ratingDescriptions[option.value]}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ) : (
                <section className={`${styles.modalRatingBlock} ${styles.modalRatingBlockDisabled}`}>
                  <div className={styles.modalRatingHeader}>
                    <span className={styles.modalRatingLabel}>Rate this job</span>
                    <span className={styles.modalRatingStatus}>
                      Assignment only
                    </span>
                  </div>
                  <p className={styles.modalRatingNotice}>
                    Ratings unlock when this job is part of one of your assignments.
                  </p>
                </section>
              )}
              <dl className={styles.modalStats}>
                {stats.map((stat) => (
                  <div key={stat.id} className={styles.modalStat}>
                    <div className={styles.modalStatHeader}>
                      <dt>{stat.label}</dt>
                      <button
                        type="button"
                        className={styles.inlineInfoButton}
                        aria-haspopup="dialog"
                        aria-controls="jobviz-info-modal"
                        aria-label={`Open ${stat.label} explainer`}
                        onClick={() => openInfoModal(stat.infoType)}
                      >
                        <LucideIcon name="Info" />
                      </button>
                    </div>
                    <dd className={styles.modalStatValue}>
                      <span className={styles.modalStatNumber}>{stat.value}</span>
                      {stat.descriptor && (
                        <span className={styles.modalStatInfoTag}>
                          {stat.descriptor}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className={styles.modalList}>
                <li>
                  Typical education:{" "}
                  {describe(visibleJob.typical_education_needed_for_entry)}
                </li>
                <li>
                  Work experience:{" "}
                  {describe(visibleJob.work_experience_in_a_related_occupation)}
                </li>
                <li>
                  On-the-job training:{" "}
                  {describe(
                    visibleJob[
                      "typical_on-the-job_training_needed_to_attain_competency_in_the_occupation"
                    ]
                  )}
                </li>
              </ul>
              <footer className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={handleExploreRelatedCareers}
                  disabled={disableExploreRelated}
                >
                  <LucideIcon name="Route" />
                  Explore related careers
                </button>
                {visibleJob.BLS_link && (
                  <a
                    className={styles.ghostButton}
                    href={visibleJob.BLS_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LucideIcon name="ExternalLink" />
                    View BLS profile
                  </a>
                )}
                <button
                  type="button"
                  className={`${styles.primaryButton} ${
                    didCopyLink ? styles.copySuccess : ""
                  }`}
                  onClick={handleCopyLink}
                  aria-live="polite"
                >
                  <LucideIcon name={didCopyLink ? "Check" : "Link"} />
                  {didCopyLink ? "Copied!" : "Share job details"}
                </button>
              </footer>
              <div className={styles.modalBrand}>
                <Image
                  src={jobvizLogo}
                  alt="JobViz Burst logo"
                  width={240}
                  height={21}
                  priority
                  className={styles.modalLogo}
                />
              </div>
            </article>
          )}
          <div
            className={styles.modalMobileReminder}
            data-visible={showMobileCue ? "true" : "false"}
          >
            <span className={styles.modalMobileReminderText}>
              Consider description & stats, then rate this job
            </span>
            <span className={styles.modalMobileReminderArrow} aria-hidden="true">
              ↓
            </span>
          </div>
        </Body>
      </Modal>

      {shouldRenderInfoModal && activeInfoModal && (
        <div
          className={styles.infoModalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="jobviz-info-modal-title"
          id="jobviz-info-modal"
          data-state={isInfoClosing ? "closing" : "open"}
          onClick={closeInfoModal}
        >
          <div
            className={styles.infoModal}
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.infoModalHeader}>
              <div className={styles.infoModalTitle}>
                <span className={styles.infoModalIcon}>
                  <LucideIcon name="Info" />
                </span>
                <div>
                  <p className={styles.infoModalEyebrow}>
                    {activeInfoModal.eyebrow}
                  </p>
                  <h3
                    className={styles.infoModalHeading}
                    id="jobviz-info-modal-title"
                  >
                    {activeInfoModal.heading}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeInfoButton}
                aria-label="Close info explainer"
                onClick={closeInfoModal}
              >
                <LucideIcon name="X" />
              </button>
            </header>
            <div className={styles.infoModalBody}>
              {activeInfoModal.paragraphs.map((paragraph, idx) => (
                <p
                  key={`${activeInfoModal.heading}-${idx}`}
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
              <ul className={styles.tierList}>
                {activeInfoModal.tiers.map((tier) => (
                  <li key={tier.label} className={styles.tierItem}>
                    <div className={styles.tierListHeading}>
                      <span className={styles.tierLabel}>{tier.label}</span>
                      <span className={styles.tierRange}>
                        {activeInfoModal.rangeFormatter(tier)}
                      </span>
                    </div>
                    <p>{tier.descriptor}</p>
                  </li>
                ))}
              </ul>
              <p className={styles.tierFootnote}>
                {activeInfoModal.footnote}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectedJob;
