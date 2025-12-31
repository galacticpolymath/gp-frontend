import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useRouter } from "next/router";
import sanitizeHtml from "sanitize-html";
import styles from "../../styles/jobvizBurst.module.scss";
import { useModalContext } from "../../providers/ModalProvider";
import { LucideIcon } from "./LucideIcon";
import QRCode from "react-qr-code";
import {
  encodeJobvizSharePayload,
  JOBVIZ_REPORT_PARAM_NAME,
} from "./jobvizShareUtils";
import {
  buildJobvizUrl,
  getNodeBySocCode,
  getDisplayTitle,
  getIconNameForNode,
  getJobSpecificIconName,
} from "./jobvizUtils";
import type { JobVizNode } from "./jobvizUtils";
import { JobRatingValue, useJobRatings } from "./jobRatingsStore";

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
  emoji: string;
}> = [
  { rating: "love", title: "Jobs I think I would enjoy", emoji: "💜" },
  { rating: "like", title: "Jobs I might like", emoji: "👍" },
  { rating: "dislike", title: "Jobs that are definitely not for me", emoji: "👎" },
];

type SummaryJobRow = {
  title: string;
  soc: string;
  rating: JobRatingValue | null;
  scoreLabel: string;
  link: string | null;
  familyTitle: string;
  familyNode: JobVizNode | null;
  iconName: string | null;
};

type SummaryPronoun = "you" | "i";
type RatingsInsightResult = {
  summary: string;
  secondaryPlain?: string;
  linkTarget?: { title: string; href: string };
  iconNames?: string[];
};
const RATING_SCORE_MAP: Record<JobRatingValue, number> = {
  love: 3,
  like: 2,
  dislike: 1,
};

const OTHER_FAMILY_LABEL = "other career areas";
const FAMILY_LIST_LIMIT = 2;
const MIN_FAMILY_SAMPLE = 2;
const SIGNIFICANT_DELTA = 0.25;
const EXPLORATION_HINT = {
  you: "Feel free to explore the other 800+ jobs in JobViz to discover new opportunities.",
  i: "I'll explore the other 800+ jobs in JobViz to discover new opportunities.",
};

const formatFamilyGroupName = (value?: string | null) => {
  if (!value) return OTHER_FAMILY_LABEL;
  const normalized = value.trim();
  if (!normalized) return OTHER_FAMILY_LABEL;
  return normalized
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const resolveFamilyTitle = (node?: JobVizNode | null) => {
  if (!node) return null;
  const levelOneCode = node.level1 ?? null;
  if (levelOneCode) {
    const topLevelNode = getNodeBySocCode(levelOneCode);
    if (topLevelNode) {
      return getDisplayTitle(topLevelNode);
    }
  }
  return getDisplayTitle(node);
};

const formatList = (items: string[]) => {
  if (items.length <= 1) return items[0] ?? "";
  const formatter =
    typeof Intl !== "undefined" && typeof (Intl as any).ListFormat === "function"
      ? new Intl.ListFormat("en", { style: "long", type: "conjunction" })
      : null;
  if (formatter) {
    return formatter.format(items);
  }
  const tail = items[items.length - 1];
  return `${items.slice(0, -1).join(", ")}, and ${tail}`;
};

const formatFamilyPhrase = (names: string[]) => {
  if (!names.length) return null;
  const capped = names.slice(0, FAMILY_LIST_LIMIT);
  return `${formatList(capped)} jobs`;
};

const buildAbsoluteUrl = (path: string | null | undefined) => {
  if (!path) return path ?? "";
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window !== "undefined") {
    return new URL(path, window.location.origin).toString();
  }
  const defaultOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://teach.galacticpolymath.com";
  return new URL(path, defaultOrigin).toString();
};

const buildRatingsInsight = (
  jobRows: SummaryJobRow[],
  counts: { love: number; like: number; dislike: number; rated: number; total: number },
  pronoun: SummaryPronoun
): RatingsInsightResult => {
  if (!counts.total || !counts.rated) {
    return pronoun === "you"
      ? { summary: "Rate each assignment job to unlock a shareable summary." }
      : { summary: "I need to rate each assignment job to unlock a shareable summary." };
  }

  const scoredRows = jobRows
    .filter((job) => Boolean(job.rating))
    .map((job) => ({
      rating: job.rating as JobRatingValue,
      family: job.familyTitle ?? OTHER_FAMILY_LABEL,
      score: RATING_SCORE_MAP[job.rating as JobRatingValue],
      node: job.familyNode ?? null,
    }));

  if (!scoredRows.length) {
    return pronoun === "you"
      ? { summary: "Rate each assignment job to unlock a shareable summary." }
      : { summary: "I need to rate each assignment job to unlock a shareable summary." };
  }

  const totalScore = scoredRows.reduce((acc, row) => acc + row.score, 0);
  const overallAvg = totalScore / scoredRows.length;
  const familyMap = new Map<
    string,
    { count: number; scoreSum: number; positive: number; negative: number; node: JobVizNode | null }
  >();

  scoredRows.forEach(({ family, score, rating, node }) => {
    const entry =
      familyMap.get(family) ?? {
        count: 0,
        scoreSum: 0,
        positive: 0,
        negative: 0,
        node: null as JobVizNode | null,
      };
    entry.count += 1;
    entry.scoreSum += score;
    if (rating === "love" || rating === "like") {
      entry.positive += 1;
    } else if (rating === "dislike") {
      entry.negative += 1;
    }
    if (!entry.node && node) {
      entry.node = node;
    }
    familyMap.set(family, entry);
  });

  const familyStats = Array.from(familyMap.entries()).map(([name, stat]) => ({
    name,
    count: stat.count,
    avg: stat.scoreSum / stat.count,
    positive: stat.positive,
    negative: stat.negative,
    node: stat.node,
  }));

  const eligibleFamilies = familyStats.filter((family) => family.count >= MIN_FAMILY_SAMPLE);

  const topCandidates = eligibleFamilies
    .filter((family) => family.avg >= overallAvg + SIGNIFICANT_DELTA)
    .sort((a, b) => b.avg - a.avg);

  const bottomCandidates = eligibleFamilies
    .filter((family) => overallAvg - family.avg >= SIGNIFICANT_DELTA)
    .sort((a, b) => a.avg - b.avg);

  const joinNames = (candidates: typeof topCandidates) =>
    formatFamilyPhrase(
      candidates.map((item) => formatFamilyGroupName(item.name))
    );

  const rawTopPhrase = joinNames(topCandidates);
  const topPhrase = rawTopPhrase?.replace(/\b(jobs?|occupations)\b$/i, "").trim();
  const bottomPhrase = joinNames(bottomCandidates);
  const pronounParts =
    pronoun === "you"
      ? { subject: "You", possessive: "Your", object: "you", negativeVerb: "weren't" }
      : { subject: "I", possessive: "My", object: "me", negativeVerb: "wasn't" };

  const sentences: string[] = [];

  if (topPhrase && bottomPhrase) {
    sentences.push(
      `${pronounParts.subject} showed the strongest interest in ${topPhrase}, while ${bottomPhrase} didn't resonate.`
    );
  } else if (topPhrase) {
    sentences.push(`${pronounParts.subject} gravitated toward ${topPhrase} overall.`);
  } else if (bottomPhrase) {
    sentences.push(
      `${pronounParts.subject} ${pronounParts.negativeVerb} very interested in ${bottomPhrase}.`
    );
  } else {
    if (overallAvg >= 2.4) {
      sentences.push(`${pronounParts.possessive} ratings leaned strongly positive overall.`);
    } else if (overallAvg >= 1.8) {
      sentences.push(`${pronounParts.subject} had mixed feelings about these jobs.`);
    } else {
      sentences.push(`None of these jobs really stood out for ${pronounParts.object}.`);
    }
  }

  const highlightNode = topCandidates[0]?.node ?? bottomCandidates[0]?.node ?? null;
  const linkTarget = highlightNode
    ? {
        title: formatFamilyGroupName(getDisplayTitle(highlightNode)),
        href: buildAbsoluteUrl(buildJobvizUrl({ fromNode: highlightNode })),
      }
    : undefined;

  const iconNames = topCandidates
    .slice(0, FAMILY_LIST_LIMIT)
    .map((candidate) => (candidate.node ? getIconNameForNode(candidate.node) : null))
    .filter(
      (value): value is Exclude<typeof value, null> =>
        typeof value === "string" && value.length > 0
    );

  const shouldEncourageExploration = overallAvg < 1.8 || !topPhrase;
  let secondaryPlain: string | undefined;
  if (linkTarget) {
    secondaryPlain = `${
      pronoun === "you"
        ? "Explore other careers in"
        : "I'll explore other careers in"
    } ${linkTarget.title} ${pronoun === "you" ? "that you might like" : "that I might like"}: ${linkTarget.href}`;
  } else if (shouldEncourageExploration) {
    secondaryPlain = EXPLORATION_HINT[pronoun];
  }

  return {
    summary: sentences.join(" "),
    secondaryPlain,
    linkTarget,
    iconNames: iconNames.length ? iconNames : undefined,
  };
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
  const { _jobvizSummaryModal, _selectedJob, _isJobModalOn } = useModalContext();
  const [summaryState, setSummaryState] = _jobvizSummaryModal;
  const [, setSelectedJob] = _selectedJob;
  const [, setIsJobModalOn] = _isJobModalOn;
  const { ratings } = useJobRatings();
  const router = useRouter();
  const copyToClipboard = useClipboard();
  const [reflection, setReflection] = useState("");
  const [includeHeaderRow, setIncludeHeaderRow] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOpen = summaryState.isDisplayed;

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

  const jobRows = useMemo<SummaryJobRow[]>(
    () =>
      normalizedJobs.map((job) => {
        const rating = activeRatings[job.soc] ?? null;
        const node = getNodeBySocCode(job.soc);
        const link = node ? buildJobvizUrl({ fromNode: node }) : null;
        const familyNode = node?.level1
          ? getNodeBySocCode(node.level1) ?? node
          : node ?? null;
        const familyTitle = formatFamilyGroupName(resolveFamilyTitle(familyNode));
        return {
          ...job,
          rating,
          scoreLabel: rating ? ratingScoreLabel[rating] : "",
          link,
          familyTitle,
          familyNode,
          iconName: node
            ? getJobSpecificIconName(node) ?? getIconNameForNode(node)
            : null,
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

  const ratingsInsight = useMemo(
    () => buildRatingsInsight(jobRows, counts, "you"),
    [counts, jobRows]
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
    const summaryLine = buildRatingsInsight(jobRows, counts, pronoun);
    const lines = [
      `Galactic Polymath | JobViz+ Assignment Report`,
      unitLabel,
      "",
      summaryLine.summary,
    ];
    if (summaryLine.secondaryPlain) {
      lines.push(summaryLine.secondaryPlain);
    }
    lines.push(
      "",
      "Ratings:",
      ...jobRows.map((job, index) => `${index + 1}. ${job.title} — ${job.rating ? job.rating.toUpperCase() : "Not rated"}`)
    );
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

  const [shareUrlPreview, setShareUrlPreview] = useState<string | null>(null);

  const refreshShareUrl = useCallback(async () => {
    if (!showActions) {
      setShareUrlPreview(null);
      return;
    }
    try {
      const url = await buildShareUrl();
      setShareUrlPreview(url);
    } catch {
      setShareUrlPreview(null);
    }
  }, [buildShareUrl, showActions]);

  useEffect(() => {
    refreshShareUrl();
  }, [refreshShareUrl, summaryState.isDisplayed]);

  const handleCopyShareLink = async () => {
    if (!showActions) return;
    try {
      const url = shareUrlPreview ?? (await buildShareUrl());
      await copyToClipboard(url);
      setSelectedJob(null);
      setIsJobModalOn(false);
      setSummaryState((prev) => ({ ...prev, isDisplayed: true }));
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
            Job Tour Summary
          </span>
          <p className={styles.summaryModalKicker}>
            Galactic Polymath | JobViz+
          </p>
          <h2 className={styles.summaryModalTitle}>Finalize & Share</h2>
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
        <div className={styles.summarySentenceRow}>
          {ratingsInsight.iconNames?.length ? (
            <span className={styles.summaryIconDeck} aria-hidden="true">
              {ratingsInsight.iconNames.map((icon) => (
                <span key={icon} className={styles.summaryIconBadge}>
                  <LucideIcon name={icon} />
                </span>
              ))}
            </span>
          ) : null}
          <p className={styles.summarySentence}>{ratingsInsight.summary}</p>
        </div>
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
            <span>
              <LucideIcon name="MessageCircleMore" aria-hidden="true" />
              Reflection (optional)
            </span>
            <span>{remainingCharacters} characters left</span>
          </div>
          <textarea
            className={styles.summaryReflectionInput}
            placeholder="Add your thoughts about what you gained from exploring these jobs"
            value={reflection}
            onChange={handleReflectionChange}
            maxLength={reflectionLimit}
          />
          {/* Removed legacy read-only note to streamline messaging */}
        </div>
        {showActions && (
        <div className={styles.summaryShareSection}>
              <div className={styles.summaryShareHeader}>
                <h3>
                  <LucideIcon name="Send" aria-hidden="true" />
                  Share your ratings and thoughts
                </h3>
                <button
                  type="button"
                  className={styles.summaryInfoToggle}
                  onClick={() => setInfoOpen((prev) => !prev)}
                >
                  {infoOpen ? (
                    "Hide info"
                  ) : (
                    <>
                      <LucideIcon name="Info" aria-hidden="true" />
                      <span>Sharing &amp; Privacy</span>
                    </>
                  )}
                </button>
              </div>
            {infoOpen && (
              <div className={styles.summaryInfoPanel}>
                <div className={styles.summaryInfoHeader}>
                  <LucideIcon name="Info" />
                  <h4>About Sharing and Privacy</h4>
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
            {/* QR code preview temporarily disabled due to dense encoding */}
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
                  <h4>
                    <span className={styles.summaryGroupEmoji} aria-hidden="true">
                      {category.emoji}
                    </span>
                    {category.title}
                  </h4>
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
                            <span className={styles.summaryJobItemIcon}>
                              <LucideIcon name={job.iconName ?? "Briefcase"} />
                            </span>
                            <span className={styles.summaryJobItemTitle}>
                              {job.title}
                            </span>
                            <LucideIcon name="ArrowUpRight" />
                          </a>
                        ) : (
                          <span className={styles.summaryJobItemLink}>
                            <span className={styles.summaryJobItemIcon}>
                              <LucideIcon name={job.iconName ?? "Briefcase"} />
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
        {ratingsInsight.linkTarget && (
          <p className={styles.summarySecondaryCallout}>
            Explore other careers in{" "}
            <a
              href={ratingsInsight.linkTarget.href}
              target="_blank"
              rel="noreferrer"
            >
              {ratingsInsight.linkTarget.title}
            </a>{" "}
            that you might like.
          </p>
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
