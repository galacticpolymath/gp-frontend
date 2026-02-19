import Head from "next/head";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiBookOpen,
  FiGrid,
  FiLayers,
  FiPlay,
  FiPlayCircle,
  FiShare2,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { useRouter } from "next/router";
import useSiteSession from "../customHooks/useSiteSession";
import {
  AppWindow,
  Compass,
  CornerDownRight,
  CircleArrowLeft,
  CircleArrowRight,
  Laptop,
  X,
  ListFilter,
  NotebookPen,
  PartyPopper,
  Briefcase,
  Rocket,
  School,
  Search,
  SquareCheckBig,
  Youtube,
} from "lucide-react";
import type { IconBaseProps } from "react-icons";
import { MdOutlineSchool } from "react-icons/md";
import { toast } from "react-hot-toast";
import styles from "./home.module.css";
import { getUnitLessons, retrieveUnits } from "../backend/services/unitServices";
import { createDbProjections, getLiveUnits } from "../shared/fns";
import { INewUnitSchema } from "../backend/models/Unit/types/unit";
import sanitizeHtml from "sanitize-html";
import RichText from "../components/RichText";
import {
  FrontEndUserStats,
  getFrontEndUserStats,
} from "../backend/services/userStatsService";
import { IUnitLesson } from "../types/global";
import PortalNav from "../components/PortalNav";
import Footer from "../components/Footer";
import { ensureAbsoluteUrl } from "../shared/seo";
import {
  IConnectionJobViz,
  IJobVizConnection,
} from "../backend/models/Unit/JobViz";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../components/LessonSection/JobVizConnections";
import { getJobTours } from "../components/JobViz/JobTours/jobTourApi";
import type { JobTourRecord } from "../components/JobViz/JobTours/jobTourTypes";
import {
  DEFAULT_JOB_TOUR_ASSIGNMENT,
} from "../components/JobViz/JobTours/jobTourConstants";
import { getDisplayTitle, getNodeBySocCode } from "../components/JobViz/jobvizUtils";
import {
  buildStudentTourUrl,
} from "../components/JobViz/JobTours/tourAccess";

interface PreviewUnit {
  id: string;
  title: string;
  subtitle: string;
  bannerUrl: string;
  subject: string;
  grades: string;
  lessons: number | null;
  isNew: boolean;
  gist: string;
  gistMarkdown: string;
  epaulette: string | null;
  epauletteVert: string | null;
  targetStandards: string[];
  connectedStandards: string[];
  careerConnections: string[];
  sponsorText: string;
  sponsorMarkdown: string;
  sponsorLogo: string | null;
  media: MediaItem[];
  targetSubject: string;
  subjectConnections: string[];
  unitTags: string[];
  releaseDate?: string | null;
  locale: string;
  jobvizConnections?: IJobVizConnection[] | IConnectionJobViz[] | null;
}

const JobTourIcon: React.FC<IconBaseProps> = ({ className, size }) => (
  <img
    src="/imgs/jobViz/jobviz_rocket_logo_color.svg"
    alt=""
    aria-hidden="true"
    className={className}
    width={typeof size === "number" ? size : undefined}
    height={typeof size === "number" ? size : undefined}
  />
);

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  dateLabel: string;
  imageUrl: string | null;
  categoryLabel: string;
  authorName: string;
}

interface HomePageProps {
  featuredUnits: PreviewUnit[];
  allUnits: PreviewUnit[];
  lessons: IUnitLesson[];
  userStats: FrontEndUserStats;
  blogPosts: BlogPost[];
  initialTab?: NavTab;
}

type NavTab = "All" | "Units" | "Apps" | "Videos" | "Lessons" | "JobViz" | "Home";
const QUERY_KEYS = [
  "typeFilter",
  "q",
  "target",
  "aligned",
  "grade",
  "tag",
  "locale",
  "mine",
  "tourScope",
] as const;

const CONTENT_TYPES = ["Unit", "Lesson", "Video", "App", "Job Tour"] as const;
const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

type ResourceType = "Unit" | "Lesson" | "Video" | "App" | "Job Tour";

const buildRootQueryForTab = (tab: NavTab) => {
  switch (tab) {
    case "Units":
      return { typeFilter: ["Unit"] };
    case "Apps":
      return { typeFilter: ["App"] };
    case "Videos":
      return { typeFilter: ["Video"] };
    case "Lessons":
      return { typeFilter: ["Lesson"] };
    case "JobViz":
      return { typeFilter: ["Job Tour"] };
    default:
      return {};
  }
};

const normalizeJobVizConnections = (
  connections: IJobVizConnection[] | IConnectionJobViz[] | null | undefined
): IConnectionJobViz[] => {
  if (!connections?.length) return [];
  const hasDeprecatedShape = connections.some(
    (item) => Array.isArray(item.job_title) || Array.isArray(item.soc_code)
  );
  if (!hasDeprecatedShape) {
    return connections as IConnectionJobViz[];
  }
  return (connections as IJobVizConnection[])
    .map((item) => {
      const title = Array.isArray(item.job_title)
        ? item.job_title[0]
        : item.job_title;
      const soc = Array.isArray(item.soc_code)
        ? item.soc_code[0]
        : item.soc_code;
      if (!title || !soc) return null;
      return { job_title: title, soc_code: soc };
    })
    .filter((item): item is IConnectionJobViz => Boolean(item));
};

const buildJobTourUrl = (resource: PreviewResource) => {
  if (resource.tourSource === "user" && resource.tourId) {
    return `/jobviz?tourId=${encodeURIComponent(resource.tourId)}`;
  }
  if (resource.selectedJobs?.length) {
    const params = new URLSearchParams();
    params.set(SOC_CODES_PARAM_NAME, resource.selectedJobs.join(","));
    if (resource.tourUnitTitle) {
      params.set(UNIT_NAME_PARAM_NAME, resource.tourUnitTitle);
    }
    return `/jobviz?${params.toString()}`;
  }
  return "/jobviz";
};

const getJobTitleFromSocCode = (socCode: string) => {
  const node = getNodeBySocCode(socCode);
  return node ? getDisplayTitle(node) : socCode;
};

const getJobTitlesForTour = (socCodes?: string[] | null, limit = 6) => {
  if (!socCodes?.length) return [];
  return socCodes
    .map((socCode) => getJobTitleFromSocCode(socCode))
    .filter(Boolean)
    .slice(0, limit);
};

const getTourStopSearchTerms = (socCodes?: string[] | null) => {
  if (!socCodes?.length) return [];
  const terms = new Set<string>();
  socCodes.forEach((socCodeRaw) => {
    const socCode = String(socCodeRaw ?? "").trim();
    if (!socCode) return;
    terms.add(socCode);
    const jobTitle = getJobTitleFromSocCode(socCode);
    if (jobTitle) {
      terms.add(jobTitle);
      terms.add(`${jobTitle} ${socCode}`);
    }
  });
  return Array.from(terms);
};

const truncateJobTitle = (title: string, maxLength = 28) => {
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength - 3).trim()}...`;
};

const truncateUnitTitle = (title: string, maxLength = 64) => {
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength - 3).trim()}...`;
};

interface PreviewResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  image: string;
  subject?: string;
  alignedSubjects: string[];
  gradeBandGroup: string;
  gradeBand: string;
  timeLabel: string;
  tags: string[];
  locale: string;
  unitId?: string;
  unitTitle?: string;
  unitSubtitle?: string | null;
  mediaLink?: string | null;
  mediaLessonRelevance?: string | null;
  releaseDate?: string | null;
  isNew?: boolean;
  isPlus?: boolean;
  accent: string;
  icon: React.ComponentType<any>;
  ownerId?: string | null;
  ownerName?: string | null;
  tourSource?: "unit" | "user";
  tourId?: string | null;
  tourAssignment?: string | null;
  tourExplanation?: string | null;
  tourVisibility?: "just-teachers" | "me" | "everyone";
  tourIsGp?: boolean;
  tourUnitId?: string | null;
  tourUnitTitle?: string | null;
  selectedJobs?: string[];
  searchTargetStandards?: string[];
  searchConnectedStandards?: string[];
  searchCareerConnections?: string[];
  searchTourStops?: string[];
  searchGist?: string;
  searchFeaturedMedia?: string[];
  searchLessonDetails?: string[];
}

interface ResourceSearchMatchCategory {
  label: string;
  values: string[];
}

interface ResourceSearchMatchResult {
  queryMatches: boolean;
  hiddenCategories: ResourceSearchMatchCategory[];
  relevanceScore: number;
}

const experiencePillars = [
  {
    title: "Interdisciplinary by design",
    description:
      "Our units connect science to language arts, math, and social studies through rich storylines and real data that has often never been shared with the public.",
    icon: FiLayers,
  },
  {
    title: "Open-access and teacher-friendly",
    description:
      "No paywalls for core lessons. Optional GP+ adds editable files and workflow boosts.",
    icon: FiUsers,
  },
  {
    title: "Fun!",
    description:
      "Our mini-units are creative, inquiry-driven, and filled with original artwork and multimedia that connect current research to students' lives.",
    icon: PartyPopper,
  },
];

const quickFAQ = [
  {
    question: "Is Galactic Polymath just astronomy or math?",
    answer:
      "No. We are interdisciplinary science — from Earth systems to food futures to engineering design.",
  },
  {
    question: "What grade bands do you serve?",
    answer:
      "Most resources fit grades 5-12, with extensions for upper middle school and college-level intros.",
  },
  {
    question: "What is GP+?",
    answer:
      "GP+ adds editable lesson files, Google Drive copies, and streamlined classroom prep tools.",
  },
];

const pressHighlights = [
  "NGSS-aligned",
  "Connected to careers",
  "Real world problems",
  "Great for PBL & team teaching",
  "Classroom, after-school, homeschool",
];

const spotlightResources = [
  {
    id: "starter",
    title: "GP Classroom Starter",
    eyebrow: "Teacher Orientation",
    description:
      "A short path to understand how to teach with GP in your first week.",
    meta: "15 minutes · Printable checklist",
    icon: FiPlayCircle,
  },
  {
    id: "wizard",
    title: "Not sure where to begin?",
    eyebrow: "Easy Start Wizard",
    description:
      "Answer three quick prompts and we will route you to the best unit, app, or video to start today.",
    meta: "3 prompts · Personalized",
    icon: FiPlay,
  },
  {
    id: "lesson",
    title: "SciJourneys Lesson 1",
    eyebrow: "Launch Lesson",
    description:
      "Introduce authentic science with diverse researchers and field stories.",
    meta: "1 class period · Free",
    icon: MdOutlineSchool,
  },
];

const carouselImages = [
  "/imgs/classroomImages/homeCarousel/1-IMG_9600-EDIT (1).jpg",
  "/imgs/classroomImages/homeCarousel/2_18 Kids exited about nitrate tests.jpg",
  "/imgs/classroomImages/homeCarousel/3-63dc0d10-7aa9-460a-a373-bdfcff9fc01e-EDIT.jpg",
];

const fallbackBlogPosts: BlogPost[] = [
  {
    id: "blog-fallback-1",
    title: "Why Insects Belong in Every Classroom",
    excerpt:
      "Explore biodiversity, ecosystems, and the power of student observation with adaptable classroom stories.",
    url: "https://www.galacticpolymath.com/blog",
    dateLabel: "Dec 1, 2025",
    imageUrl: "/imgs/classroomImages/homeCarousel/1-IMG_9600-EDIT (1).jpg",
    categoryLabel: "Featured Scientist, Guest Contributors",
    authorName: "GP Team",
  },
  {
    id: "blog-fallback-2",
    title: "Bring Authentic Science Into Your Classroom",
    excerpt:
      "Meet the scientists, the questions, and the multimedia resources that make inquiry feel real.",
    url: "https://www.galacticpolymath.com/blog",
    dateLabel: "Oct 16, 2025",
    imageUrl: "/imgs/classroomImages/homeCarousel/2_18 Kids exited about nitrate tests.jpg",
    categoryLabel: "GP Blog",
    authorName: "Galactic Polymath",
  },
  {
    id: "blog-fallback-3",
    title: "Save Science: Share Your GP Story",
    excerpt:
      "Community highlights and ways educators are amplifying STEM learning through GP.",
    url: "https://www.galacticpolymath.com/blog",
    dateLabel: "Sep 24, 2025",
    imageUrl: "/imgs/classroomImages/homeCarousel/3-63dc0d10-7aa9-460a-a373-bdfcff9fc01e-EDIT.jpg",
    categoryLabel: "GP Blog",
    authorName: "Galactic Polymath",
  },
];

interface MediaItem {
  title: string;
  type: "Video" | "App";
  thumbnail: string;
  link?: string | null;
  lessonRelevance?: string | null;
  unitTitle?: string | null;
  subtitle?: string | null;
  unitId?: string | null;
}

const fallbackUnits: PreviewUnit[] = [
  {
    id: "unit-fairywrens",
    title: "Fairywrens and the Art of Inquiry",
    subtitle: "How do scientists pick a question to study?",
    bannerUrl:
      "https://storage.googleapis.com/gp-cloud/units/fairywrens/fairywrens_banner.png",
    subject: "Science",
    grades: "Grades 6-8",
    lessons: 2,
    isNew: true,
    gist:
      "Students explore how researchers observe, ask sharper questions, and design investigations in the wild.",
    gistMarkdown:
      "Students explore how researchers observe, ask sharper questions, and design investigations in the wild.",
    epaulette: null,
    epauletteVert: null,
    targetStandards: ["NGSS MS-LS1-4", "NGSS SEP"],
    connectedStandards: [],
    careerConnections: ["Field Biologist", "Research Assistant"],
    sponsorText: "Supported by the GP community of scientists and teachers.",
    sponsorMarkdown:
      "Supported by the GP community of scientists and teachers.",
    sponsorLogo: null,
    media: [
      {
        title: "Observations mini-video",
        type: "Video",
        thumbnail:
          "https://storage.googleapis.com/gp-cloud/units/fairywrens/fairywrens_banner.png",
        link: null,
      },
      {
        title: "Question Builder",
        type: "App",
        thumbnail:
          "https://storage.googleapis.com/gp-cloud/units/fairywrens/fairywrens_banner.png",
        link: null,
      },
    ],
    targetSubject: "Science",
    subjectConnections: ["Biology", "Ecology"],
    unitTags: ["Behavior", "Observation", "Scientific Inquiry"],
    locale: "en-US",
  },
  {
    id: "unit-future-foods",
    title: "Future Foods",
    subtitle: "Can we reduce the carbon footprint of our favorite meals?",
    bannerUrl:
      "https://storage.googleapis.com/gp-cloud/units/future-foods/future_foods_banner.png",
    subject: "Science",
    grades: "Grades 6-9",
    lessons: 4,
    isNew: false,
    gist:
      "Learners trace food systems, energy use, and climate tradeoffs to design more sustainable meals.",
    gistMarkdown:
      "Learners trace food systems, energy use, and climate tradeoffs to design more sustainable meals.",
    epaulette: null,
    epauletteVert: null,
    targetStandards: ["NGSS MS-ESS3-3", "NGSS ETS1"],
    connectedStandards: [],
    careerConnections: ["Food Scientist", "Sustainability Analyst"],
    sponsorText: "Sponsored by mission-aligned partners.",
    sponsorMarkdown: "Sponsored by mission-aligned partners.",
    sponsorLogo: null,
    media: [
      {
        title: "Food systems explainer",
        type: "Video",
        thumbnail:
          "https://storage.googleapis.com/gp-cloud/units/future-foods/future_foods_banner.png",
        link: null,
      },
      {
        title: "Career pathway board",
        type: "App",
        thumbnail:
          "https://storage.googleapis.com/gp-cloud/units/future-foods/future_foods_banner.png",
        link: null,
      },
    ],
    targetSubject: "Earth Science",
    subjectConnections: ["Engineering", "Environmental Science"],
    unitTags: ["Sustainability", "STEAM", "Creativity"],
    locale: "en-US",
  },
];

const PROJECTED_UNITS_FIELDS = [
  "UnitBanner",
  "Title",
  "Subtitle",
  "TargetSubject",
  "ForGrades",
  "GradesOrYears",
  "LsnCount",
  "ReleaseDate",
  "PublicationStatus",
  "numID",
  "locale",
  "TargetStandardsCodes",
  "SponsoredBy",
  "SponsorLogo",
  "FeaturedMultimedia",
  "Sections.overview.TheGist",
  "Sections.overview.SteamEpaulette",
  "Sections.overview.SteamEpaulette_vert",
  "Sections.overview.UnitTags",
  "Sections.overview.Tags",
  "Sections.standards.Data",
  "Sections.jobvizConnections.Content",
] as string[];

const getUnitBanner = (unit: INewUnitSchema) =>
  unit.UnitBanner ||
  "/imgs/gp-logos/GP_Stacked_logo+wordmark_gradient_whiteBG.jpg";

const getGradeLabel = (unit: INewUnitSchema) =>
  unit.ForGrades || unit.GradesOrYears || "Grades 6-12";

const getGradeBandGroup = (gradeLabel: string) => {
  const normalized = gradeLabel.toLowerCase();
  if (normalized.includes("college")) {
    return "College";
  }

  const numbers = Array.from(gradeLabel.matchAll(/\d+/g)).map((match) =>
    parseInt(match[0], 10)
  );

  if (!numbers.length) {
    return "Middle School";
  }

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  if (max <= 5) {
    return "Upper Elementary";
  }
  if (min >= 6 && max <= 8) {
    return "Middle School";
  }
  if (min >= 9 && max <= 12) {
    return "High School";
  }
  if (min >= 13) {
    return "College";
  }
  if (min <= 5 && max <= 8) {
    return "Middle School";
  }
  return "High School";
};

const getTourGradeBands = (gradeLevel?: string | null) => {
  const fallback = "Middle school";
  const raw = gradeLevel?.trim() || fallback;
  const normalized = raw.toLowerCase();
  if (normalized === "all" || normalized.includes("all")) {
    return { gradeBandGroup: "All", gradeBand: "All" };
  }
  if (normalized.includes("upper")) {
    return { gradeBandGroup: "Upper Elementary", gradeBand: "Upper elementary" };
  }
  if (normalized.includes("middle")) {
    return { gradeBandGroup: "Middle School", gradeBand: "Middle school" };
  }
  if (normalized.includes("high")) {
    return { gradeBandGroup: "High School", gradeBand: "High school" };
  }
  if (normalized.includes("college")) {
    return { gradeBandGroup: "College", gradeBand: "College" };
  }
  return { gradeBandGroup: getGradeBandGroup(raw), gradeBand: raw };
};

const isNewRelease = (releaseDate?: string | null) => {
  if (!releaseDate) return false;
  const releaseMs = new Date(releaseDate).getTime();
  if (Number.isNaN(releaseMs)) return false;
  const nowMs = Date.now();
  return nowMs > releaseMs && nowMs - releaseMs < 1000 * 60 * 60 * 24 * 37;
};

const toPlainText = (value?: string | null) =>
  value
    ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
      .replace(/\s+/g, " ")
      .trim()
    : "";

const formatBlogDate = (value?: string | number | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatBlogMeta = (item: any) => {
  const categories = Array.isArray(item?.categories) ? item.categories : [];
  const categoryLabel = categories.length
    ? categories.slice(0, 2).join(", ")
    : item?.collection?.title || "GP Blog";
  const authorName =
    item?.author?.displayName ||
    item?.author?.name ||
    item?.authorName ||
    item?.authorDisplayName ||
    item?.author ||
    "";
  return { categoryLabel, authorName };
};

const getSponsorLogo = (logo?: string[] | string | null) => {
  if (Array.isArray(logo)) {
    return logo[0] ?? null;
  }
  return logo ?? null;
};

const getTargetStandards = (unit: INewUnitSchema) => {
  if (!Array.isArray(unit.TargetStandardsCodes)) {
    return [];
  }
  const standards = unit.TargetStandardsCodes.map((standard) =>
    [standard?.set ?? standard?.subject, standard?.code ?? standard?.dim]
      .filter(Boolean)
      .join(" ")
      .trim()
  ).filter((value) => value.length > 0);

  return Array.from(new Set(standards));
};

const getConnectedStandards = (unit: INewUnitSchema) => {
  const standardsData = unit.Sections?.standards?.Data as
    | Array<{
      target?: boolean;
      sets?: Array<{
        dimensions?: Array<{
          standardsGroup?: Array<{ codes?: string | null }>;
        }>;
      }>;
    }>
    | undefined;
  if (!Array.isArray(standardsData)) {
    return [];
  }
  const codes = standardsData
    .filter((subjectGroup) => subjectGroup?.target === false)
    .flatMap((subjectGroup) =>
      (subjectGroup?.sets ?? []).flatMap((setGroup) =>
        (setGroup?.dimensions ?? []).flatMap((dimension) =>
          (dimension?.standardsGroup ?? [])
            .map((standard) =>
              typeof standard?.codes === "string"
                ? standard.codes.trim()
                : ""
            )
            .filter(Boolean)
        )
      )
    );
  return Array.from(new Set(codes));
};

const getSubjectConnections = (unit: INewUnitSchema, targetSubject?: string) => {
  if (!Array.isArray(unit.TargetStandardsCodes)) {
    return [];
  }
  const subjects = unit.TargetStandardsCodes.map((standard) => {
    if (typeof standard?.subject === "string") {
      return standard.subject;
    }
    if (typeof standard?.set === "string") {
      return standard.set;
    }
    return null;
  }).filter((value): value is string => Boolean(value));

  return Array.from(new Set(subjects)).filter(
    (subject) => subject !== targetSubject
  );
};

const getCareerConnections = (unit: INewUnitSchema) => {
  const content = unit.Sections?.jobvizConnections?.Content;
  if (!Array.isArray(content)) {
    return [];
  }
  const careers = content
    .map((connection) => {
      const jobTitle = Array.isArray(connection?.job_title)
        ? connection?.job_title?.[0]
        : connection?.job_title;
      return typeof jobTitle === "string" ? jobTitle : null;
    })
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(careers));
};

const summarizeList = (items: string[], maxItems: number) => {
  if (!items.length) return null;
  if (items.length <= maxItems) return items.join(", ");
  return `${items.slice(0, maxItems).join(", ")} (+${items.length - maxItems})`;
};

const buildUnitPath = (unitId: string) => `/units/en-US/${unitId}`;

const getYoutubeId = (url?: string | null) => {
  if (!url) return null;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch?.[1]) return shortMatch[1];
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch?.[1]) return watchMatch[1];
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch?.[1]) return embedMatch[1];
  const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch?.[1]) return shortsMatch[1];
  return null;
};

const buildShareableMediaLink = (link?: string | null) => {
  if (!link) return "";
  try {
    const url = new URL(link, typeof window === "undefined" ? undefined : window.location.origin);
    const hostname = url.hostname.replace(/^www\./, "");
    if (hostname.includes("youtube") || hostname === "youtu.be") {
      const id = getYoutubeId(url.toString());
      const time = url.searchParams.get("t") || url.searchParams.get("start");
      if (id) {
        return `https://youtu.be/${id}${time ? `?t=${time}` : ""}`;
      }
    }
    if (hostname.includes("vimeo.com")) {
      const videoId =
        url.pathname.split("/video/")[1]?.split("/")[0] ??
        url.pathname.replace("/", "").split("/")[0];
      if (videoId) {
        return `https://vimeo.com/${videoId}`;
      }
    }
    url.searchParams.delete("autoplay");
    return url.toString();
  } catch (error) {
    return link;
  }
};

const getDriveThumbnail = (url?: string | null) => {
  if (!url || !url.includes("drive.google")) return null;
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const id = idMatch?.[1] ?? url.split("/").at(-2);
  return id ? `https://drive.google.com/thumbnail?id=${id}` : null;
};

const buildMediaItems = (
  unit: INewUnitSchema,
  fallbackThumbnail: string,
  unitTitle: string,
  unitId: string
): MediaItem[] => {
  const items = unit.FeaturedMultimedia ?? [];
  return items
    .filter((item) => item?.type === "video" || item?.type === "web-app")
    .map((item) => {
      const type = item.type === "web-app" ? "App" : "Video";
      const thumbnail =
        item.webAppPreviewImg ||
        getDriveThumbnail(item.mainLink) ||
        (type === "Video"
          ? (() => {
            const id = getYoutubeId(item.mainLink);
            return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
          })()
          : null) ||
        fallbackThumbnail;
      return {
        title: item.title ?? "Untitled media",
        type,
        thumbnail,
        link: item.mainLink ?? null,
        lessonRelevance: item.lessonRelevance ?? item.description ?? null,
        unitTitle,
        subtitle: unit.Subtitle ?? null,
        unitId,
      };
    });
};

export async function getStaticProps() {
  try {
    const ogImageCache = new Map<string, string | null>();
    const fetchOgImage = async (url?: string | null) => {
      if (!url || !/^https?:\/\//i.test(url)) {
        return null;
      }
      if (ogImageCache.has(url)) {
        return ogImageCache.get(url) ?? null;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (GP Teacher Portal)",
          },
        });
        if (!response.ok) {
          ogImageCache.set(url, null);
          return null;
        }
        const html = await response.text();
        const ogMatch = html.match(
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
        );
        const twitterMatch = html.match(
          /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
        );
        const imageUrl = ogMatch?.[1] || twitterMatch?.[1] || null;
        if (!imageUrl) {
          ogImageCache.set(url, null);
          return null;
        }
        const normalized =
          imageUrl.startsWith("http") || imageUrl.startsWith("//")
            ? imageUrl.startsWith("//")
              ? `https:${imageUrl}`
              : imageUrl
            : new URL(imageUrl, url).toString();
        ogImageCache.set(url, normalized);
        return normalized;
      } catch {
        ogImageCache.set(url, null);
        return null;
      } finally {
        clearTimeout(timeout);
      }
    };

    const userStats = await getFrontEndUserStats();
    const { data: retrievedUnits } = await retrieveUnits(
      {},
      createDbProjections(PROJECTED_UNITS_FIELDS),
      0,
      { ReleaseDate: -1 }
    );
    const units = retrievedUnits ?? [];
    for (const unit of units) {
      const unitMedia = (unit as { media?: any[] }).media;
      if (unitMedia?.length) {
        (unit as { media?: any[] }).media = await Promise.all(
          unitMedia.map(async (media) => {
            if (media.type === "App" && !media.thumbnail) {
              const ogImage = await fetchOgImage(media.link ?? null);
              return ogImage ? { ...media, thumbnail: ogImage } : media;
            }
            return media;
          })
        );
      }
      if (unit.FeaturedMultimedia?.length) {
        unit.FeaturedMultimedia = await Promise.all(
          unit.FeaturedMultimedia.map(async (item) => {
            if (item?.type === "web-app" && !item.webAppPreviewImg) {
              const ogImage = await fetchOgImage(item.mainLink ?? null);
              return ogImage ? { ...item, webAppPreviewImg: ogImage } : item;
            }
            return item;
          })
        );
      }
    }
    const blogPosts: BlogPost[] = [];
    try {
      const response = await fetch(
        "https://www.galacticpolymath.com/blog?format=json"
      );
      if (response.ok) {
        const payload = await response.json();
        const items = Array.isArray(payload?.items) ? payload.items : [];
        blogPosts.push(
          ...items.slice(0, 3).map((item: any, index: number) => {
            const title = item?.title ?? "Untitled post";
            const excerptSource =
              item?.excerpt ||
              item?.summary ||
              item?.body ||
              item?.content ||
              item?.description ||
              "";
            const plainExcerpt = toPlainText(excerptSource);
            const excerpt = (() => {
              if (!plainExcerpt) return "";
              const trimmed = plainExcerpt.trim();
              const maxLength = 240;
              const boundary = Math.min(trimmed.length, maxLength);
              const cutoff = trimmed.lastIndexOf(".", boundary);
              if (cutoff > 120) {
                return `${trimmed.slice(0, cutoff + 1)}`;
              }
              return trimmed.length > maxLength
                ? `${trimmed.slice(0, maxLength).trim()}...`
                : trimmed;
            })();
            const url = item?.fullUrl || item?.url || "https://www.galacticpolymath.com/blog";
            const dateLabel = formatBlogDate(
              item?.publishedOn || item?.publishOn || item?.date
            );
            const imageUrl =
              item?.assetUrl ||
              item?.thumbnailUrl ||
              item?.image ||
              item?.itemImage?.url ||
              null;
            const { categoryLabel, authorName } = formatBlogMeta(item);
            return {
              id: item?.id || item?.systemDataId || `${title}-${index}`,
              title,
              excerpt,
              url,
              dateLabel,
              imageUrl,
              categoryLabel,
              authorName,
            };
          })
        );
      }
    } catch (error) {
      console.warn("Failed to load GP blog posts.", error);
    }

    const liveUnits = getLiveUnits(retrievedUnits ?? []);
    const lessons = getUnitLessons(liveUnits);
    const allUnits = liveUnits.map((unit) => {
      const bannerUrl = getUnitBanner(unit);
      const targetSubject = unit.TargetSubject || "Science";
      const gistMarkdown = unit.Sections?.overview?.TheGist ?? "";
      const sponsorMarkdown = unit.SponsoredBy ?? "";
      const unitTags =
        unit.Sections?.overview?.UnitTags ??
        unit.Sections?.overview?.Tags?.map((tag) => tag?.Value).filter(Boolean) ??
        [];
      const targetStandards = getTargetStandards(unit);
      const connectedStandards = getConnectedStandards(unit);
      const unitId = `${unit.numID ?? unit._id ?? unit.Title}`;
      const unitTitle = unit.Title || "Untitled unit";
      return {
        id: unitId,
        title: unitTitle,
        subtitle:
          unit.Subtitle || "Interdisciplinary science for curious learners.",
        bannerUrl,
        subject: targetSubject,
        grades: getGradeLabel(unit),
        lessons: unit.LsnCount ?? null,
        isNew: isNewRelease(unit.ReleaseDate),
        gist: toPlainText(gistMarkdown),
        gistMarkdown,
        epaulette: unit.Sections?.overview?.SteamEpaulette ?? null,
        epauletteVert: unit.Sections?.overview?.SteamEpaulette_vert ?? null,
        targetStandards,
        connectedStandards,
        careerConnections: getCareerConnections(unit).slice(0, 4),
        sponsorText: toPlainText(sponsorMarkdown) || "Sponsored by partners.",
        sponsorMarkdown,
        sponsorLogo: getSponsorLogo(unit.SponsorLogo),
        media: buildMediaItems(unit, bannerUrl, unitTitle, unitId).slice(0, 4),
        targetSubject,
        subjectConnections: getSubjectConnections(unit, targetSubject),
        unitTags,
        releaseDate: unit.ReleaseDate ? String(unit.ReleaseDate) : null,
        locale: unit.locale ?? "en-US",
        jobvizConnections: unit.Sections?.jobvizConnections?.Content ?? null,
      };
    });
    const featuredUnits = allUnits.slice(0, 6);

    return {
      props: {
        featuredUnits: featuredUnits.length ? featuredUnits : fallbackUnits,
        allUnits: allUnits.length ? allUnits : fallbackUnits,
        lessons,
        userStats,
        blogPosts,
      },
      revalidate: 86_400,
    };
  } catch (error) {
    console.error("Teacher portal homepage failed to load units.", error);
    return {
      props: {
        featuredUnits: fallbackUnits,
        allUnits: fallbackUnits,
        lessons: [],
        userStats: {
          totalUsers: 0,
          totalStudents: 0,
          usStates: 0,
          otherCountries: 0,
          highlightedCountries: [],
        },
        blogPosts: [],
      },
      revalidate: 86_400,
    };
  }
}

export default function HomePage({
  featuredUnits,
  allUnits,
  lessons = [],
  userStats,
  blogPosts,
  initialTab,
}: HomePageProps) {
  const router = useRouter();
  const { user, status, isGpPlusMember } = useSiteSession();
  const userId = user?.userId ?? null;
  const [activeModal, setActiveModal] = useState<"wizard" | "media" | null>(
    null
  );
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const [showStatsDebug, setShowStatsDebug] = useState(false);
  const [jobTourAccessResource, setJobTourAccessResource] =
    useState<PreviewResource | null>(null);
  const [isCopyingStudentLink, setIsCopyingStudentLink] = useState(false);
  const isSearchRoute = router.pathname === "/search";
  const [carouselIndex, setCarouselIndex] = useState(0);
  const statsSectionRef = useRef<HTMLElement | null>(null);
  const statsAnimationStarted = useRef(false);
  const [animatedStats, setAnimatedStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    usStates: 0,
    otherCountries: 0,
    totalCountries: 0,
  });
  const animatedStatsRef = useRef(animatedStats);
  const [statsVisibility, setStatsVisibility] = useState({
    showCountries: false,
    showStates: false,
    showMap: false,
  });
  const newUnits = featuredUnits.filter((unit) => unit.isNew);
  const spotlightUnits = newUnits.length ? newUnits : featuredUnits.slice(0, 3);
  const displayedBlogPosts = blogPosts.length ? blogPosts : fallbackBlogPosts;
  const [jobTourRecords, setJobTourRecords] = useState<JobTourRecord[]>([]);
  const [jobTourLoading, setJobTourLoading] = useState(false);
  const [jobTourError, setJobTourError] = useState<string | null>(null);
  const [showOnlyMyContent, setShowOnlyMyContent] = useState(false);
  const [tourScope, setTourScope] = useState<"" | "unit" | "community">("");
  const handleTabClick = (tab: NavTab) => {
    const nextTypes =
      tab === "Units"
        ? ["Unit"]
        : tab === "Apps"
          ? ["App"]
          : tab === "Videos"
            ? ["Video"]
            : tab === "Lessons"
              ? ["Lesson"]
              : tab === "JobViz"
                ? ["Job Tour"]
                : [...CONTENT_TYPES];
    setSelectedContentTypes(nextTypes);
    setShowOnlyMyContent(false);
    router.push({ pathname: "/search", query: buildRootQueryForTab(tab) });
  };
  const handleHomeClick = () => {
    setSearchQuery("");
    setSearchInputValue("");
    setSelectedContentTypes([...CONTENT_TYPES]);
    setSelectedTargetSubjects([]);
    setSelectedAlignedSubjects([]);
    setSelectedGradeBands([]);
    setSelectedTags([]);
    setSelectedLocales([]);
    setShowOnlyMyContent(false);
    setTourScope("");
    router.push("/");
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedTargetSubjects, setSelectedTargetSubjects] = useState<string[]>(
    []
  );
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(
    []
  );
  const [selectedAlignedSubjects, setSelectedAlignedSubjects] = useState<string[]>(
    []
  );
  const [selectedGradeBands, setSelectedGradeBands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [resultsView, setResultsView] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"relevant" | "newest" | "oldest">(
    "relevant"
  );
  const [animateResults, setAnimateResults] = useState(false);
  const [resultsTransitioning, setResultsTransitioning] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isSearchTransitioning, setIsSearchTransitioning] = useState(false);
  const animateTimeoutRef = useRef<number | null>(null);
  const previousResultsSignatureRef = useRef<string | null>(null);
  const hasSeenInitialResultsRef = useRef(false);

  const triggerResultsAnimation = useCallback(() => {
    if (animateTimeoutRef.current) {
      window.clearTimeout(animateTimeoutRef.current);
    }
    setAnimateResults(true);
    animateTimeoutRef.current = window.setTimeout(() => {
      setAnimateResults(false);
    }, 700);
  }, []);

  const transitionResultsView = useCallback(
    (nextView: "grid" | "list") => {
      if (nextView === resultsView) return;
      setResultsTransitioning(true);
      setResultsView(nextView);
      if (typeof window === "undefined") {
        triggerResultsAnimation();
        setResultsTransitioning(false);
        return;
      }
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          triggerResultsAnimation();
          setResultsTransitioning(false);
        });
      });
    },
    [resultsView, triggerResultsAnimation]
  );

  const highlightText = useCallback((text: string, queryValue: string) => {
    const source = text ?? "";
    const query = queryValue.trim();
    if (!query) return source;
    const tokens = tokenizeSearch(query).filter((token) => token.length >= 2);
    if (!tokens.length) return source;
    const escaped = tokens
      .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    if (!escaped) return source;
    const regex = new RegExp(`(${escaped})`, "ig");
    const parts = source.split(regex);
    return parts.map((part, index) =>
      tokens.some((token) => token.toLowerCase() === part.toLowerCase()) ? (
        <mark key={`${part}-${index}`} className={styles.searchHighlight}>
          {part}
        </mark>
      ) : (
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      )
    );
  }, []);

  const summarizeCategoryValues = useCallback((values: string[], limit = 3) => {
    if (!values.length) return [];
    if (values.length <= limit) return values;
    return [...values.slice(0, limit), `+${values.length - limit} more`];
  }, []);

  const handleHomeSearchSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const nextQuery = searchInputValue.trim();
      setSelectedContentTypes([...CONTENT_TYPES]);
      setSearchQuery(nextQuery);
      setSearchInputValue(nextQuery);
      setIsSearchTransitioning(true);
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 160));
        await router.push({
          pathname: "/search",
          query: buildQueryObject({
            q: nextQuery || undefined,
          }),
        });
      } finally {
        setIsSearchTransitioning(false);
      }
    },
    [router, searchInputValue]
  );

  const handleRemoveChip = (chip: string) => {
    if (selectedTargetSubjects.includes(chip)) {
      setSelectedTargetSubjects((prev) => prev.filter((item) => item !== chip));
      return;
    }
    if (selectedAlignedSubjects.includes(chip)) {
      setSelectedAlignedSubjects((prev) => prev.filter((item) => item !== chip));
      return;
    }
    if (selectedGradeBands.includes(chip)) {
      setSelectedGradeBands((prev) => prev.filter((item) => item !== chip));
      return;
    }
    if (selectedTags.includes(chip)) {
      setSelectedTags((prev) => prev.filter((item) => item !== chip));
      return;
    }
    if (selectedLocales.includes(chip)) {
      setSelectedLocales((prev) => prev.filter((item) => item !== chip));
      return;
    }
    if (chip === "My JobViz Tours") {
      setShowOnlyMyContent(false);
    }
  };
  const [queryHydrated, setQueryHydrated] = useState(false);
  const handleOpenWizard = () => setActiveModal("wizard");
  const handleCloseModal = () => {
    setActiveModal(null);
    setActiveMedia(null);
  };
  const handleCloseJobTourAccessModal = () => {
    setJobTourAccessResource(null);
    setIsCopyingStudentLink(false);
  };
  const handleOpenJobTourAccessModal = (resource: PreviewResource) => {
    setJobTourAccessResource(resource);
  };
  const hasGpPlusAccess =
    status === "authenticated" &&
    isGpPlusMember === true;
  const openStudentTour = useCallback(
    (tourId: string, preview = false) => {
      if (typeof window === "undefined") return;
      const fullUrl = buildStudentTourUrl(tourId, {
        host: window.location.host,
        protocol: window.location.protocol,
        preview,
      });
      window.location.assign(fullUrl);
    },
    []
  );
  const handleOpenTourPreview = useCallback(() => {
    if (!jobTourAccessResource?.tourId) return;
    openStudentTour(jobTourAccessResource.tourId, true);
    handleCloseJobTourAccessModal();
  }, [jobTourAccessResource?.tourId, openStudentTour]);
  const handleOpenTourTeacherMode = useCallback(() => {
    if (!jobTourAccessResource?.tourId) return;
    router.push(`/jobviz?tourId=${encodeURIComponent(jobTourAccessResource.tourId)}&edit=1`);
    handleCloseJobTourAccessModal();
  }, [jobTourAccessResource?.tourId, router]);
  const handleOpenTourStudentMode = useCallback(() => {
    if (!jobTourAccessResource?.tourId) return;
    openStudentTour(jobTourAccessResource.tourId, false);
    handleCloseJobTourAccessModal();
  }, [jobTourAccessResource?.tourId, openStudentTour]);
  const handleCopyTourStudentLink = useCallback(async () => {
    if (!jobTourAccessResource?.tourId || typeof window === "undefined") return;
    setIsCopyingStudentLink(true);
    const shareUrl = buildStudentTourUrl(jobTourAccessResource.tourId, {
      host: window.location.host,
      protocol: window.location.protocol,
      preview: false,
    });
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Student link copied");
    } catch {
      toast.error("Unable to copy student link");
    } finally {
      setIsCopyingStudentLink(false);
    }
  }, [jobTourAccessResource?.tourId]);
  const handleOpenMedia = (media: MediaItem) => {
    setActiveMedia(media);
    setActiveModal("media");
  };

  const allResources = useMemo<PreviewResource[]>(() => {
    const fallbackImage = "/imgs/classroomImages/homeCarousel/1-IMG_9600-EDIT (1).jpg";
    const getAccent = (subject: string | undefined) => {
      if (!subject) {
        return "#2c83c3";
      }
      const normalized = subject.toLowerCase();
      if (normalized.includes("earth") || normalized.includes("climate")) {
        return "#6812d1";
      }
      if (normalized.includes("life") || normalized.includes("bio")) {
        return "#6c2d82";
      }
      if (normalized.includes("engineering")) {
        return "#1826bc";
      }
      return "#2c83c3";
    };

    const resources: PreviewResource[] = [];
    const unitByTitle = new Map(allUnits.map((unit) => [unit.title, unit]));
    const unitById = new Map(allUnits.map((unit) => [unit.id, unit]));

    allUnits.forEach((unit) => {
      const tags = (unit.unitTags ?? []).filter(Boolean).slice(0, 6);
      const gradeBand = unit.grades;
      const gradeBandGroup = getGradeBandGroup(gradeBand);
      const unitFeaturedMedia = (unit.media ?? []).map((item) => item.title);

      resources.push({
        id: unit.id,
        unitId: unit.id,
        unitTitle: unit.title,
        unitSubtitle: unit.subtitle,
        title: unit.title,
        description:
          unit.subtitle || unit.gist || "Explore this interdisciplinary unit.",
        type: "Unit",
        image: unit.bannerUrl || fallbackImage,
        subject: unit.targetSubject || unit.subject,
        alignedSubjects: unit.subjectConnections,
        gradeBandGroup,
        gradeBand: unit.grades,
        timeLabel: unit.lessons ? `${unit.lessons} lessons` : "Lessons",
        tags: tags.length ? tags : ["Standards-aligned", "Interdisciplinary"],
        locale: unit.locale ?? "en-US",
        releaseDate: unit.releaseDate ?? null,
        isNew: unit.isNew,
        isPlus: false,
        accent: getAccent(unit.targetSubject || unit.subject),
        icon: FiBookOpen,
        searchTargetStandards: unit.targetStandards ?? [],
        searchConnectedStandards: unit.connectedStandards ?? [],
        searchCareerConnections: unit.careerConnections ?? [],
        searchGist: unit.gist ?? "",
        searchFeaturedMedia: unitFeaturedMedia,
        searchLessonDetails: [],
      });

      unit.media?.forEach((media, index) => {
        resources.push({
          id: `${unit.id}-${media.type}-${index}`,
          unitId: unit.id,
          unitTitle: unit.title,
          unitSubtitle: unit.subtitle,
          title: media.title,
          description: `From ${unit.title}`,
          type: media.type,
          image: media.thumbnail || unit.bannerUrl || fallbackImage,
          subject: unit.targetSubject || unit.subject,
          alignedSubjects: unit.subjectConnections,
          gradeBandGroup,
          gradeBand: unit.grades,
          timeLabel: media.type === "Video" ? "Video" : "App",
          tags: tags.length ? tags : ["Interactive", "Student-led"],
          locale: unit.locale ?? "en-US",
          mediaLink: media.link ?? null,
          mediaLessonRelevance: media.lessonRelevance ?? null,
          releaseDate: unit.releaseDate ?? null,
          isNew: unit.isNew,
          isPlus: false,
          accent: getAccent(unit.targetSubject || unit.subject),
          icon: media.type === "Video" ? FiPlayCircle : AppWindow,
          searchTargetStandards: unit.targetStandards ?? [],
          searchConnectedStandards: unit.connectedStandards ?? [],
          searchCareerConnections: unit.careerConnections ?? [],
          searchGist: unit.gist ?? "",
          searchFeaturedMedia: unitFeaturedMedia,
          searchLessonDetails: [],
        });
      });
    });

    const jobvizGradeBand = "Grades 6-12";
    resources.push({
      id: "jobviz-app",
      title: "JobViz Career Explorer",
      description: "Explore 800+ careers and connect classroom learning to real-world jobs.",
      type: "App",
      image: "/imgs/jobViz/jobviz_rocket_logo_color.svg",
      subject: "Careers",
      alignedSubjects: [],
      gradeBandGroup: getGradeBandGroup(jobvizGradeBand),
      gradeBand: jobvizGradeBand,
      timeLabel: "App",
      tags: ["Careers", "Exploration", "Interactive"],
      locale: "en-US",
      mediaLink: "/jobviz",
      releaseDate: null,
      isNew: false,
      isPlus: false,
      accent: getAccent("careers"),
      icon: AppWindow,
      searchTargetStandards: [],
      searchConnectedStandards: [],
      searchCareerConnections: [],
      searchTourStops: [],
      searchGist: "",
      searchFeaturedMedia: [],
      searchLessonDetails: [],
    });

    const unitTourResources = allUnits
      .map((unit) => {
        const connections = normalizeJobVizConnections(unit.jobvizConnections);
        if (!connections.length) return null;
        const selectedJobs = connections.map((item) => item.soc_code);
        const tourStopSearchTerms = getTourStopSearchTerms(selectedJobs);
        const tourTitle = `${unit.title} JobViz Tour`;
        return {
          id: `job-tour-unit-${unit.id}`,
          title: tourTitle,
          description: `From ${unit.title}`,
          type: "Job Tour" as const,
          image: unit.bannerUrl || "/imgs/jobViz/jobviz_icon.png",
          subject: unit.targetSubject || unit.subject,
          alignedSubjects: unit.subjectConnections ?? [],
          gradeBandGroup: getGradeBandGroup(unit.grades),
          gradeBand: unit.grades,
          timeLabel: `${selectedJobs.length} jobs`,
          tags: (unit.unitTags ?? []).slice(0, 4).concat("JobViz Tour"),
          locale: unit.locale ?? "en-US",
          releaseDate: unit.releaseDate ?? null,
          isNew: false,
          isPlus: true,
          accent: getAccent("careers"),
          icon: JobTourIcon,
          ownerId: null,
          ownerName: "GP Team",
          tourSource: "unit",
          tourId: null,
          tourAssignment: DEFAULT_JOB_TOUR_ASSIGNMENT,
          tourExplanation: null,
          tourVisibility: "everyone",
          tourIsGp: true,
          tourUnitId: unit.id,
          tourUnitTitle: unit.title,
          selectedJobs,
          searchTargetStandards: unit.targetStandards ?? [],
          searchConnectedStandards: unit.connectedStandards ?? [],
          searchCareerConnections: Array.from(
            new Set([...(unit.careerConnections ?? []), ...tourStopSearchTerms])
          ),
          searchTourStops: tourStopSearchTerms,
          searchGist: unit.gist ?? "",
          searchFeaturedMedia: (unit.media ?? []).map((item) => item.title),
          searchLessonDetails: [],
        };
      })
      .filter(Boolean) as PreviewResource[];

    resources.push(...unitTourResources);

    const userTourResources: PreviewResource[] = jobTourRecords.map((tour) => {
      const gradeBands = getTourGradeBands(tour.gradeLevel);
      const associatedUnit = tour.gpUnitsAssociated?.length
        ? unitById.get(tour.gpUnitsAssociated[0]) ?? null
        : null;
      const gpUnitTitle = associatedUnit?.title ?? null;
      const tourStopSearchTerms = getTourStopSearchTerms(tour.selectedJobs ?? []);
      return {
        id: tour._id,
        title: tour.heading,
        description: tour.explanation || "Teacher-built JobViz tour.",
        type: "Job Tour" as const,
        image: "/imgs/jobViz/jobviz_icon.png",
        subject: tour.classSubject,
        alignedSubjects: [],
        gradeBandGroup: gradeBands.gradeBandGroup,
        gradeBand: gradeBands.gradeBand,
        timeLabel: `${tour.selectedJobs?.length ?? 0} jobs`,
        tags: tour.tags ?? [],
        locale: "en-US",
        releaseDate: tour.publishedDate ?? tour.lastEdited ?? null,
        isNew: false,
        isPlus: true,
        accent: getAccent("careers"),
        icon: JobTourIcon,
        ownerId: tour.userId ? String(tour.userId) : null,
        ownerName: tour.ownerName ?? null,
        tourSource: "user",
        tourId: tour._id,
        tourAssignment: tour.assignment ?? DEFAULT_JOB_TOUR_ASSIGNMENT,
        tourExplanation: tour.explanation ?? null,
        tourVisibility: tour.whoCanSee,
        tourIsGp: tour.isGP,
        tourUnitId: tour.gpUnitsAssociated?.[0] ?? null,
        tourUnitTitle: gpUnitTitle,
        selectedJobs: tour.selectedJobs ?? [],
        searchTargetStandards: associatedUnit?.targetStandards ?? [],
        searchConnectedStandards: associatedUnit?.connectedStandards ?? [],
        searchCareerConnections: Array.from(
          new Set([...(associatedUnit?.careerConnections ?? []), ...tourStopSearchTerms])
        ),
        searchTourStops: tourStopSearchTerms,
        searchGist: associatedUnit?.gist ?? "",
        searchFeaturedMedia:
          associatedUnit ? (associatedUnit.media ?? []).map((item) => item.title) : [],
        searchLessonDetails: [],
      };
    });

    resources.push(...userTourResources);

    lessons.forEach((lesson, index) => {
      const unit = unitByTitle.get(lesson.unitTitle || "") ?? null;
      const gradeLabel =
        lesson.grades || lesson.gradesOrYears || unit?.grades || "Grades 6-12";
      const gradeBandGroup = getGradeBandGroup(gradeLabel);
      const alignedSubjects = unit?.subjectConnections ?? [];
      const tags =
        lesson.tags && lesson.tags.length
          ? lesson.tags
          : unit?.unitTags ?? [];

      resources.push({
        id: `lesson-${lesson.lessonPartNum ?? index}`,
        unitId: unit?.id ?? undefined,
        title: lesson.lessonPartTitle || "Lesson",
        description: lesson.preface || `Lesson from ${lesson.unitTitle ?? "GP"}`,
        type: "Lesson",
        image:
          lesson.tile ||
          unit?.bannerUrl ||
          "/imgs/gp-logos/GP_Stacked_logo+wordmark_gradient_whiteBG.jpg",
        subject: lesson.subject || unit?.targetSubject,
        alignedSubjects,
        gradeBandGroup,
        gradeBand: gradeLabel,
        timeLabel: lesson.dur ? `${lesson.dur} min` : "Lesson",
        tags: tags && tags.length ? tags.slice(0, 6) : ["Lesson"],
        locale: unit?.locale ?? "en-US",
        releaseDate: unit?.releaseDate ?? null,
        isNew: false,
        isPlus: false,
        accent: getAccent(unit?.targetSubject || unit?.subject),
        icon: FiBookOpen,
        searchTargetStandards: unit?.targetStandards ?? [],
        searchConnectedStandards: unit?.connectedStandards ?? [],
        searchCareerConnections: unit?.careerConnections ?? [],
        searchGist: unit?.gist ?? "",
        searchFeaturedMedia: (unit?.media ?? []).map((item) => item.title),
        searchLessonDetails: [
          lesson.lessonPartPath ?? "",
          lesson.unitTitle ?? "",
          lesson.status ?? "",
          lesson.sortByDate ?? "",
          lesson.lessonPartNum ? `Part ${lesson.lessonPartNum}` : "",
          lesson.dur ? `${lesson.dur} minutes` : "",
        ].filter(Boolean),
      });
    });

    return resources;
  }, [allUnits, jobTourRecords, lessons]);

  const targetSubjectOptions = useMemo(() => {
    const subjects = new Set<string>();
    const includeJobTourSubjects =
      selectedContentTypes.length === 1 &&
      selectedContentTypes[0] === "Job Tour";
    allResources.forEach((resource) => {
      if (resource.type === "Job Tour" && !includeJobTourSubjects) {
        return;
      }
      if (resource.subject) {
        subjects.add(resource.subject);
      }
    });
    return Array.from(subjects).sort((a, b) => a.localeCompare(b));
  }, [allResources, selectedContentTypes]);

  const alignedSubjectOptions = useMemo(() => {
    const subjects = new Set<string>();
    allResources.forEach((resource) => {
      resource.alignedSubjects.forEach((subject) => subjects.add(subject));
    });
    return Array.from(subjects).sort((a, b) => a.localeCompare(b));
  }, [allResources]);

  const gradeBandOptions = useMemo(
    () => ["Upper Elementary", "Middle School", "High School", "College"],
    []
  );

  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>();
    allResources.forEach((resource) => {
      resource.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [allResources]);

  const tagCloudRange = useMemo(() => {
    if (!tagOptions.length) {
      return { min: 0, max: 0 };
    }
    const counts = tagOptions.map((item) => item.count);
    return {
      min: Math.min(...counts),
      max: Math.max(...counts),
    };
  }, [tagOptions]);

  const displayedTagOptions = useMemo(() => {
    const topByCount = tagOptions.slice(0, 10);
    const sortAlpha = (list: typeof tagOptions) =>
      [...list].sort((a, b) => a.tag.localeCompare(b.tag));
    return showAllTags ? sortAlpha(tagOptions) : sortAlpha(topByCount);
  }, [showAllTags, tagOptions]);

  const localeOptions = useMemo(() => {
    const locales = new Set<string>();
    allResources.forEach((resource) => {
      locales.add(resource.locale);
    });
    return Array.from(locales).sort((a, b) => a.localeCompare(b));
  }, [allResources]);

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const normalizeSearchValue = (value: string) =>
    value.toLowerCase().replace(/\s+/g, "");

  const tokenizeSearch = (value: string) =>
    value
      .toLowerCase()
      .split(/[\s,;|/]+/)
      .map((token) => token.trim())
      .filter(Boolean);

  const fuzzyTokenMatch = (token: string, text: string) => {
    const normalizedText = text.toLowerCase();
    if (!token || !normalizedText) return false;

    if (token.length <= 2) {
      const boundaryRegex = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      return boundaryRegex.test(normalizedText);
    }

    if (normalizedText.includes(token)) return true;
    const compactToken = normalizeSearchValue(token);
    const compactText = normalizeSearchValue(normalizedText);
    return compactToken.length >= 4 && compactText.includes(compactToken);
  };

  const getMatchedValues = (tokens: string[], values: string[]) => {
    if (!tokens.length || !values.length) return [];
    return values.filter((value) =>
      tokens.some((token) => fuzzyTokenMatch(token, value))
    );
  };

  const getSnippet = (text: string, query: string) => {
    if (!text || !query) return "";
    const loweredText = text.toLowerCase();
    const loweredQuery = query.toLowerCase();
    const hitIndex = loweredText.indexOf(loweredQuery);
    if (hitIndex < 0) {
      const firstToken = tokenizeSearch(query)[0] ?? "";
      const tokenIndex = firstToken ? loweredText.indexOf(firstToken) : -1;
      if (tokenIndex < 0) {
        return text.length > 90 ? `${text.slice(0, 90).trim()}...` : text;
      }
      const startFromToken = Math.max(tokenIndex - 28, 0);
      const endFromToken = Math.min(tokenIndex + firstToken.length + 36, text.length);
      const prefixFromToken = startFromToken > 0 ? "..." : "";
      const suffixFromToken = endFromToken < text.length ? "..." : "";
      return `${prefixFromToken}${text.slice(startFromToken, endFromToken).trim()}${suffixFromToken}`;
    }
    const start = Math.max(hitIndex - 28, 0);
    const end = Math.min(hitIndex + loweredQuery.length + 36, text.length);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < text.length ? "..." : "";
    return `${prefix}${text.slice(start, end).trim()}${suffix}`;
  };

  const buildSearchMatchResult = (
    resource: PreviewResource,
    queryValue: string
  ): ResourceSearchMatchResult => {
    const query = queryValue.trim().toLowerCase();
    if (!query) {
      return { queryMatches: true, hiddenCategories: [], relevanceScore: 0 };
    }

    const tokens = tokenizeSearch(query);
    const visibleFields = [
      resource.title,
      resource.description,
      resource.subject,
      resource.gradeBand,
      resource.tags.join(" "),
    ]
      .filter(Boolean)
      .join(" ");

    const hiddenCategories: ResourceSearchMatchCategory[] = [];
    const titleText = (resource.title ?? "").toString();
    const descriptionText = (resource.description ?? "").toString();
    const subjectText = (resource.subject ?? "").toString();
    const gradeBandText = (resource.gradeBand ?? "").toString();
    const tagsText = resource.tags.join(" ");
    const tourStopTerms = resource.searchTourStops ?? [];
    const targetStandardsMatches = getMatchedValues(
      tokens,
      resource.searchTargetStandards ?? []
    );
    if (targetStandardsMatches.length) {
      hiddenCategories.push({
        label: "Target standards",
        values: targetStandardsMatches,
      });
    }

    const connectedStandardsMatches = getMatchedValues(
      tokens,
      resource.searchConnectedStandards ?? []
    );
    if (connectedStandardsMatches.length) {
      hiddenCategories.push({
        label: "Connected standards",
        values: connectedStandardsMatches,
      });
    }

    const jobsMatches = getMatchedValues(tokens, resource.searchCareerConnections ?? []);
    if (jobsMatches.length) {
      hiddenCategories.push({
        label: "Featured jobs",
        values: jobsMatches,
      });
    }

    const mediaMatches = getMatchedValues(tokens, resource.searchFeaturedMedia ?? []);
    if (mediaMatches.length) {
      hiddenCategories.push({
        label: "Featured media",
        values: mediaMatches,
      });
    }

    const lessonDetailsMatches = getMatchedValues(
      tokens,
      resource.searchLessonDetails ?? []
    );
    if (lessonDetailsMatches.length) {
      hiddenCategories.push({
        label: "Lesson details",
        values: lessonDetailsMatches,
      });
    }

    const gistText = resource.searchGist ?? "";
    const gistMatched = tokens.some((token) => fuzzyTokenMatch(token, gistText));
    if (gistMatched) {
      const snippet = getSnippet(gistText, query);
      hiddenCategories.push({
        label: "Gist",
        values: snippet ? [snippet] : [gistText],
      });
    }

    const searchableFields = [
      visibleFields,
      ...tourStopTerms,
      ...(resource.searchTargetStandards ?? []),
      ...(resource.searchConnectedStandards ?? []),
      ...(resource.searchCareerConnections ?? []),
      ...(resource.searchFeaturedMedia ?? []),
      ...(resource.searchLessonDetails ?? []),
      gistText,
    ].filter(Boolean);
    const tokenCoverage = tokens.every((token) =>
      searchableFields.some((field) => fuzzyTokenMatch(token, field))
    );
    let relevanceScore = 0;
    tokens.forEach((token) => {
      if (resource.type === "Job Tour" && tourStopTerms.some((value) => fuzzyTokenMatch(token, value))) {
        relevanceScore += 140;
      }
      if (fuzzyTokenMatch(token, titleText)) {
        relevanceScore += 100;
      }
      if (fuzzyTokenMatch(token, descriptionText)) {
        relevanceScore += 30;
      }
      if (fuzzyTokenMatch(token, subjectText) || fuzzyTokenMatch(token, gradeBandText)) {
        relevanceScore += 20;
      }
      if (fuzzyTokenMatch(token, tagsText)) {
        relevanceScore += 16;
      }
      if ((resource.searchCareerConnections ?? []).some((value) => fuzzyTokenMatch(token, value))) {
        relevanceScore += 12;
      }
      if ((resource.searchTargetStandards ?? []).some((value) => fuzzyTokenMatch(token, value))) {
        relevanceScore += 9;
      }
      if ((resource.searchConnectedStandards ?? []).some((value) => fuzzyTokenMatch(token, value))) {
        relevanceScore += 7;
      }
      if ((resource.searchFeaturedMedia ?? []).some((value) => fuzzyTokenMatch(token, value))) {
        relevanceScore += 5;
      }
      if ((resource.searchLessonDetails ?? []).some((value) => fuzzyTokenMatch(token, value))) {
        relevanceScore += 4;
      }
      if (fuzzyTokenMatch(token, gistText)) {
        relevanceScore += 3;
      }
    });
    return {
      queryMatches: tokenCoverage,
      hiddenCategories,
      relevanceScore,
    };
  };

  const searchMatchByResourceId = useMemo(() => {
    const map = new Map<string, ResourceSearchMatchResult>();
    allResources.forEach((resource) => {
      map.set(resource.id, buildSearchMatchResult(resource, searchQuery));
    });
    return map;
  }, [allResources, searchQuery]);

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allResources.filter((resource) => {
      if (
        selectedContentTypes.length &&
        selectedContentTypes.length < CONTENT_TYPES.length &&
        !selectedContentTypes.includes(resource.type)
      ) {
        return false;
      }
      if (showOnlyMyContent) {
        if (!userId || resource.ownerId !== userId) {
          return false;
        }
      }
      if (resource.type === "Job Tour" && tourScope) {
        if (tourScope === "unit" && resource.tourSource !== "unit") {
          return false;
        }
        if (
          tourScope === "community" &&
          (resource.tourSource !== "user" || resource.tourVisibility !== "everyone")
        ) {
          return false;
        }
      }
      if (
        selectedTargetSubjects.length &&
        (!resource.subject || !selectedTargetSubjects.includes(resource.subject))
      ) {
        return false;
      }
      if (
        selectedAlignedSubjects.length &&
        !selectedAlignedSubjects.some((subject) =>
          resource.alignedSubjects.includes(subject)
        )
      ) {
        return false;
      }
      if (
        selectedGradeBands.length &&
        resource.gradeBandGroup !== "All" &&
        !selectedGradeBands.includes(resource.gradeBandGroup)
      ) {
        return false;
      }
      if (
        selectedTags.length &&
        !selectedTags.some((tag) => resource.tags.includes(tag))
      ) {
        return false;
      }
      if (selectedLocales.length && !selectedLocales.includes(resource.locale)) {
        return false;
      }
      if (!query) {
        return true;
      }
      return searchMatchByResourceId.get(resource.id)?.queryMatches ?? false;
    });
  }, [
    allResources,
    searchQuery,
    selectedContentTypes,
    selectedTargetSubjects,
    selectedAlignedSubjects,
    selectedGradeBands,
    selectedTags,
    selectedLocales,
    searchMatchByResourceId,
    showOnlyMyContent,
    tourScope,
    userId,
  ]);

  const contentTypeFilterActive =
    selectedContentTypes.length > 0 &&
    selectedContentTypes.length < CONTENT_TYPES.length;
  const hasActiveFilters =
    contentTypeFilterActive ||
    selectedTargetSubjects.length > 0 ||
    selectedAlignedSubjects.length > 0 ||
    selectedGradeBands.length > 0 ||
    selectedTags.length > 0 ||
    selectedLocales.length > 0 ||
    showOnlyMyContent ||
    Boolean(tourScope) ||
    searchQuery.trim().length > 0;

  const sortedResources = useMemo(() => {
    if (sortOrder === "relevant") {
      if (searchQuery.trim()) {
        return [...filteredResources].sort((a, b) => {
          const aScore = searchMatchByResourceId.get(a.id)?.relevanceScore ?? 0;
          const bScore = searchMatchByResourceId.get(b.id)?.relevanceScore ?? 0;
          if (bScore !== aScore) {
            return bScore - aScore;
          }
          const aTime = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const bTime = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return bTime - aTime;
        });
      }
      if (!hasActiveFilters) {
        const pinnedIndex = filteredResources.findIndex(
          (resource) => resource.id === "jobviz-app"
        );
        if (pinnedIndex > 0) {
          const reordered = [...filteredResources];
          const [pinned] = reordered.splice(pinnedIndex, 1);
          reordered.unshift(pinned);
          return reordered;
        }
      }
      return filteredResources;
    }
    const sorted = [...filteredResources].sort((a, b) => {
      const aTime = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const bTime = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [filteredResources, hasActiveFilters, searchMatchByResourceId, searchQuery, sortOrder]);

  const totalResources = allResources.length;
  const totalJobTours = allResources.filter(
    (resource) => resource.type === "Job Tour"
  ).length;
  const hasActiveFilterChips =
    contentTypeFilterActive ||
    selectedTargetSubjects.length > 0 ||
    selectedAlignedSubjects.length > 0 ||
    selectedGradeBands.length > 0 ||
    selectedTags.length > 0 ||
    selectedLocales.length > 0 ||
    showOnlyMyContent ||
    Boolean(tourScope);
  const hasQueryFilters =
    searchQuery.trim().length > 0 ||
    contentTypeFilterActive ||
    selectedTargetSubjects.length > 0 ||
    selectedAlignedSubjects.length > 0 ||
    selectedGradeBands.length > 0 ||
    selectedTags.length > 0 ||
    selectedLocales.length > 0 ||
    showOnlyMyContent ||
    Boolean(tourScope);
  const isHomeView =
    !isSearchRoute && !hasQueryFilters && initialTab !== "All";
  const hasCommittedSearch = searchQuery.trim().length > 0;
  const isAllView = !isHomeView;
  const deferResults = isSearchRoute && !queryHydrated;
  const resultsCount = sortedResources.length;
  const resultsSignature = useMemo(
    () => sortedResources.map((resource) => resource.id).join("|"),
    [sortedResources]
  );
  const totalUnits = allUnits.length;
  const totalVideos = allUnits.reduce(
    (count, unit) => count + (unit.media?.filter((item) => item.type === "Video").length ?? 0),
    0
  );
  const totalApps = allUnits.reduce(
    (count, unit) => count + (unit.media?.filter((item) => item.type === "App").length ?? 0),
    0
  );
  const totalLessons = lessons.length;
  const resolvedTab =
    contentTypeFilterActive && selectedContentTypes.length === 1
      ? selectedContentTypes[0] === "Unit"
        ? "Units"
        : selectedContentTypes[0] === "App"
          ? "Apps"
          : selectedContentTypes[0] === "Video"
            ? "Videos"
            : selectedContentTypes[0] === "Lesson"
              ? "Lessons"
              : selectedContentTypes[0] === "Job Tour"
                ? "JobViz"
                : "All"
      : "All";
  const allHeroTitle = (() => {
    if (resolvedTab === "Units") return `Explore ${totalUnits} Units`;
    if (resolvedTab === "Apps") return `Explore ${totalApps} Apps`;
    if (resolvedTab === "Videos") return `Explore ${totalVideos} Videos`;
    if (resolvedTab === "Lessons") return `Explore ${totalLessons} Lessons`;
    if (resolvedTab === "JobViz") return `Explore ${totalJobTours} JobViz Tours`;
    return `Explore ${totalResources} Resources`;
  })();
  const pageTitle = isHomeView
    ? "Home | GP Portal"
    : hasCommittedSearch
      ? `Search: ${searchQuery.trim().slice(0, 40)} | GP Portal`
      : resolvedTab === "All"
        ? "All Resources | GP Portal"
        : `${resolvedTab} | GP Portal`;
  const pageDescription = isHomeView
    ? "Discover free interdisciplinary lessons, classroom-ready resources, and JobViz career tools for grades 5+."
    : "Browse Galactic Polymath resources by subject, grade level, and format to quickly find the best classroom fit.";
  const canonicalUrl = ensureAbsoluteUrl("/");
  const socialPreviewImage = ensureAbsoluteUrl(
    "/imgs/home/banners/new-gp-splosion-homepage-hero_gp-homepage-hero_desktop.png"
  );

  useEffect(() => {
    if (!isAllView || deferResults) return;
    if (!hasSeenInitialResultsRef.current) {
      hasSeenInitialResultsRef.current = true;
      previousResultsSignatureRef.current = resultsSignature;
      return;
    }
    if (previousResultsSignatureRef.current === resultsSignature) {
      return;
    }
    previousResultsSignatureRef.current = resultsSignature;
    triggerResultsAnimation();
  }, [deferResults, isAllView, resultsSignature, triggerResultsAnimation]);

  useEffect(() => {
    if (!activeModal) {
      return;
    }

    lastFocusedRef.current = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const isShift = event.shiftKey;
      const current = document.activeElement as HTMLElement;

      if (!isShift && current === last) {
        event.preventDefault();
        first.focus();
      }

      if (isShift && current === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [activeModal]);

  useEffect(() => {
    animatedStatsRef.current = animatedStats;
  }, [animatedStats]);

  useEffect(() => {
    if (!isHomeView || typeof window === "undefined" || !statsSectionRef.current) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const runCountUp = (
      key: keyof typeof animatedStats,
      target: number,
      durationMs: number
    ) =>
      new Promise<void>((resolve) => {
        const start = window.performance.now();
        const initial = animatedStatsRef.current[key] ?? 0;
        let animationFrame = 0;

        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const nextValue = Math.round(initial + (target - initial) * ease);
          setAnimatedStats((prev) => ({ ...prev, [key]: nextValue }));

          if (progress < 1) {
            animationFrame = window.requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };

        animationFrame = window.requestAnimationFrame(tick);

        return () => window.cancelAnimationFrame(animationFrame);
      });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || statsAnimationStarted.current) {
            return;
          }
          statsAnimationStarted.current = true;

          if (prefersReducedMotion) {
            setAnimatedStats({
              totalUsers: userStats.totalUsers,
              totalStudents: userStats.totalStudents,
              usStates: userStats.usStates,
              otherCountries: userStats.otherCountries,
              totalCountries: userStats.highlightedCountries.length,
            });
            setStatsVisibility({
              showCountries: true,
              showStates: true,
              showMap: true,
            });
            return;
          }

          (async () => {
            await runCountUp("totalUsers", userStats.totalUsers, 900);
            await runCountUp("totalStudents", userStats.totalStudents, 900);
            setStatsVisibility((prev) => ({ ...prev, showCountries: true }));
            await new Promise((resolve) => setTimeout(resolve, 200));
            setStatsVisibility((prev) => ({ ...prev, showStates: true }));
            await new Promise((resolve) => setTimeout(resolve, 200));
            setStatsVisibility((prev) => ({ ...prev, showMap: true }));
            setAnimatedStats((prev) => ({
              ...prev,
              totalCountries: userStats.highlightedCountries.length,
              usStates: userStats.usStates,
            }));
          })();
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(statsSectionRef.current);

    return () => observer.disconnect();
  }, [userStats, isHomeView]);

  useEffect(() => {
    if (!isHomeView) {
      return;
    }
    const container = mapContainerRef.current;
    if (!container) {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      if (mapInstanceRef.current || !container) {
        return;
      }

      let SvgMap: any = null;
      const globalWithRequire = window as Window & {
        require?: (moduleName: string) => unknown;
      };
      const originalRequire = globalWithRequire.require;
      try {
        const svgPanZoomModule = await import("svg-pan-zoom");
        const svgPanZoom = (svgPanZoomModule as any).default ?? svgPanZoomModule;
        globalWithRequire.require = (moduleName: string) => {
          if (moduleName === "svg-pan-zoom") {
            return svgPanZoom;
          }
          if (typeof originalRequire === "function") {
            return originalRequire(moduleName);
          }
          throw new Error(`Unsupported module requested via require: ${moduleName}`);
        };

        const svgMapModule = await import("svgmap");
        SvgMap = svgMapModule?.default;
      } catch (error) {
        console.error("Unable to load svgmap module", error);
        return;
      } finally {
        if (typeof originalRequire === "function") {
          globalWithRequire.require = originalRequire;
        } else {
          delete globalWithRequire.require;
        }
      }

      if (!isMounted || !container || typeof SvgMap !== "function") {
        return;
      }

      const values = userStats.highlightedCountries.reduce(
        (acc, code) => ({
          ...acc,
          [code]: {
            teachers: 1,
            color: "#f0f6ff",
          },
        }),
        {} as Record<string, { teachers: number; color: string }>
      );

      try {
        mapInstanceRef.current = new SvgMap({
          targetElementID: "gp-world-map",
          allowInteraction: false,
          showZoomReset: false,
          showContinentSelector: false,
          mouseWheelZoomEnabled: false,
          touchLink: false,
          colorNoData: "transparent",
          colorMin: "#f0f6ff",
          colorMax: "#f0f6ff",
          data: {
            data: {
              teachers: {
                name: "Teachers",
                format: "{0}",
                thresholdMin: 1,
                thresholdMax: 1,
              },
            },
            applyData: "teachers",
            values,
          },
        });
      } catch (error) {
        console.error("Unable to initialize svgmap", error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      mapInstanceRef.current = null;
      container.innerHTML = "";
    };
  }, [userStats.highlightedCountries, isHomeView]);

  useEffect(() => {
    if (!isHomeView || typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3600);

    return () => window.clearInterval(interval);
  }, [isHomeView]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setShowStatsDebug(window.location.search.includes("stats-debug=1"));

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-animate]")
    );
    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.inView);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [isAllView]);

  const parseQueryArray = (value: string | string[] | undefined) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => decodeURIComponent(item)).filter(Boolean);
    }
    return value
      .split(",")
      .map((item) => decodeURIComponent(item))
      .filter(Boolean);
  };

  const buildQueryObject = (
    params: Record<string, string | string[] | undefined>
  ) => {
    const query: Record<string, string | string[]> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length) {
          query[key] = value;
        }
        return;
      }
      if (value) {
        query[key] = value;
      }
    });
    return query;
  };

  const normalizeQuery = (
    query: Record<string, string | string[] | undefined>
  ) => {
    const normalized = QUERY_KEYS.map((key) => {
      const value = query[key];
      if (!value) return [key, []];
      const arr = Array.isArray(value) ? value : [value];
      return [key, arr.map(String).sort()];
    });
    return JSON.stringify(normalized);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const hasQueryInPath = router.asPath.includes("?");
    const hasQueryValues = Object.keys(router.query).length > 0;
    if (hasQueryInPath && !hasQueryValues) {
      return;
    }
    const query = router.query;
    const typeFilterParam = parseQueryArray(query.typeFilter);
    const queryText = Array.isArray(query.q) ? query.q[0] : query.q;
    const nextSearch = typeof queryText === "string" ? queryText : "";
    const nextTarget = parseQueryArray(query.target);
    const nextAligned = parseQueryArray(query.aligned);
    const nextGrade = parseQueryArray(query.grade);
    const nextTag = parseQueryArray(query.tag);
    const nextLocale = parseQueryArray(query.locale);
    const nextTourScopeRaw = Array.isArray(query.tourScope)
      ? query.tourScope[0]
      : query.tourScope;
    const nextTourScope =
      nextTourScopeRaw === "unit" || nextTourScopeRaw === "community"
        ? nextTourScopeRaw
        : "";
    const nextMine =
      query.mine === "1" ||
      query.mine === "true" ||
      (Array.isArray(query.mine) && query.mine.includes("1"));
    if (!isTypingRef.current) {
      setSearchQuery(nextSearch);
      setSearchInputValue(nextSearch);
      setDebouncedSearchQuery(nextSearch);
    }
    const nextTypes =
      typeFilterParam.length === 0 ? [...CONTENT_TYPES] : typeFilterParam;
    setSelectedContentTypes((prev) =>
      arraysEqual(prev, nextTypes) ? prev : nextTypes
    );
    setSelectedTargetSubjects((prev) =>
      arraysEqual(prev, nextTarget) ? prev : nextTarget
    );
    setSelectedAlignedSubjects((prev) =>
      arraysEqual(prev, nextAligned) ? prev : nextAligned
    );
    setSelectedGradeBands((prev) =>
      arraysEqual(prev, nextGrade) ? prev : nextGrade
    );
    setSelectedTags((prev) => (arraysEqual(prev, nextTag) ? prev : nextTag));
    setSelectedLocales((prev) =>
      arraysEqual(prev, nextLocale) ? prev : nextLocale
    );
    setShowOnlyMyContent(nextMine);
    setTourScope(nextTourScope);
    setQueryHydrated(true);
  }, [router.isReady, router.query, router.asPath, initialTab]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!queryHydrated) return;
    if (!isAllView) {
      const cleared = buildQueryObject({
        typeFilter: [],
        q: undefined,
        target: [],
        aligned: [],
        grade: [],
        tag: [],
        locale: [],
        mine: undefined,
        tourScope: undefined,
      });
      if (normalizeQuery(router.query) !== normalizeQuery(cleared)) {
        router.replace({ pathname: router.pathname, query: cleared }, undefined, {
          shallow: true,
          scroll: false,
        });
      }
      return;
    }

    const typeFilter =
      selectedContentTypes.length === CONTENT_TYPES.length
        ? []
        : selectedContentTypes;
    const query = buildQueryObject({
      typeFilter,
      q: (isSearchRoute ? debouncedSearchQuery : searchQuery).trim() || undefined,
      target: selectedTargetSubjects,
      aligned: selectedAlignedSubjects,
      grade: selectedGradeBands,
      tag: selectedTags,
      locale: selectedLocales,
      mine: showOnlyMyContent ? "1" : undefined,
      tourScope: tourScope || undefined,
    });

    if (normalizeQuery(router.query) === normalizeQuery(query)) {
      return;
    }

    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
  }, [
    router,
    isAllView,
    searchQuery,
    debouncedSearchQuery,
    isSearchRoute,
    selectedContentTypes,
    selectedTargetSubjects,
    selectedAlignedSubjects,
    selectedGradeBands,
    selectedTags,
    selectedLocales,
    showOnlyMyContent,
    tourScope,
  ]);

  useEffect(() => {
    if (!isSearchRoute) return;
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchInputValue);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [isSearchRoute, searchInputValue]);

  const hasSyncedDebouncedQueryRef = useRef(false);
  useEffect(() => {
    if (!isSearchRoute || !queryHydrated) return;
    if (!hasSyncedDebouncedQueryRef.current) {
      hasSyncedDebouncedQueryRef.current = true;
      return;
    }
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, isSearchRoute, queryHydrated]);

  useEffect(() => {
    if (!isSearchRoute) return;
    const shouldLoadTours =
      selectedContentTypes.includes("Job Tour") || showOnlyMyContent;
    if (!shouldLoadTours) return;
    let isMounted = true;
    setJobTourLoading(true);
    setJobTourError(null);
    const requests = [
      getJobTours({
        filterObj: {},
        sort: { lastEdited: -1 },
        limit: 200,
      }),
    ];
    if (userId) {
      requests.push(
        getJobTours({
          filterObj: { userId },
          sort: { lastEdited: -1 },
          limit: 200,
        })
      );
    }
    Promise.all(requests)
      .then(([publicTours, userTours]) => {
        if (!isMounted) return;
        const combined = new Map();
        (publicTours ?? []).forEach((tour) => combined.set(tour._id, tour));
        (userTours ?? []).forEach((tour) => combined.set(tour._id, tour));
        const tours = Array.from(combined.values()).filter((tour) => {
          if (tour.userId === userId) return true;
          if (tour.whoCanSee === "everyone") return true;
          if (tour.whoCanSee === "just-teachers") {
            return status === "authenticated";
          }
          return false;
        });
        setJobTourRecords(tours);
      })
      .catch((error) => {
        if (!isMounted) return;
        setJobTourError(
          error?.response?.data?.msg ||
          error?.message ||
          "Unable to load JobViz tours."
        );
        setJobTourRecords([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setJobTourLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [
    isSearchRoute,
    selectedContentTypes,
    showOnlyMyContent,
    status,
    userId,
  ]);

  // nav handled by shared PortalNav component

  useEffect(() => {
    return () => {
      if (animateTimeoutRef.current) {
        window.clearTimeout(animateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const updateCollapse = () => setFiltersCollapsed(mediaQuery.matches);
    updateCollapse();
    mediaQuery.addEventListener("change", updateCollapse);
    return () => mediaQuery.removeEventListener("change", updateCollapse);
  }, []);

  useEffect(() => {
    if (!showOnlyMyContent) return;
    if (selectedContentTypes.includes("Job Tour")) return;
    setSelectedContentTypes(["Job Tour"]);
  }, [selectedContentTypes, showOnlyMyContent]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={pageDescription}
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Galactic Polymath" />
        <meta property="og:image" content={socialPreviewImage} />
        <meta property="og:image:alt" content="Galactic Polymath teacher resources" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={socialPreviewImage} />
        <meta name="twitter:image:alt" content="Galactic Polymath teacher resources" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>
      <div
        className={`${styles.page} ${isSearchTransitioning ? styles.pageSearchTransitioning : ""
          }`}
      >
        <PortalNav
          activeTab={isHomeView ? null : resolvedTab}
          onBrandClick={handleHomeClick}
          onTabClick={(tab) => handleTabClick(tab)}
        />
        {isAllView && (
          <>
            <header className={styles.allHero}>
              <div className={styles.allHeroGlow} aria-hidden="true" />
              <div className={styles.allHeroInner}>
                <div className={styles.allHeroCopy}>
                  <p className={styles.kicker}>All resources</p>
                  <h1 className={styles.allHeroTitle}>{allHeroTitle}</h1>
                  <p className={styles.allHeroLead}>
                    Filter by grade band, subject focus, and classroom format to
                    find the best-fit resources fast.
                  </p>
                  <div className={styles.allHeroStats}>
                    <div className={styles.allStatCard}>
                      <span>Total resources</span>
                      <strong>{totalResources}</strong>
                    </div>
                    <div className={styles.allStatCard}>
                      <span>Units</span>
                      <strong>{totalUnits}</strong>
                    </div>
                    <div className={styles.allStatCard}>
                      <span>Apps + videos</span>
                      <strong>{totalApps + totalVideos}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main className={styles.allMain}>
              <section
                className={`${styles.allShell} ${filtersCollapsed ? styles.allShellCollapsed : ""
                  }`}
              >
                <aside
                  className={`${styles.allFiltersPanel} ${filtersCollapsed ? styles.allFiltersPanelCollapsed : ""
                    }`}
                  role={filtersCollapsed ? "button" : undefined}
                  tabIndex={filtersCollapsed ? 0 : undefined}
                  onClick={() => {
                    if (filtersCollapsed) {
                      setFiltersCollapsed(false);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!filtersCollapsed) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setFiltersCollapsed(false);
                    }
                  }}
                >
                  <div className={styles.filterHeader}>
                    <div>
                      <h3>Filters</h3>
                    </div>
                    <div className={styles.filterHeaderActions}>
                      <button
                        className={styles.filterReset}
                        type="button"
                        onClick={() => {
                          setSelectedContentTypes([...CONTENT_TYPES]);
                          setSelectedTargetSubjects([]);
                          setSelectedAlignedSubjects([]);
                          setSelectedGradeBands([]);
                          setSelectedTags([]);
                          setSelectedLocales([]);
                          setShowOnlyMyContent(false);
                        }}
                      >
                        Reset
                      </button>
                      <button
                        className={styles.filterCollapseButton}
                        type="button"
                        aria-label={
                          filtersCollapsed ? "Show filters" : "Hide filters"
                        }
                        aria-expanded={!filtersCollapsed}
                        onClick={() => setFiltersCollapsed((prev) => !prev)}
                      >
                        {filtersCollapsed && (
                          <span className={styles.filterCollapsedLabel}>
                            Filters
                          </span>
                        )}
                        <ListFilter
                          className={styles.filterCollapseIconMobile}
                          aria-hidden="true"
                        />
                        {filtersCollapsed ? (
                          <CircleArrowRight
                            className={styles.filterCollapseIconDesktop}
                            aria-hidden="true"
                          />
                        ) : (
                          <CircleArrowLeft
                            className={styles.filterCollapseIconDesktop}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className={styles.filterContent}>
                    <details
                      className={`${styles.filterGroup} ${styles.filterTagsGroup}`}
                      open
                    >
                      <summary className={styles.filterSummary}>Content type</summary>
                      <div className={styles.filterOptions}>
                        {["Unit", "Lesson", "Video", "App", "Job Tour"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={
                              selectedContentTypes.includes(option)
                                ? styles.filterPillActive
                                : styles.filterPill
                            }
                            onClick={() =>
                              toggleSelection(
                                option,
                                selectedContentTypes,
                                setSelectedContentTypes
                              )
                            }
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </details>
                    {status === "authenticated" && (
                      <details className={styles.filterGroup} open>
                        <summary className={styles.filterSummary}>My content</summary>
                        <div className={styles.filterOptions}>
                          <button
                            type="button"
                            className={
                              showOnlyMyContent
                                ? styles.filterPillActive
                                : styles.filterPill
                            }
                            onClick={() => setShowOnlyMyContent((prev) => !prev)}
                          >
                            My JobViz Tours
                          </button>
                        </div>
                      </details>
                    )}
                    <details className={styles.filterGroup} open>
                      <summary className={styles.filterSummary}>Target Subject</summary>
                      <div className={styles.filterOptions}>
                        {targetSubjectOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={
                              selectedTargetSubjects.includes(option)
                                ? styles.filterPillActive
                                : styles.filterPill
                            }
                            onClick={() =>
                              toggleSelection(
                                option,
                                selectedTargetSubjects,
                                setSelectedTargetSubjects
                              )
                            }
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </details>
                    <details className={styles.filterGroup} open>
                      <summary className={styles.filterSummary}>Aligned Subjects</summary>
                      <div className={styles.filterOptions}>
                        {alignedSubjectOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={
                              selectedAlignedSubjects.includes(option)
                                ? styles.filterPillActive
                                : styles.filterPill
                            }
                            onClick={() =>
                              toggleSelection(
                                option,
                                selectedAlignedSubjects,
                                setSelectedAlignedSubjects
                              )
                            }
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </details>
                    <details className={styles.filterGroup} open>
                      <summary className={styles.filterSummary}>Grade bands</summary>
                      <div className={styles.filterOptions}>
                        {gradeBandOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={
                              selectedGradeBands.includes(option)
                                ? styles.filterPillActive
                                : styles.filterPill
                            }
                            onClick={() =>
                              toggleSelection(
                                option,
                                selectedGradeBands,
                                setSelectedGradeBands
                              )
                            }
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </details>
                    <details className={styles.filterGroup} open>
                      <summary className={styles.filterSummary}>Tags</summary>
                      <div className={styles.filterOptions}>
                        {displayedTagOptions.map((option) => {
                          const range = tagCloudRange.max - tagCloudRange.min || 1;
                          const t = (option.count - tagCloudRange.min) / range;
                          const size = 12 + t * 6;
                          return (
                            <button
                              key={option.tag}
                              type="button"
                              className={
                                selectedTags.includes(option.tag)
                                  ? styles.tagCloudItemActive
                                  : styles.tagCloudItem
                              }
                              onClick={() =>
                                toggleSelection(
                                  option.tag,
                                  selectedTags,
                                  setSelectedTags
                                )
                              }
                              style={{ fontSize: `${size}px` }}
                            >
                              {option.tag}
                            </button>
                          );
                        })}
                        {tagOptions.length > 10 && (
                          <button
                            className={styles.tagCloudToggle}
                            type="button"
                            onClick={() => setShowAllTags((prev) => !prev)}
                          >
                            {showAllTags ? "Show fewer" : "Show all"}
                          </button>
                        )}
                      </div>
                    </details>
                    <details className={styles.filterGroup} open>
                      <summary className={styles.filterSummary}>Language</summary>
                      <div className={styles.filterOptions}>
                        {localeOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={
                              selectedLocales.includes(option)
                                ? styles.filterPillActive
                                : styles.filterPill
                            }
                            onClick={() =>
                              toggleSelection(
                                option,
                                selectedLocales,
                                setSelectedLocales
                              )
                            }
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </details>
                    <div className={styles.filterFooter}>
                      <button
                        className={styles.ghostButton}
                        type="button"
                        onClick={async () => {
                          if (typeof window === "undefined") return;
                          try {
                            await navigator.clipboard.writeText(window.location.href);
                            setShareCopied(true);
                            window.setTimeout(() => setShareCopied(false), 2000);
                          } catch (error) {
                            console.error("Failed to copy share link", error);
                          }
                        }}
                      >
                        Share View
                      </button>
                      {shareCopied && (
                        <span className={styles.shareCopied} role="status">
                          <SquareCheckBig aria-hidden="true" />
                          Copied to clipboard
                        </span>
                      )}
                    </div>
                  </div>
                </aside>
                <div className={styles.allResults}>
                  {deferResults ? (
                    <div className={styles.resultsNotice} role="status" aria-live="polite">
                      Loading results...
                    </div>
                  ) : (
                    <>
                      <div className={styles.resultsHeader}>
                        <div className={styles.resultsHeaderTop}>
                          <div className={styles.resultsSearch}>
                            <div className={styles.searchBar}>
                              <Search className={styles.searchIcon} aria-hidden="true" />
                              <input
                                type="text"
                                placeholder="Search by title, standards, or skill..."
                                aria-label="Search all resources"
                                value={searchInputValue}
                                onChange={(event) => {
                                  setSearchInputValue(event.target.value);
                                  isTypingRef.current = true;
                                  if (typingTimeoutRef.current) {
                                    window.clearTimeout(typingTimeoutRef.current);
                                  }
                                  typingTimeoutRef.current = window.setTimeout(() => {
                                    isTypingRef.current = false;
                                  }, 500);
                                }}
                              />
                              <button
                                className={`${styles.searchClearButton} ${searchInputValue.trim()
                                  ? ""
                                  : styles.searchClearButtonHidden
                                  }`}
                                type="button"
                                aria-label="Clear search"
                                onClick={() => {
                                  setSearchInputValue("");
                                  setSearchQuery("");
                                  setDebouncedSearchQuery("");
                                  isTypingRef.current = false;
                                  if (typingTimeoutRef.current) {
                                    window.clearTimeout(typingTimeoutRef.current);
                                  }
                                }}
                                tabIndex={searchInputValue.trim() ? 0 : -1}
                              >
                                <X aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <div className={styles.resultsControls}>
                            <button
                              className={
                                resultsView === "grid"
                                  ? styles.resultsControlActive
                                  : styles.resultsControl
                              }
                              type="button"
                              onClick={() => {
                                transitionResultsView("grid");
                              }}
                            >
                              <FiGrid aria-hidden="true" /> Grid
                            </button>
                            <button
                              className={
                                resultsView === "list"
                                  ? styles.resultsControlActive
                                  : styles.resultsControl
                              }
                              type="button"
                              onClick={() => {
                                transitionResultsView("list");
                              }}
                            >
                              List
                            </button>
                            <select
                              className={styles.resultsSelect}
                              aria-label="Sort all resources"
                              value={sortOrder}
                              onChange={(event) => {
                                setSortOrder(event.target.value as typeof sortOrder);
                              }
                              }
                            >
                              <option value="relevant">Most relevant</option>
                              <option value="newest">Newest first ↑</option>
                              <option value="oldest">Oldest first ↓</option>
                            </select>
                          </div>
                        </div>
                        <div className={styles.resultsKicker}>
                          <span>
                            Showing {resultsCount} Results from{" "}
                            {resolvedTab === "All" ? "All Resources" : resolvedTab}
                          </span>
                        </div>
                        {selectedContentTypes.includes("Job Tour") && (
                          <>
                            {jobTourLoading && (
                              <div className={styles.resultsNotice}>
                                Loading JobViz tours...
                              </div>
                            )}
                            {jobTourError && (
                              <div className={styles.resultsNotice} role="alert">
                                {jobTourError}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div
                        className={`${styles.resultsChips} ${hasActiveFilterChips ? "" : styles.resultsChipsEmpty
                          }`}
                      >
                        {hasActiveFilterChips && (
                          <span className={styles.activeFiltersLabel}>
                            Active filters
                          </span>
                        )}
                        {[
                          ...selectedTargetSubjects,
                          ...selectedAlignedSubjects,
                          ...selectedGradeBands,
                          ...selectedTags,
                          ...selectedLocales,
                          ...(showOnlyMyContent ? ["My JobViz Tours"] : []),
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            className={styles.activeChip}
                            onClick={() => handleRemoveChip(chip)}
                          >
                            <span>{chip}</span>
                            <X aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                      {resultsCount > 0 && resultsView === "list" && (
                        <div className={styles.resourceRowHeader} aria-hidden="true">
                          <div
                            className={`${styles.resourceRowHeaderCell} ${styles.resourceRowHeaderCellThumb}`}
                          >
                            <div className={styles.resourceRowHeaderThumb} />
                          </div>
                          <div
                            className={`${styles.resourceRowHeaderCell} ${styles.resourceRowHeaderCellTitle}`}
                          >
                            <div className={styles.resourceRowHeaderTitle}>Title</div>
                          </div>
                          <div className={styles.resourceRowHeaderCell}>
                            <div className={styles.resourceRowHeaderCol}>
                              <Compass
                                className={styles.resourceRowHeaderIcon}
                                aria-hidden="true"
                              />
                              Subject
                            </div>
                          </div>
                          <div className={styles.resourceRowHeaderCell}>
                            <div className={styles.resourceRowHeaderCol}>
                              <School
                                className={`${styles.resourceRowHeaderIcon} ${styles.resourceRowHeaderIconGrade}`}
                                aria-hidden="true"
                              />
                              Grade
                            </div>
                          </div>
                          <div className={styles.resourceRowHeaderCell}>
                            <div className={styles.resourceRowHeaderCol}>Type</div>
                          </div>
                        </div>
                      )}
                      {resultsCount === 0 ? (
                        <div className={styles.resultsNotice} role="status" aria-live="polite">
                          ¯\_(ツ)_/¯ We didn&apos;t find anything. Try searching for synonyms and
                          check your filters.
                        </div>
                      ) : (
                        <div
                          className={`${styles.resourceGrid} ${resultsView === "list" ? styles.resourceGridList : ""
                            } ${resultsTransitioning ? styles.resourceGridTransitioning : ""}`}
                        >
                          {sortedResources.map((resource, index) => {
                            const ResourceIcon = resource.icon;
                            const unitHref =
                              resource.type === "Unit" && resource.unitId
                                ? buildUnitPath(resource.unitId)
                                : null;
                            const jobTourUrl =
                              resource.type === "Job Tour"
                                ? buildJobTourUrl(resource)
                                : null;
                            const isClickable =
                              resource.type === "Video" ||
                              resource.type === "App" ||
                              resource.type === "Job Tour" ||
                              Boolean(unitHref);
                            const showLessons =
                              (resource.type === "Unit" || resource.type === "Lesson") &&
                              Boolean(resource.timeLabel?.trim());
                            const animationDelay =
                              resultsView === "list" ? 0 : Math.min(index, 10) * 25;
                            const madeByLabel = (() => {
                              if (resource.tourSource === "unit") return "GP Team";
                              if (resource.ownerId && userId && resource.ownerId === userId)
                                return "Me";
                              if (resource.tourIsGp) return "GP Team";
                              return resource.ownerName || "Teacher";
                            })();
                            const visibilityLabel =
                              resource.tourVisibility === "me"
                                ? "Private"
                                : resource.tourVisibility === "just-teachers"
                                  ? "Teachers"
                                  : resource.tourVisibility === "everyone"
                                    ? "Public"
                                    : null;
                            const searchMatch =
                              searchMatchByResourceId.get(resource.id) ??
                              ({
                                queryMatches: true,
                                hiddenCategories: [],
                                relevanceScore: 0,
                              } as ResourceSearchMatchResult);
                            const hiddenMatchCategories = hasCommittedSearch
                              ? searchMatch.hiddenCategories
                              : [];
                            const cardProps = {
                              role: isClickable ? "button" : undefined,
                              tabIndex: isClickable ? 0 : undefined,
                              style: {
                                animationDelay: `${animationDelay}ms`,
                              } as React.CSSProperties,
                              onClick: () => {
                                if (resource.type === "Video") {
                                  handleOpenMedia({
                                    title: resource.title,
                                    type: "Video",
                                    thumbnail: resource.image,
                                    link: resource.mediaLink ?? null,
                                    lessonRelevance: resource.mediaLessonRelevance ?? null,
                                    unitTitle: resource.unitTitle ?? null,
                                    subtitle: resource.unitSubtitle ?? null,
                                    unitId: resource.unitId ?? null,
                                  });
                                  return;
                                }
                                if (resource.type === "Job Tour" && jobTourUrl) {
                                  if (resource.tourId) {
                                    handleOpenJobTourAccessModal(resource);
                                  } else {
                                    router.push(jobTourUrl);
                                  }
                                  return;
                                }
                                if (resource.type === "App" && resource.mediaLink) {
                                  if (resource.mediaLink.startsWith("/")) {
                                    router.push(resource.mediaLink);
                                  } else {
                                    window.open(resource.mediaLink, "_blank");
                                  }
                                  return;
                                }
                                if (unitHref) {
                                  router.push(unitHref);
                                }
                              },
                              onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
                                if (!isClickable) return;
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  if (resource.type === "Video") {
                                    handleOpenMedia({
                                      title: resource.title,
                                      type: "Video",
                                      thumbnail: resource.image,
                                      link: resource.mediaLink ?? null,
                                      lessonRelevance: resource.mediaLessonRelevance ?? null,
                                      unitTitle: resource.unitTitle ?? null,
                                      subtitle: resource.unitSubtitle ?? null,
                                      unitId: resource.unitId ?? null,
                                    });
                                    return;
                                  }
                                  if (resource.type === "Job Tour" && jobTourUrl) {
                                    if (resource.tourId) {
                                      handleOpenJobTourAccessModal(resource);
                                    } else {
                                      router.push(jobTourUrl);
                                    }
                                    return;
                                  }
                                  if (resource.type === "App" && resource.mediaLink) {
                                    if (resource.mediaLink.startsWith("/")) {
                                      router.push(resource.mediaLink);
                                    } else {
                                      window.open(resource.mediaLink, "_blank");
                                    }
                                    return;
                                  }
                                  if (unitHref) {
                                    router.push(unitHref);
                                  }
                                }
                              },
                            };

                            if (resultsView === "list") {
                              const hasSubtitle = Boolean(resource.description?.trim());
                              const isUnit = resource.type === "Unit";
                              if (resource.type === "Job Tour") {
                                const jobTourTitle =
                                  resource.tourSource === "unit" && resource.tourUnitId
                                    ? `Jobs related to GP Unit ${resource.tourUnitId}`
                                    : resource.title;
                                const fromUnitLabel =
                                  resource.tourUnitTitle ??
                                  resource.description.replace(/^From\s+/i, "");
                                return (
                                  <article
                                    key={resource.id}
                                    className={`${styles.resourceRow} ${styles.jobTourRow} ${animateResults ? styles.resourceAnimate : ""
                                      }`}
                                    data-type={resource.type}
                                    {...cardProps}
                                  >
                                    <div className={styles.resourceRowMedia}>
                                      <img src={resource.image} alt="" loading="lazy" />
                                      <div className={styles.resourceMediaType}>
                                        <img
                                          src="/imgs/jobViz/jobviz_rocket_logo_white.svg"
                                          alt=""
                                          aria-hidden="true"
                                        />
                                      </div>
                                    </div>
                                    <div className={styles.resourceRowContent}>
                                      <div
                                        className={`${styles.resourceRowTitleLine} ${styles.jobTourRowTitleLine}`}
                                      >
                                        <span className={styles.resourceRowTitleText}>
                                          {resource.tourSource === "unit"
                                            ? "Jobs related to:"
                                            : highlightText(jobTourTitle, searchQuery)}
                                        </span>
                                        {fromUnitLabel ? (
                                          <span className={styles.resourceRowSubtitle}>
                                            &quot;
                                            {highlightText(
                                              truncateUnitTitle(fromUnitLabel),
                                              searchQuery
                                            )}
                                            &quot;
                                          </span>
                                        ) : (
                                          hasSubtitle && (
                                            <span className={styles.resourceRowSubtitle}>
                                              {highlightText(resource.description, searchQuery)}
                                            </span>
                                          )
                                        )}
                                      </div>
                                      {hiddenMatchCategories.length > 0 && (
                                        <div className={styles.rowMatchArea}>
                                          <span className={styles.searchMatchLabel}>
                                            Search also matches
                                          </span>
                                          {hiddenMatchCategories.slice(0, 2).map((category) => (
                                            <span
                                              key={`${resource.id}-${category.label}`}
                                              className={styles.rowMatchLine}
                                            >
                                              <strong>{category.label}:</strong>{" "}
                                              {summarizeCategoryValues(category.values, 2).join(", ")}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div
                                      className={`${styles.resourceRowCol} ${styles.resourceRowColCenter}`}
                                    >
                                      <span className={styles.resourceRowColValue}>
                                        {resource.subject ?? "Science"}
                                      </span>
                                    </div>
                                    <div
                                      className={`${styles.resourceRowCol} ${styles.resourceRowColCenter}`}
                                    >
                                      <span className={styles.resourceRowColValue}>
                                        {resource.gradeBand.replace(/^Grades\s*/i, "")}
                                      </span>
                                    </div>
                                    <div
                                      className={`${styles.resourceRowCol} ${styles.resourceRowColCenter} ${styles.resourceRowTypeCol}`}
                                    >
                                      <span className={styles.resourceRowTypeText}>
                                        {resource.type}
                                      </span>
                                      {(resource.isNew || resource.isPlus) && (
                                        <div className={styles.resourceBadges}>
                                          {resource.isNew && (
                                            <span className={styles.resourceBadge}>New</span>
                                          )}
                                          {resource.isPlus && (
                                            <span className={styles.resourceBadgePlus}>
                                              <img
                                                src="/plus/plus.png"
                                                alt=""
                                                aria-hidden="true"
                                              />
                                              GP+
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </article>
                                );
                              }
                              return (
                                <article
                                  key={resource.id}
                                  className={`${styles.resourceRow} ${animateResults ? styles.resourceAnimate : ""
                                    }`}
                                  data-type={resource.type}
                                  {...cardProps}
                                >
                                  <div className={styles.resourceRowMedia}>
                                    <img src={resource.image} alt="" loading="lazy" />
                                    <div className={styles.resourceMediaType}>
                                      <ResourceIcon aria-hidden="true" />
                                    </div>
                                  </div>
                                  <div className={styles.resourceRowContent}>
                                    <p className={styles.resourceRowTitleLine}>
                                      <span className={styles.resourceRowTitleText}>
                                        {highlightText(resource.title, searchQuery)}
                                      </span>
                                      {hasSubtitle && (
                                        <span
                                          className={
                                            isUnit
                                              ? styles.resourceRowSubtitleWithColon
                                              : styles.resourceRowSubtitle
                                          }
                                        >
                                          {resource.type === "Video" ||
                                            resource.type === "App" ? (
                                            <span
                                              className={styles.resourceFromLine}
                                              style={{ display: "block" }}
                                            >
                                              <CornerDownRight aria-hidden="true" />
                                              <span>
                                                From{" "}
                                                {highlightText(
                                                  resource.unitTitle ??
                                                  resource.description.replace(/^From\s+/i, ""),
                                                  searchQuery
                                                )}
                                              </span>
                                              <span className={styles.resourceFromPill}>
                                                Unit
                                              </span>
                                            </span>
                                          ) : (
                                            highlightText(resource.description, searchQuery)
                                          )}
                                        </span>
                                      )}
                                    </p>
                                    {hiddenMatchCategories.length > 0 && (
                                      <div className={styles.rowMatchArea}>
                                        <span className={styles.searchMatchLabel}>
                                          Search also matches
                                        </span>
                                        {hiddenMatchCategories.slice(0, 2).map((category) => (
                                          <span
                                            key={`${resource.id}-${category.label}`}
                                            className={styles.rowMatchLine}
                                          >
                                            <strong>{category.label}:</strong>{" "}
                                            {summarizeCategoryValues(category.values, 2).join(", ")}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div
                                    className={`${styles.resourceRowCol} ${styles.resourceRowColCenter}`}
                                  >
                                    <span className={styles.resourceRowColValue}>
                                      {resource.subject ?? "Science"}
                                    </span>
                                  </div>
                                  <div
                                    className={`${styles.resourceRowCol} ${styles.resourceRowColCenter}`}
                                  >
                                    <span className={styles.resourceRowColValue}>
                                      {resource.gradeBand.replace(/^Grades\s*/i, "")}
                                    </span>
                                  </div>
                                  <div
                                    className={`${styles.resourceRowCol} ${styles.resourceRowColCenter} ${styles.resourceRowTypeCol}`}
                                  >
                                    <span className={styles.resourceRowTypeText}>
                                      {resource.type}
                                    </span>
                                    {resource.type === "Unit" &&
                                      resource.timeLabel?.trim() && (
                                        <span className={styles.resourceRowLessonCount}>
                                          {resource.timeLabel}
                                        </span>
                                      )}
                                    {(resource.isNew || resource.isPlus) && (
                                      <div className={styles.resourceBadges}>
                                        {resource.isNew && (
                                          <span className={styles.resourceBadge}>New</span>
                                        )}
                                        {resource.isPlus && (
                                          <span className={styles.resourceBadgePlus}>
                                            <img
                                              src="/plus/plus.png"
                                              alt=""
                                              aria-hidden="true"
                                            />
                                            GP+
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </article>
                              );
                            }

                            if (resource.type === "Job Tour") {
                              const jobTitlesRaw = getJobTitlesForTour(
                                resource.selectedJobs,
                                4
                              );
                              const jobTitles = jobTitlesRaw.map((title) =>
                                truncateJobTitle(title)
                              );
                              const remainingJobs = Math.max(
                                (resource.selectedJobs?.length ?? 0) - jobTitlesRaw.length,
                                0
                              );
                              const isUnitTour = resource.tourSource === "unit";
                              return (
                                <article
                                  key={resource.id}
                                  className={`${styles.resourceCard} ${styles.jobTourCard} ${animateResults ? styles.resourceAnimate : ""
                                    }`}
                                  data-type={resource.type}
                                  {...cardProps}
                                >
                                  <div className={styles.resourceMedia}>
                                    <img src={resource.image} alt="" loading="lazy" />
                                    <div className={styles.resourceMediaType}>
                                      <img
                                        src="/imgs/jobViz/jobviz_rocket_logo_white_bold.svg"
                                        alt=""
                                        aria-hidden="true"
                                      />
                                    </div>
                                  </div>
                                  <div className={styles.resourceContent}>
                                    <h3>
                                      {isUnitTour
                                        ? "Jobs Related to GP Unit:"
                                        : highlightText(resource.title, searchQuery)}
                                    </h3>
                                    <p className={styles.resourceDescription}>
                                      {isUnitTour ? (
                                        <span className={styles.jobTourFromLine}>
                                          <CornerDownRight aria-hidden="true" />
                                          <span>
                                            from{" "}
                                            {highlightText(
                                              resource.description.replace(/^From\s+/i, ""),
                                              searchQuery
                                            )}
                                          </span>
                                        </span>
                                      ) : (
                                        highlightText(resource.description, searchQuery)
                                      )}
                                    </p>
                                    <p className={styles.jobTourAuthorLine}>
                                      By{" "}
                                      <span className={styles.jobTourAuthorPill}>
                                        {madeByLabel}
                                      </span>
                                    </p>
                                    {jobTitles.length ? (
                                      <div className={styles.jobTourJobs}>
                                        {jobTitles.map((title) => (
                                          <span key={title}>{highlightText(title, searchQuery)}</span>
                                        ))}
                                        {remainingJobs > 0 && (
                                          <span className={styles.jobTourJobsMore}>
                                            + {remainingJobs} more
                                          </span>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                  <div className={styles.resourceSide}>
                                    <span className={styles.resourceTypePill}>
                                      <ResourceIcon aria-hidden="true" />
                                      {resource.type.toLowerCase()}
                                    </span>
                                    {(resource.isNew || resource.isPlus) && (
                                      <div className={styles.resourceBadges}>
                                        {resource.isNew && (
                                          <span className={styles.resourceBadge}>New</span>
                                        )}
                                        {resource.isPlus && (
                                          <span className={styles.resourceBadgePlus}>
                                            <img
                                              src="/plus/plus.png"
                                              alt=""
                                              aria-hidden="true"
                                            />
                                            GP+
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <div className={styles.resourceSideMeta}>
                                      <span>
                                        <Compass aria-hidden="true" />
                                        {resource.subject ?? "Science"}
                                      </span>
                                      <span>
                                        <School aria-hidden="true" />
                                        {resource.gradeBand
                                          .replace(/^Grades\s*/i, "")
                                          .replace(/university/gi, "College")}
                                      </span>
                                      <span>
                                        <Briefcase aria-hidden="true" />
                                        {resource.timeLabel}
                                      </span>
                                    </div>
                                  </div>
                                  {hiddenMatchCategories.length > 0 && (
                                    <div className={styles.searchMatchArea}>
                                      <p className={styles.searchMatchLabel}>
                                        Search also matches
                                      </p>
                                      {hiddenMatchCategories.map((category) => (
                                        <p
                                          key={`${resource.id}-${category.label}`}
                                          className={styles.searchMatchLine}
                                        >
                                          <strong>{category.label}:</strong>{" "}
                                          {summarizeCategoryValues(category.values).map(
                                            (value, idx) => (
                                              <React.Fragment key={`${value}-${idx}`}>
                                                {idx > 0 ? ", " : ""}
                                                {highlightText(value, searchQuery)}
                                              </React.Fragment>
                                            )
                                          )}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </article>
                              );
                            }
                            return (
                              <article
                                key={resource.id}
                                className={`${styles.resourceCard} ${animateResults ? styles.resourceAnimate : ""
                                  }`}
                                data-type={resource.type}
                                {...cardProps}
                              >
                                <div className={styles.resourceMedia}>
                                  <img src={resource.image} alt="" loading="lazy" />
                                  <div className={styles.resourceMediaType}>
                                    <ResourceIcon aria-hidden="true" />
                                  </div>
                                </div>
                                <div className={styles.resourceContent}>
                                  <h3>{highlightText(resource.title, searchQuery)}</h3>
                                  <p className={styles.resourceDescription}>
                                    {resource.type === "Video" || resource.type === "App" ? (
                                      <span className={styles.resourceFromLine}>
                                        <CornerDownRight aria-hidden="true" />
                                        <span>
                                          From{" "}
                                          {highlightText(
                                            resource.unitTitle ??
                                            resource.description.replace(/^From\s+/i, ""),
                                            searchQuery
                                          )}
                                        </span>
                                        <span className={styles.resourceFromPill}>Unit</span>
                                      </span>
                                    ) : (
                                      highlightText(resource.description, searchQuery)
                                    )}
                                  </p>
                                  {resource.tags?.length ? (
                                    <div className={styles.resourceTags}>
                                      {resource.tags.map((tag) => (
                                        <span key={tag}>{highlightText(tag, searchQuery)}</span>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                                <div className={styles.resourceSide}>
                                  <span className={styles.resourceTypePill}>
                                    <ResourceIcon aria-hidden="true" />
                                    {resource.type.toLowerCase()}
                                  </span>
                                  {(resource.isNew || resource.isPlus) && (
                                    <div className={styles.resourceBadges}>
                                      {resource.isNew && (
                                        <span className={styles.resourceBadge}>New</span>
                                      )}
                                      {resource.isPlus && (
                                        <span className={styles.resourceBadgePlus}>
                                          <img
                                            src="/plus/plus.png"
                                            alt=""
                                            aria-hidden="true"
                                          />
                                          GP+
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <div className={styles.resourceSideMeta}>
                                    <span>
                                      <Compass aria-hidden="true" />
                                      {resource.subject ?? "Science"}
                                    </span>
                                    <span>
                                      <School aria-hidden="true" />
                                      {resource.gradeBand
                                        .replace(/^Grades\s*/i, "")
                                        .replace(/university/gi, "College")}
                                    </span>
                                    {(resource.type === "Unit" || resource.type === "Lesson") &&
                                      resource.timeLabel && (
                                        <span>
                                          <NotebookPen aria-hidden="true" />
                                          {resource.timeLabel}
                                        </span>
                                      )}
                                  </div>
                                </div>
                                {hiddenMatchCategories.length > 0 && (
                                  <div className={styles.searchMatchArea}>
                                    <p className={styles.searchMatchLabel}>
                                      Search also matches
                                    </p>
                                    {hiddenMatchCategories.map((category) => (
                                      <p
                                        key={`${resource.id}-${category.label}`}
                                        className={styles.searchMatchLine}
                                      >
                                        <strong>{category.label}:</strong>{" "}
                                        {summarizeCategoryValues(category.values).map(
                                          (value, idx) => (
                                            <React.Fragment key={`${value}-${idx}`}>
                                              {idx > 0 ? ", " : ""}
                                              {highlightText(value, searchQuery)}
                                            </React.Fragment>
                                          )
                                        )}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            </main>
          </>
        )}

        {isHomeView && (
          <>
            <header className={styles.hero}>
              <div className={styles.heroGlow} aria-hidden="true" />
              <div className={styles.heroBody}>
                <div className={styles.heroCopy}>
                  <p className={styles.kicker}>Free Resources, Built With Experts</p>
                  <h1 className={styles.heroTitle}>
                    Real science,
                    <br />
                    ready to teach
                  </h1>
                  <p className={styles.heroLead}>
                    Our content comes straight from scientists at the frontier of
                    discovery— curated and adapted by our expert team of educators,
                    scientists and artists for your K-12 classrooms.
                  </p>
                  <div className={styles.heroHighlights}>
                    {experiencePillars.map((pillar) => (
                      <div
                        key={pillar.title}
                        className={`${styles.highlightCard} ${styles.reveal}`}
                        data-animate
                      >
                        <div className={styles.highlightIcon}>
                          <pillar.icon />
                        </div>
                        <h3>{pillar.title}</h3>
                        <p>{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.heroPanel}>
                  <div className={styles.searchCard}>
                    <form className={styles.searchBar} onSubmit={handleHomeSearchSubmit}>
                      <Search className={styles.searchIcon} aria-hidden="true" />
                      <input
                        type="text"
                        placeholder="Search by title, topic, standards, or skill..."
                        aria-label="Search resources"
                        value={searchInputValue}
                        onChange={(event) => setSearchInputValue(event.target.value)}
                      />
                      <button className={styles.searchSubmitButton} type="submit">
                        Search
                      </button>
                    </form>
                  </div>
                  <div className={styles.heroCarousel}>
                    {carouselImages.map((src, index) => (
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className={`${styles.heroCarouselImage} ${index === carouselIndex ? styles.heroCarouselActive : ""
                          }`}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    ))}
                    <div className={styles.heroCarouselCaption}>
                      Real classrooms. Real scientists. Real curiosity.
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <div className={styles.heroWave} aria-hidden="true" />
            <main className={styles.main}>
              <section
                className={`${styles.sectionStats} ${styles.reveal}`}
                data-animate
                ref={statsSectionRef}
              >
                <div className={styles.sectionInner}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.sectionKicker}>Join The GP Global Classroom</p>
                      <h2>Science is for Everyone!</h2>
                      <p>
                        A growing community of educators and students worldwide.
                      </p>
                    </div>
                  </div>
                  {showStatsDebug && userStats.debug && (
                    <div className={styles.statsDebug}>
                      <p className={styles.statsDebugTitle}>Stats debug</p>
                      <pre>{JSON.stringify(userStats.debug, null, 2)}</pre>
                    </div>
                  )}
                  <div className={styles.statsGrid}>
                    <div className={styles.statsCard}>
                      <div className={styles.statsPrimaryRow}>
                        <div>
                          <p className={styles.statsKicker}>Users</p>
                          <p className={styles.statsValue}>
                            {animatedStats.totalUsers.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className={styles.statsKicker}>Students</p>
                          <p className={styles.statsValue}>
                            {animatedStats.totalStudents.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className={styles.statsCaption}>
                        Registered users and their total student reach.
                      </p>
                      <div className={styles.statsDivider} aria-hidden="true" />
                      <div className={styles.statsList}>
                        <div
                          className={
                            statsVisibility.showCountries
                              ? styles.statsRowVisible
                              : styles.statsRowHidden
                          }
                        >
                          <span>Countries</span>
                          <strong>{animatedStats.totalCountries}</strong>
                        </div>
                        <div
                          className={
                            statsVisibility.showStates
                              ? styles.statsRowVisible
                              : styles.statsRowHidden
                          }
                        >
                          <span>US states</span>
                          <strong>{animatedStats.usStates}</strong>
                        </div>
                      </div>
                    </div>
                    <div className={styles.mapWrap}>
                      <div
                        className={`${styles.mapFrame} ${statsVisibility.showMap
                          ? styles.mapVisible
                          : styles.mapHidden
                          }`}
                        id="gp-world-map"
                        ref={mapContainerRef}
                      >
                        <p className={styles.mapCaption}>
                          Highlighted countries show where GP teachers are located.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.statsCtaRow}>
                    <Link className={styles.primaryButton} href="/account">
                      Log in
                    </Link>
                    <Link className={styles.secondaryButton} href="/gp-plus">
                      Create free account
                    </Link>
                  </div>
                </div>
              </section>

              <section
                className={`${styles.section} ${styles.sectionOrientation} ${styles.reveal}`}
                data-animate
              >
                <div className={styles.sectionInner}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.sectionKicker}>Start Here</p>
                      <h2>Pick your starting point</h2>
                      <p>
                        Start with a guide, a data-rich app, or a ready-to-teach
                        launch lesson.
                      </p>
                    </div>
                  </div>
                  <div className={styles.spotlightGrid}>
                    {spotlightResources.map((resource, index) => (
                      <article
                        key={resource.title}
                        className={`${styles.spotlightCard} ${styles.reveal} ${resource.id === "wizard" ? styles.spotlightWizard : ""
                          }`}
                        style={{ transitionDelay: `${index * 90}ms` }}
                        data-animate
                      >
                        <p className={styles.spotlightEyebrow}>
                          {resource.eyebrow}
                        </p>
                        <div className={styles.spotlightTitleRow}>
                          <h3>{resource.title}</h3>
                          <div className={styles.spotlightIcon}>
                            <resource.icon />
                          </div>
                        </div>
                        <p>{resource.description}</p>
                        <span className={styles.spotlightMeta}>{resource.meta}</span>
                        {resource.id === "wizard" && (
                          <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={handleOpenWizard}
                          >
                            Open the Easy Start Wizard
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className={`${styles.section} ${styles.sectionFresh}`}>
                <div className={styles.sectionInner}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.sectionKicker}>New + noteworthy</p>
                      <h2>Hot off the Press</h2>
                      <p>
                        Ready-to-go units that check all the boxes!
                      </p>
                    </div>
                  </div>
                  <div className={styles.pressChecks}>
                    {pressHighlights.map((item) => (
                      <span key={item} className={styles.pressCheck}>
                        <SquareCheckBig className={styles.pressCheckIcon} aria-hidden="true" />
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className={styles.newUnitGrid}>
                    {spotlightUnits.map((unit, index) => {
                      const mediaItems = unit.media ?? [];
                      const videoCount = mediaItems.filter(
                        (item) => item.type === "Video"
                      ).length;
                      const appCount = mediaItems.filter((item) => item.type === "App")
                        .length;
                      return (
                        <article
                          key={unit.id}
                          className={`${styles.newUnitCard} ${styles.reveal} ${index % 2 === 0
                            ? styles.newUnitCardLeft
                            : styles.newUnitCardRight
                            }`}
                          style={{ transitionDelay: `${index * 110}ms` }}
                          data-animate
                        >
                          <div className={styles.newUnitBody}>
                            <div className={styles.unitHeaderRow}>
                              <div className={styles.unitHeaderInfo}>
                                <div className={styles.unitBannerWrap}>
                                  <img src={unit.bannerUrl} alt="" loading="lazy" />
                                  {unit.isNew && (
                                    <span className={styles.newBadge}>New</span>
                                  )}
                                </div>
                                <div className={styles.cardHeader}>
                                  <h3>{unit.title}</h3>
                                </div>
                                <p className={styles.cardSubtitle}>{unit.subtitle}</p>
                                <div className={styles.cardMeta}>
                                  <span>{unit.subject}</span>
                                  <span>{unit.grades}</span>
                                  <span>
                                    {unit.lessons
                                      ? `${unit.lessons} lessons`
                                      : "Lessons"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className={styles.unitOverview}>
                              {unit.gistMarkdown ? (
                                <div className={styles.gistBlock}>
                                  <p className={styles.gistLabel}>The Gist</p>
                                  <RichText content={unit.gistMarkdown} />
                                </div>
                              ) : null}
                            </div>
                            <div className={styles.supportingMedia}>
                              <p className={styles.supportingMediaLabel}>
                                Supporting Media
                              </p>
                              {videoCount || appCount ? (
                                <div className={styles.supportingMediaList}>
                                  {videoCount > 0 && (
                                    <span>
                                      <Youtube aria-hidden="true" />
                                      {videoCount} Videos
                                    </span>
                                  )}
                                  {appCount > 0 && (
                                    <span>
                                      <Laptop aria-hidden="true" />
                                      {appCount} Apps
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className={styles.mediaEmpty}>
                                  Media previews are coming soon.
                                </p>
                              )}
                            </div>
                            <div className={styles.cardActions}>
                              <Link
                                className={styles.primaryButton}
                                href={buildUnitPath(unit.id)}
                              >
                                Take Me to the Unit
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className={`${styles.sectionAlt} ${styles.reveal}`} data-animate>
                <div className={styles.sectionInner}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.sectionKicker}>Latest from the GP Blog</p>
                      <h2>Stories, research, and classroom sparks</h2>
                      <p>
                        Fresh ideas and standout stories from the Galactic Polymath
                        community.
                      </p>
                    </div>
                  </div>
                  <div className={styles.blogGrid}>
                    {displayedBlogPosts.map((post, index) => (
                      <article
                        key={post.id}
                        className={`${styles.blogCard} ${styles.reveal}`}
                        style={{ transitionDelay: `${index * 120}ms` }}
                        data-animate
                      >
                        <a href={post.url} className={styles.blogCardLink}>
                          <div className={styles.blogImage}>
                            {post.imageUrl ? (
                              <img src={post.imageUrl} alt="" loading="lazy" />
                            ) : (
                              <div className={styles.blogImageFallback} />
                            )}
                          </div>
                          <div className={styles.blogBody}>
                            <p className={styles.blogMeta}>
                              {post.categoryLabel}
                              {post.authorName ? ` | ${post.authorName}` : ""}
                            </p>
                            <h3>{post.title}</h3>
                            <p className={styles.blogExcerpt}>
                              {post.excerpt || "Read the latest from GP."}
                            </p>
                            <span className={styles.blogButton}>Read More</span>
                          </div>
                        </a>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className={`${styles.jobvizToursSection} ${styles.reveal}`} data-animate>
                <div className={styles.jobvizToursBg} aria-hidden="true" />
                <div className={styles.jobvizToursInner}>
                  <div className={styles.jobvizToursCopy}>
                    <div className={styles.jobvizToursLogo}>
                      <Image
                        src="/imgs/jobViz/jobviz_rocket_logo_color.svg"
                        alt="JobViz logo"
                        width={120}
                        height={120}
                        style={{ width: "100%", height: "auto" }}
                      />
                    </div>
                    <p className={styles.sectionKicker}>JobViz Career Tours</p>
                    <h2>Connect Abstract Concepts to Future Opportunities!</h2>
                    <p>
                      When we say &quot;You can do anything with your life if you work hard&quot;, let&apos;s
                      unpack what that means! Let your students explore basic details and
                      stats for 800+ jobs.
                    </p>
                    <div className={styles.jobvizToursActions}>
                      <Link href="/jobviz" className={styles.secondaryButton}>
                        Open JobViz Explorer
                        <span className={styles.jobvizToursActionPill}>FREE</span>
                      </Link>
                    </div>
                  </div>
                  <div className={styles.jobvizToursShowcase}>
                    <Link
                      href="/search?typeFilter=Job%20Tour&tourScope=unit"
                      className={styles.jobvizToursTile}
                    >
                      <span
                        className={`${styles.resourceBadgePlus} ${styles.jobvizToursPillPlus}`}
                      >
                        <img src="/plus/plus.png" alt="" aria-hidden="true" />
                        GP+
                      </span>
                      <p className={styles.jobvizToursTileKicker}>GP Team Tours</p>
                      <h3>Unit-aligned job tours</h3>
                      <p>
                        All our units have a pre-built tour of 6-8 jobs connected to the
                        standards-aligned content.
                      </p>
                    </Link>
                    <Link
                      href="/search?typeFilter=Job%20Tour&tourScope=community"
                      className={styles.jobvizToursTile}
                    >
                      <span
                        className={`${styles.resourceBadgePlus} ${styles.jobvizToursPillPlus}`}
                      >
                        <img src="/plus/plus.png" alt="" aria-hidden="true" />
                        GP+
                      </span>
                      <p className={styles.jobvizToursTileKicker}>Teacher Templates</p>
                      <h3>Copy, remix, share</h3>
                      <p>
                        Start from community tours or build one from scratch
                        with GP+ editing tools.
                      </p>
                    </Link>
                  </div>
                </div>
              </section>

              <div
                className={`${styles.sectionDivider} ${styles.sectionDividerSoft}`}
                aria-hidden="true"
              />

              <section className={`${styles.section} ${styles.reveal}`} data-animate>
                <div className={styles.sectionInner}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.sectionKicker}>What teachers ask</p>
                      <h2>FAQ</h2>
                    </div>
                  </div>
                  <div className={styles.faqList}>
                    {quickFAQ.map((item) => (
                      <details
                        key={item.question}
                        className={`${styles.faqItem} ${styles.reveal}`}
                        data-animate
                      >
                        <summary>{item.question}</summary>
                        <p>{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </section>
            </main>
          </>
        )}

      </div>
      <Footer />
      {activeModal && (
        <div className={styles.modalOverlay} role="presentation">
          <div
            className={`${styles.modal} ${activeModal === "media" ? styles.mediaModal : ""
              }`}
            role="dialog"
            aria-modal="true"
            ref={modalRef}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalKicker}>
                  {activeModal === "wizard"
                    ? "Easy Start Wizard"
                    : activeMedia?.type ?? "Media preview"}
                </p>
                <h2 className={styles.modalTitle}>
                  {activeModal === "wizard"
                    ? "Tell us your goals"
                    : activeMedia?.title ?? "Preview"}
                </h2>
              </div>
              <button
                className={styles.modalClose}
                type="button"
                onClick={handleCloseModal}
                ref={closeButtonRef}
              >
                Close
              </button>
            </div>
            {activeModal === "wizard" && (
              <div className={styles.wizardCard}>
                <div className={styles.wizardHeader}>
                  <div>
                    <p className={styles.wizardKicker}>Easy Start Wizard</p>
                    <h2>Tell us your goals</h2>
                  </div>
                  <span className={styles.wizardBadge}>3 steps</span>
                </div>
                <div className={styles.wizardStep}>
                  <p>1. Which grade band do you teach?</p>
                  <div className={styles.pillRow}>
                    <span className={styles.pill}>Upper Elementary</span>
                    <span className={styles.pillActive}>Middle School</span>
                    <span className={styles.pill}>High School</span>
                    <span className={styles.pill}>College</span>
                  </div>
                </div>
                <div className={styles.wizardStep}>
                  <p>2. Which subject focus fits you best?</p>
                  <div className={styles.pillRow}>
                    <span className={styles.pill}>Life Science</span>
                    <span className={styles.pill}>Earth &amp; Space</span>
                    <span className={styles.pillActive}>STEM + Careers</span>
                    <span className={styles.pill}>Engineering</span>
                  </div>
                </div>
                <div className={styles.wizardStep}>
                  <p>3. What do you want students to practice?</p>
                  <div className={styles.pillRow}>
                    <span className={styles.pillActive}>
                      Authentic research
                    </span>
                    <span className={styles.pill}>Career connections</span>
                    <span className={styles.pill}>Question formation</span>
                  </div>
                </div>
                <div className={styles.wizardFooter}>
                  <button className={styles.primaryButton} type="button">
                    Build my path
                  </button>
                  <button
                    className={styles.ghostButton}
                    type="button"
                    onClick={handleCloseModal}
                  >
                    Close wizard
                  </button>
                </div>
              </div>
            )}
            {activeModal === "media" && activeMedia && (
              <div className={styles.mediaModalBody}>
                <div className={styles.mediaModalActions}>
                  <button
                    type="button"
                    className={styles.mediaCopyButton}
                    onClick={async () => {
                      const shareLink = buildShareableMediaLink(activeMedia.link);
                      if (!shareLink) return;
                      try {
                        await navigator.clipboard.writeText(shareLink);
                        toast.success("Link Copied");
                        return;
                      } catch (error) {
                        // Fall back to a basic copy method.
                      }
                      try {
                        const textarea = document.createElement("textarea");
                        textarea.value = shareLink;
                        textarea.style.position = "fixed";
                        textarea.style.opacity = "0";
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand("copy");
                        document.body.removeChild(textarea);
                        toast.success("Link Copied");
                      } catch (error) {
                        toast.error("Unable to copy link");
                      }
                    }}
                  >
                    <FiShare2 aria-hidden="true" />
                    Copy Link to Clipboard
                  </button>
                </div>
                <div className={styles.mediaPlayer}>
                  {activeMedia.link && getYoutubeId(activeMedia.link) ? (
                    <iframe
                      title={activeMedia.title}
                      src={`https://www.youtube.com/embed/${getYoutubeId(
                        activeMedia.link
                      )}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img src={activeMedia.thumbnail} alt="" />
                  )}
                </div>
                {activeMedia.lessonRelevance && (
                  <p className={styles.mediaLessonRelevance}>
                    {activeMedia.lessonRelevance}
                  </p>
                )}
                {activeMedia.unitId && activeMedia.unitTitle && (
                  <p className={styles.mediaConnected}>
                    Connected to:{" "}
                    <Link href={buildUnitPath(activeMedia.unitId)}>
                      {activeMedia.unitTitle}
                      {activeMedia.subtitle ? `: ${activeMedia.subtitle}` : ""}
                    </Link>
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            className={styles.modalBackdrop}
            type="button"
            onClick={handleCloseModal}
            aria-label="Close modal"
          />
        </div>
      )}
      {jobTourAccessResource && (
        <div className={styles.modalOverlay} role="presentation">
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="JobViz tour access"
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalKicker}>JobViz+ Career Tour</p>
                <h2 className={styles.modalTitle}>
                  {jobTourAccessResource.title}
                </h2>
              </div>
              <button
                className={styles.modalClose}
                type="button"
                onClick={handleCloseJobTourAccessModal}
              >
                Close
              </button>
            </div>
            <div className={styles.wizardCard}>
              <p className={styles.resourceDescription}>
                {hasGpPlusAccess
                  ? "Open this tour in teacher mode to edit, or open/copy the student-facing link."
                  : "Preview the first 2 jobs in student view. GP+ unlocks assigning and creating full tours."}
              </p>
              <div className={styles.wizardFooter}>
                {hasGpPlusAccess ? (
                  <>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={handleOpenTourTeacherMode}
                    >
                      Open as Teacher
                    </button>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={handleOpenTourStudentMode}
                    >
                      Open as Student
                    </button>
                    <button
                      className={styles.ghostButton}
                      type="button"
                      disabled={isCopyingStudentLink}
                      onClick={handleCopyTourStudentLink}
                    >
                      {isCopyingStudentLink ? "Copying..." : "Copy Student Link"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={handleOpenTourPreview}
                    >
                      Preview as Student
                    </button>
                    <Link href="/gp-plus" className={styles.secondaryButton}>
                      Get GP+ to Assign or Create
                    </Link>
                    <button
                      className={styles.ghostButton}
                      type="button"
                      onClick={handleCloseJobTourAccessModal}
                    >
                      Not now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
