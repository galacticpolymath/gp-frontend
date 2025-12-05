import React, { useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { LucideIcon } from "../JobViz/LucideIcon";
import { useModalContext } from "../../providers/ModalProvider";
import jobVizDataObj from "../../data/Jobviz/jobVizDataObj.json";
import getNewPathsWhenModalCloses from "../../helperFns/getNewPathsWhenModalCloses";
import { createSelectedJobVizJobLink } from "../JobViz/JobTours/JobToursCard";
import { JOBVIZ_BRACKET_SEARCH_ID } from "../../pages/jobviz/index";
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
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  infoModalContent,
  InfoModalType,
} from "../JobViz/infoModalContent";

const { Body } = Modal;
const DATA_END_YR = jobVizDataObj.data_end_yr?.[0] ?? 2034;

const describe = (value?: string | null) =>
  value && value.trim().length && value.toLowerCase() !== "data unavailable"
    ? value
    : "Data unavailable";

const SelectedJob: React.FC = () => {
  const { _selectedJob, _isJobModalOn, _jobToursModalCssProps } =
    useModalContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedJob, setSelectedJob] = _selectedJob;
  const [, setIsJobModal] = _isJobModalOn;
  const [, setJobToursModalCssProps] = _jobToursModalCssProps;
  const [jobLink, setJobLink] = useState("");
  const [infoModal, setInfoModal] = useState<InfoModalType | null>(null);
  const [modalHistory, setModalHistory] = useState<InfoModalType | null>(null);
  const [isInfoClosing, setIsInfoClosing] = useState(false);
  const closeModalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyToastId = useRef<string | number | null>(null);

  const activeInfoModal = modalHistory ? infoModalContent[modalHistory] : null;
  const shouldRenderInfoModal =
    (infoModal !== null || isInfoClosing) && !!activeInfoModal;

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
    };
  }, []);

  useEffect(() => {
    setIsJobModal(true);
  }, [setIsJobModal]);

  const handleOnHide = () => {
    const searchResults = router.query["search-results"];

    if (router.asPath.includes("jobviz") && Array.isArray(searchResults)) {
      const newPaths = getNewPathsWhenModalCloses(searchResults);
      const paramsStr = searchParams.toString();
      const url = paramsStr.length
        ? `${window.location.origin}/jobviz${newPaths}?${paramsStr}`
        : `${window.location.origin}/jobviz${newPaths}`;

      router.push(url, undefined, {
        scroll: false,
      });
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
    } catch (error) {
      console.error("Failed to copy job link.", error);
    }
  };

  const handleExploreRelatedCareers = async () => {
    if (!selectedJob) return;

    const socCodesStr = searchParams.get(SOC_CODES_PARAM_NAME);
    const unitNameParam = searchParams.get(UNIT_NAME_PARAM_NAME);
    const url = buildJobvizUrl(
      {
        fromNode: selectedJob,
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
        await router.push(url, undefined, { scroll: false });
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
    selectedJob?.soc_title ?? selectedJob?.title ?? "Job overview";
  const definition =
    selectedJob?.def &&
    selectedJob.def.toLowerCase() !==
      "no definition found for this summary category."
      ? selectedJob.def
      : null;
  const categoryIcon = selectedJob
    ? getIconNameForNode(selectedJob)
    : "Sparkles";
  const jobIcon = selectedJob ? getJobSpecificIconName(selectedJob) : undefined;

  const stats = selectedJob
    ? [
        {
          id: "median",
          label: "Median wage",
          value: formatCurrency(selectedJob.median_annual_wage),
          infoType: "wage" as InfoModalType,
        },
        {
          id: "growth",
          label: "10-year change",
          value: formatPercent(selectedJob.employment_change_percent),
          infoType: "growth" as InfoModalType,
        },
        {
          id: "jobs",
          label: `Jobs by ${DATA_END_YR}`,
          value: formatNumber(selectedJob.employment_end_yr),
          infoType: "jobs" as InfoModalType,
        },
      ]
    : [];

  return (
    <>
      <Modal
        show={!!selectedJob}
        onHide={handleOnHide}
        onShow={() => {
          const nextLink = selectedJob
            ? createSelectedJobVizJobLink(selectedJob)
            : null;
          if (selectedJob && nextLink) {
            setJobLink(nextLink);
          } else {
            console.error("selectedJob is falsy. Cannot create job link.");
          }
        }}
        contentClassName="selectedJobModal"
        dialogClassName="dialogJobVizModal py-2 d-sm-flex justify-content-center align-items-center"
        fullscreen="md-down"
        style={{
          zIndex: 10000000,
        }}
      >
        <Body className="selectedJobBody">
          {selectedJob && (
            <article className={styles.modalCard}>
              <header className={styles.modalHeader}>
                <div className={styles.modalIdentity}>
                  <div className={`${styles.iconBadge} ${styles.modalIcon}`}>
                    <LucideIcon name={categoryIcon} />
                    {jobIcon && (
                      <span className={styles.nestedIcon}>
                        <LucideIcon name={jobIcon} />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className={styles.modalEyebrow}>Job detail modal</p>
                    <h3 className={styles.modalTitle}>{jobTitle}</h3>
                  </div>
                </div>
                <div className={styles.modalHeaderActions}>
                  <span className={styles.modalBadge}>
                    {selectedJob.soc_code}
                  </span>
                  <button
                    type="button"
                    className={styles.modalCloseButton}
                    onClick={handleOnHide}
                    aria-label="Close job details"
                  >
                    <LucideIcon name="X" />
                  </button>
                </div>
              </header>
              <p className={styles.modalSummary}>
                {definition ?? "Definition unavailable from the BLS feed."}
              </p>
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
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className={styles.modalList}>
                <li>
                  Typical education:{" "}
                  {describe(selectedJob.typical_education_needed_for_entry)}
                </li>
                <li>
                  Work experience:{" "}
                  {describe(selectedJob.work_experience_in_a_related_occupation)}
                </li>
                <li>
                  On-the-job training:{" "}
                  {describe(
                    selectedJob[
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
                >
                  Explore related careers
                </button>
                {selectedJob.BLS_link && (
                  <a
                    className={styles.ghostButton}
                    href={selectedJob.BLS_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View BLS profile
                  </a>
                )}
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleCopyLink}
                >
                  Copy share link
                </button>
              </footer>
            </article>
          )}
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
              {activeInfoModal.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
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
