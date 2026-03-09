import { useCallback } from "react";
import sanitizeHtml from "sanitize-html";
import {
  buildJobvizUrl,
  getNodeBySocCode,
  getDisplayTitle,
  getIconNameForNode,
  getJobSpecificIconName,
} from "../jobvizUtils";
import type { JobVizNode } from "../jobvizUtils";
import { JobRatingValue } from "../jobRatingsStore";
import { JOBVIZ_CATEGORIES_ANCHOR_ID } from "../jobvizDomIds";

export const INFO_COPY_LINES = [
  "JobViz+ lets you rate jobs to explore what interests you.",
  "Your ratings are for learning and reflection.",
  "They’re saved only on your device unless you choose to share them.",
  "If you share a link, it only includes the ratings—and anything you type, like your name or a note.",
  "Anyone with your link can reconstruct this report, but Galactic Polymath never stores that data or sees student names.",
  "Have fun exploring—and discover what’s possible!",
];

export const ratingScoreLabel: Record<JobRatingValue, string> = {
  dislike: "0-dislike",
  like: "1-like",
  love: "2-love",
};

export const NAME_PLACEHOLDER = "Add_Name";

export const JOB_GROUP_SECTIONS: Array<{
  rating: JobRatingValue;
  title: string;
  emoji: string;
}> = [
  { rating: "love", title: "Jobs I think I would enjoy", emoji: "💜" },
  { rating: "like", title: "Jobs I might like", emoji: "👍" },
  { rating: "dislike", title: "Jobs that are definitely not for me", emoji: "👎" },
];

export type SummaryJobRow = {
  title: string;
  soc: string;
  rating: JobRatingValue | null;
  scoreLabel: string;
  link: string | null;
  familyTitle: string;
  familyNode: JobVizNode | null;
  iconName: string | null;
  jobIconName: string | null;
};

export type SummaryPronoun = "you" | "i";

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
  const withoutOccupations = normalized.replace(/\boccupations?\b/gi, "").trim();
  return withoutOccupations
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

export const buildRatingsInsight = (
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
    formatFamilyPhrase(candidates.map((item) => formatFamilyGroupName(item.name)));

  const rawTopPhrase = joinNames(topCandidates);
  const topPhrase = rawTopPhrase?.replace(/\b(jobs?|occupations)\b$/i, "").trim();
  const bottomPhrase = joinNames(bottomCandidates);
  const pronounParts =
    pronoun === "you"
      ? { subject: "You", possessive: "Your", object: "you", negativeVerb: "weren't" }
      : { subject: "I", possessive: "My", object: "me", negativeVerb: "wasn't" };

  const loveJobs = jobRows.filter((job) => job.rating === "love");
  const likeJobs = jobRows.filter((job) => job.rating === "like");
  const likeFamilyCounts = likeJobs
    .map((job) => formatFamilyGroupName(job.familyTitle))
    .reduce<Record<string, number>>((acc, name) => {
      if (!name) return acc;
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});
  const rankedLikeFamilies = Object.entries(likeFamilyCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .filter(Boolean);
  const likeFamilyPhrase = formatFamilyPhrase(rankedLikeFamilies);
  const sentences: string[] = [];

  let customPreferenceSummary: string | null = null;
  if (!topPhrase && loveJobs.length && likeJobs.length >= 2 && likeFamilyPhrase) {
    const standout = loveJobs[0];
    const standoutTitle = standout?.title ?? standout?.familyTitle ?? "one job";
    customPreferenceSummary =
      pronoun === "you"
        ? `You like a lot of ${likeFamilyPhrase}, but seem especially drawn to “${standoutTitle}.”`
        : `I like a lot of ${likeFamilyPhrase}, but I'm especially drawn to “${standoutTitle}.”`;
  } else if (!loveJobs.length && likeJobs.length >= 2 && likeFamilyPhrase && !topPhrase) {
    customPreferenceSummary =
      pronoun === "you"
        ? `You didn't love any jobs on this tour, but were somewhat interested in ${likeFamilyPhrase}.`
        : `I didn't love any jobs on this tour, but I was somewhat interested in ${likeFamilyPhrase}.`;
  }

  if (customPreferenceSummary) {
    sentences.push(customPreferenceSummary);
  } else if (topPhrase && bottomPhrase) {
    sentences.push(
      `${pronounParts.subject} showed the strongest interest in ${topPhrase}, while ${bottomPhrase} didn't resonate.`
    );
  } else if (topPhrase) {
    sentences.push(`${pronounParts.subject} gravitated toward ${topPhrase} overall.`);
  } else if (bottomPhrase) {
    sentences.push(
      `${pronounParts.subject} ${pronounParts.negativeVerb} very interested in ${bottomPhrase}.`
    );
  } else if (overallAvg >= 2.4) {
    sentences.push(`${pronounParts.possessive} ratings leaned strongly positive overall.`);
  } else if (overallAvg >= 1.8) {
    sentences.push(`${pronounParts.subject} had mixed feelings about these jobs.`);
  } else {
    sentences.push(`None of these jobs really stood out for ${pronounParts.object}.`);
  }

  const highlightNode = topCandidates[0]?.node ?? bottomCandidates[0]?.node ?? null;
  const highlightFamilyName = highlightNode
    ? formatFamilyGroupName(getDisplayTitle(highlightNode))
    : null;
  const familyUrl = highlightNode ? buildJobvizUrl({ fromNode: highlightNode }) : null;
  const anchorSuffix = `#${JOBVIZ_CATEGORIES_ANCHOR_ID}`;
  const linkTarget = highlightFamilyName
    ? {
        title: highlightFamilyName,
        href: familyUrl ? `${familyUrl}${anchorSuffix}` : anchorSuffix,
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
      pronoun === "you" ? "Explore other careers in" : "I'll explore other careers in"
    } ${linkTarget.title} ${
      pronoun === "you" ? "that you might like" : "that I might like"
    }: ${linkTarget.href}`;
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

export const sanitizePlainText = (value: string) =>
  sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

export const useClipboard = () =>
  useCallback(async (text: string) => {
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

export const buildSummaryJobRow = (
  job: { title: string; soc: string },
  activeRatings: Record<string, JobRatingValue | null>
): SummaryJobRow => {
  const rating = activeRatings[job.soc] ?? null;
  const node = getNodeBySocCode(job.soc);
  const link = node ? buildJobvizUrl({ fromNode: node }) : null;
  const familyNode = node?.level1 ? getNodeBySocCode(node.level1) ?? node : node ?? null;
  return {
    ...job,
    rating,
    scoreLabel: rating ? ratingScoreLabel[rating] : "",
    link,
    familyTitle: formatFamilyGroupName(resolveFamilyTitle(familyNode)),
    familyNode,
    iconName: node ? getIconNameForNode(node) : null,
    jobIconName: node ? getJobSpecificIconName(node) ?? null : null,
  };
};
