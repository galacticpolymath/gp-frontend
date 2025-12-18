import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useRouter } from "next/router";
import sanitizeHtml from "sanitize-html";
import styles from "../../styles/jobvizBurst.module.scss";
import { useModalContext } from "../../providers/ModalProvider";
import { LucideIcon } from "./LucideIcon";
import {
  encodeJobvizSharePayload,
  JOBVIZ_REPORT_PARAM_NAME,
} from "./jobvizShareUtils";
import {
  buildJobvizUrl,
  getNodeBySocCode,
} from "./jobvizUtils";
import { JobRatingValue, ratingEmoji, useJobRatings } from "./jobRatingsStore";

const INFO_COPY_LINES = [
  "JobViz+ lets you rate jobs to explore what interests you.",
  "Your ratings are for learning and reflection.",
  "They’re saved only on your device unless you choose to share them.",
  "If you share a link, it only includes the ratings—and anything you type, like your name or a note.",
  "Anyone with your link can reconstruct this report, but Galactic Polymath never stores that data or sees student names.",
  "Have fun exploring—and discover what’s possible!",
];

const ratingScoreLabel: Record<JobRatingValue, string> = {
  dislike: "0-dislike",
  like: "1-like",
  love: "2-love",
};

const NAME_PLACEHOLDER = "Add_Name";
const JOB_GROUP_SECTIONS: Array<{
  rating: JobRatingValue;
  title: string;
}> = [
  { rating: "love", title: "Jobs I think I would enjoy" },
  { rating: "like", title: "Jobs I might like" },
  { rating: "dislike", title: "Jobs that are definitely not for me" },
];

const describeSegment = (verb: string, count: number, fallback: string) => {
  if (!count) return fallback;
  return `${verb} ${count} ${count === 1 ? "job" : "jobs"}`;
};

type SummaryPronoun = "you" | "i";

const buildSummarySentence = (
  counts: { love: number; like: number; dislike: number; total: number },
  pronoun: SummaryPronoun
) => {
  if (!counts.total) {
    return pronoun === "you"
      ? "Rate each assignment job to unlock a shareable summary."
      : "I need to rate each assignment job to unlock a shareable summary.";
  }

  const subject = pronoun === "you" ? "You" : "I";
  const object = pronoun === "you" ? "you" : "me";

  return `${subject} ${describeSegment(
    "loved",
    counts.love,
    "didn't love any"
  )} , ${describeSegment("liked", counts.like, "didn't like any")} , and ${describeSegment(
    "marked",
    counts.dislike,
    "didn't mark any"
  )} as not for ${object} out of ${counts.total} ${
    counts.total === 1 ? "job" : "jobs"
  }.`;
};

const sanitizePlainText = (value: string) =>
  sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

const useClipboard = () => {
  const copy = useCallback(async (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    if (typeof document === "undefined") return;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999px";
    textArea.style.top = "-999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }, []);
  return copy;
};

const JobVizSummaryModal: React.FC = () => {
  const { _jobvizSummaryModal } = useModalContext();
  const [summaryState, setSummaryState] = _jobvizSummaryModal;
  const { ratings } = useJobRatings();
  const router = useRouter();
  const copyToClipboard = useClipboard();
  const [reflection, setReflection] = useState("");
  const [includeHeaderRow, setIncludeHeaderRow] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOpen = summaryState.isDisplayed;
  const allowEditing = summaryState.allowEditing !== false && !summaryState.payload;

  useEffect(() => {
    if (!isOpen) {
      setReflection("");
      setInfoOpen(false);
      setIncludeHeaderRow(true);
      return;
    }
    if (summaryState.payload) {
      setReflection(summaryState.payload.reflection ?? "");
    }
  }, [isOpen, summaryState.payload]);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = null;
      }
    };
  }, []);

  const normalizedJobs = useMemo(() => {
    if (summaryState.jobs?.length) return summaryState.jobs;
    if (summaryState.payload?.jobs?.length) {
      return summaryState.payload.jobs.map((job) => ({
        title: job.title,
        soc: job.soc,
      }));
    }
    return [];
  }, [summaryState.jobs, summaryState.payload]);

  const payloadRatingsMap = useMemo(() => {
    if (!summaryState.payload?.jobs) return null;
    return summaryState.payload.jobs.reduce<Record<string, JobRatingValue | null>>(
      (acc, job) => {
        if (job.soc) {
          acc[job.soc] = job.rating ?? null;
        }
        return acc;
      },
      {}
    );
  }, [summaryState.payload]);

  const activeRatings = payloadRatingsMap ?? ratings;

  const jobRows = useMemo(
    () =>
      normalizedJobs.map((job) => {
        const rating = activeRatings[job.soc] ?? null;
        const node = getNodeBySocCode(job.soc);
        const link = node ? buildJobvizUrl({ fromNode: node }) : null;
        return {
          ...job,
          rating,
          emoji: ratingEmoji(rating),
          scoreLabel: rating ? ratingScoreLabel[rating] : "",
          link,
        };
      }),
    [normalizedJobs, activeRatings]
  );

  const categorizedJobs = useMemo(
    () =>
      JOB_GROUP_SECTIONS.map((section) => ({
        ...section,
        jobs: jobRows.filter((job) => job.rating === section.rating),
      })),
    [jobRows]
  );

  const counts = useMemo(() => {
    return jobRows.reduce(
      (acc, job) => {
        if (job.rating === "love") acc.love += 1;
        if (job.rating === "like") acc.like += 1;
        if (job.rating === "dislike") acc.dislike += 1;
        if (job.rating) acc.rated += 1;
        return acc;
      },
      { love: 0, like: 0, dislike: 0, rated: 0, total: jobRows.length }
    );
  }, [jobRows]);

  const summarySentence = useMemo(
    () => buildSummarySentence(counts, "you"),
    [counts]
  );

  const safeReflection = useMemo(() => sanitizePlainText(reflection), [reflection]);
  const reflectionLimit = 200;
  const remainingCharacters = Math.max(reflectionLimit - reflection.length, 0);
  const unitLabel = summaryState.unitName
    ? `Jobs related to the ${summaryState.unitName} unit`
    : "JobViz assignment";

  const showActions = jobRows.length > 0;

  const closeModal = () => {
    setSummaryState((prev) => ({
      ...prev,
      isDisplayed: false,
    }));
    setStatusMessage(null);
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
  };

  const announceStatus = (message: string) => {
    setStatusMessage(message);
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = setTimeout(() => {
      setStatusMessage(null);
      statusTimeoutRef.current = null;
    }, 4000);
  };

  const buildReportText = (pronoun: SummaryPronoun = "you") => {
    const summaryLine = buildSummarySentence(counts, pronoun);
    const lines = [
      `Galactic Polymath | JobViz+ Assignment Report`,
      unitLabel,
      "",
      summaryLine,
      "",
      "Ratings:",
      ...jobRows.map((job, index) => `${index + 1}. ${job.title} — ${job.rating ? job.rating.toUpperCase() : "Not rated"}`),
    ];
    if (safeReflection) {
      lines.push("", `Reflection: ${safeReflection}`);
    }
    return lines.join("\n");
  };

  const buildSpreadsheetRow = async () => {
    const header = [
      "Name",
      ...jobRows.map((job) => job.title),
      "Reflection",
      "Report_link",
    ];
    const shareLink = await buildShareUrl();
    const values = [
      NAME_PLACEHOLDER,
      ...jobRows.map((job) => job.scoreLabel ?? ""),
      safeReflection,
      shareLink,
    ];
    const rows: string[][] = [];
    if (includeHeaderRow) {
      rows.push(header);
    }
    rows.push(values);
    return rows
      .map((row) =>
        row
          .map((cell) => cell ?? "")
          .join("\t")
      )
      .join("\n");
  };

  const handleCopyReport = async () => {
    if (!showActions) return;
    try {
      await copyToClipboard(buildReportText());
      announceStatus("Report text copied");
    } catch (error) {
      announceStatus("Unable to copy report");
    }
  };

  const handleCopySpreadsheet = async () => {
    if (!showActions) return;
    try {
      const row = await buildSpreadsheetRow();
      await copyToClipboard(row);
      announceStatus("Spreadsheet row copied");
    } catch (error) {
      announceStatus("Unable to copy spreadsheet data");
    }
  };

  const buildShareUrl = useCallback(async () => {
    if (summaryState.payload) {
      if (typeof window !== "undefined") {
        return window.location.href;
      }
      return "";
    }
    const encoded = encodeJobvizSharePayload({
      jobs: jobRows.map((job) => ({
        title: job.title,
        soc: job.soc,
        rating: job.rating ?? null,
      })),
      unitName: summaryState.unitName,
      reflection: safeReflection,
    });
    if (typeof window === "undefined") return encoded;
    const [pathOnly] = router.asPath.split("?");
    const shareUrl = new URL(`${window.location.origin}${pathOnly || ""}`);
    shareUrl.searchParams.set(JOBVIZ_REPORT_PARAM_NAME, encoded);
    return shareUrl.toString();
  }, [jobRows, router.asPath, safeReflection, summaryState.payload, summaryState.unitName]);

  const handleCopyShareLink = async () => {
    if (!showActions) return;
    try {
      const url = await buildShareUrl();
      await copyToClipboard(url);
      announceStatus("Share link copied");
    } catch (error) {
      announceStatus("Unable to copy link");
    }
  };

  const handleEmailReport = async () => {
    if (!showActions) return;
    try {
      const reportText = buildReportText("i");
      const shareUrl = await buildShareUrl();
      const body = encodeURIComponent(`${reportText}\n\nReport link: ${shareUrl}`);
      const subject = encodeURIComponent(
        summaryState.unitName
          ? `JobViz+ report – ${summaryState.unitName}`
          : "JobViz+ assignment report"
      );
      if (typeof window !== "undefined") {
        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank", "noopener,noreferrer");
      } else {
        announceStatus("Email is only available in the browser");
      }
    } catch (error) {
      announceStatus("Unable to start email");
    }
  };

  const handleReflectionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!allowEditing) return;
    const next = event.target.value.slice(0, reflectionLimit);
    setReflection(next);
  };

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      dialogClassName={styles.summaryModalDialog}
      contentClassName={styles.summaryModalContent}
      className={styles.summaryModalRoot}
      backdropClassName={styles.summaryModalBackdrop}
      centered
      size="lg"
      style={{ zIndex: 12000080 }}
    >
      <Modal.Header className={styles.summaryModalHeader}>
        <div className={styles.summaryHeaderGroup}>
          <span className={styles.summaryHeaderBadge}>
            <LucideIcon name="Sparkles" aria-hidden="true" />
            Report ready
          </span>
          <p className={styles.summaryModalKicker}>
            Galactic Polymath | JobViz+
          </p>
          <h2 className={styles.summaryModalTitle}>Summarize & Share</h2>
        </div>
        <button
          type="button"
          className={styles.summaryModalCloseIcon}
          onClick={closeModal}
          aria-label="Close report"
        >
          <LucideIcon name="X" />
        </button>
      </Modal.Header>
      <Modal.Body className={styles.summaryModalBody}>
        <div className={styles.summaryAssignmentTitle}>{unitLabel}</div>
        <p className={styles.summarySentence}>{summarySentence}</p>
        {jobRows.length > 0 && (
          <div className={styles.summaryCounts}>
            <div className={styles.summaryCountCard}>
              <div className={styles.summaryCountEmoji} aria-hidden="true">
                💜
              </div>
              <span className={styles.summaryCountLabel}>Loved</span>
              <span className={styles.summaryCountValue}>{counts.love}</span>
            </div>
            <div className={styles.summaryCountCard}>
              <div className={styles.summaryCountEmoji} aria-hidden="true">
                👍
              </div>
              <span className={styles.summaryCountLabel}>Liked</span>
              <span className={styles.summaryCountValue}>{counts.like}</span>
            </div>
            <div className={styles.summaryCountCard}>
              <div className={styles.summaryCountEmoji} aria-hidden="true">
                👎
              </div>
              <span className={styles.summaryCountLabel}>Not for me</span>
              <span className={styles.summaryCountValue}>{counts.dislike}</span>
            </div>
          </div>
        )}
        <div className={styles.summaryReflectionBlock}>
          <div className={styles.summaryReflectionHeader}>
            <span>Reflection (optional)</span>
            <span>{remainingCharacters} characters left</span>
          </div>
          <textarea
            className={styles.summaryReflectionInput}
            placeholder="Add up to 200 characters describing your why."
            value={reflection}
            onChange={handleReflectionChange}
            maxLength={reflectionLimit}
            disabled={!allowEditing}
          />
          {!allowEditing && summaryState.payload && (
            <p className={styles.summaryReadOnlyNote}>Shared reflections are read-only.</p>
          )}
        </div>
        {showActions && (
        <div className={styles.summaryShareSection}>
              <div className={styles.summaryShareHeader}>
                <h3>Share this assignment</h3>
                <button
                  type="button"
                  className={styles.summaryInfoToggle}
                  onClick={() => setInfoOpen((prev) => !prev)}
                >
                  {infoOpen ? "Hide info" : "About your job ratings"}
                </button>
              </div>
            {infoOpen && (
              <div className={styles.summaryInfoPanel}>
                <div className={styles.summaryInfoHeader}>
                  <LucideIcon name="Info" />
                  <h4>About Your Job Ratings</h4>
                </div>
                <ul>
                  {INFO_COPY_LINES.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className={styles.summaryShareButtons}>
              <button type="button" className={styles.summaryShareButton} onClick={handleCopyReport}>
                <LucideIcon name="Clipboard" /> Copy report text
              </button>
              <div className={styles.summaryShareButtonGroup}>
                <button type="button" className={styles.summaryShareButton} onClick={handleCopySpreadsheet}>
                  <LucideIcon name="Table" /> Copy spreadsheet row
                </button>
                <label className={styles.summaryIncludeHeaderToggle}>
                  <input
                    type="checkbox"
                    checked={includeHeaderRow}
                    onChange={() => setIncludeHeaderRow((prev) => !prev)}
                  />
                  Include header row
                </label>
              </div>
              <button type="button" className={styles.summaryShareButton} onClick={handleEmailReport}>
                <LucideIcon name="Mail" /> Email this report
              </button>
              <button type="button" className={styles.summaryShareButtonPrimary} onClick={handleCopyShareLink}>
                <LucideIcon name="Share2" /> Copy share link
              </button>
            </div>
          </div>
        )}
        {statusMessage && (
          <div className={styles.summaryStatus} role="status">
            {statusMessage}
          </div>
        )}
        {jobRows.length > 0 && (
          <div className={styles.summaryJobGroups}>
            {categorizedJobs.map((category) => (
              <div key={category.rating} className={styles.summaryJobGroup}>
                <div className={styles.summaryJobGroupHeader}>
                  <h4>{category.title}</h4>
                  <span className={styles.summaryJobGroupCount}>
                    {category.jobs.length}
                  </span>
                </div>
                {category.jobs.length > 0 ? (
                  <ul className={styles.summaryJobGroupList}>
                    {category.jobs.map((job) => (
                      <li key={job.soc} className={styles.summaryJobItem}>
                        {job.link ? (
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.summaryJobItemLink}
                          >
                            <span className={styles.summaryJobItemEmoji}>
                              {job.emoji}
                            </span>
                            <span className={styles.summaryJobItemTitle}>
                              {job.title}
                            </span>
                            <LucideIcon name="ArrowUpRight" />
                          </a>
                        ) : (
                          <span className={styles.summaryJobItemLink}>
                            <span className={styles.summaryJobItemEmoji}>
                              {job.emoji}
                            </span>
                            <span className={styles.summaryJobItemTitle}>
                              {job.title}
                            </span>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.summaryJobGroupEmpty}>None yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
        <div className={styles.summaryModalFooter}>
          <button
            type="button"
            className={styles.summaryCloseButton}
            onClick={closeModal}
          >
            Close report
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default JobVizSummaryModal;
