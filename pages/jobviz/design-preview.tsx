import Head from "next/head";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiBookOpen,
  FiCompass,
  FiGrid,
  FiLayers,
  FiPlay,
  FiPlayCircle,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { useRouter } from "next/router";
import useSiteSession from "../../customHooks/useSiteSession";
import { ListFilter, Menu, Search } from "lucide-react";
import type { IconType } from "react-icons";
import { MdOutlineSchool } from "react-icons/md";
import styles from "./design-preview.module.css";
import { getUnitLessons, retrieveUnits } from "../../backend/services/unitServices";
import { createDbProjections, getLiveUnits } from "../../shared/fns";
import { INewUnitSchema } from "../../backend/models/Unit/types/unit";
import sanitizeHtml from "sanitize-html";
import RichText from "../../components/RichText";
import GpLogo from "../../public/GP_bubbleLogo300px.png";
import {
  FrontEndUserStats,
  getFrontEndUserStats,
} from "../../backend/services/userStatsService";
import { IUnitLesson } from "../../types/global";

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
  careerConnections: string[];
  sponsorText: string;
  sponsorMarkdown: string;
  sponsorLogo: string | null;
  media: MediaItem[];
  targetSubject: string;
  subjectConnections: string[];
  locale: string;
}

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

interface TeacherPortalPreviewProps {
  featuredUnits: PreviewUnit[];
  allUnits: PreviewUnit[];
  lessons: IUnitLesson[];
  userStats: FrontEndUserStats;
  blogPosts: BlogPost[];
}

const NAV_TABS = ["All", "Units", "Apps", "Videos", "Lessons"];
type NavTab = (typeof NAV_TABS)[number] | "Home";
const QUERY_KEYS = ["q", "target", "aligned", "grade", "tag", "locale"] as const;

type ResourceType = "Unit" | "Lesson" | "Video" | "App";

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
  isNew?: boolean;
  isPlus?: boolean;
  accent: string;
  icon: IconType;
}

const experiencePillars = [
  {
    title: "Interdisciplinary by design",
    description:
      "Every unit blends science, storytelling, and data so teachers can anchor standards in real contexts.",
    icon: FiLayers,
  },
  {
    title: "Open-access and teacher-friendly",
    description:
      "No paywalls for core lessons. Optional GP+ adds editable files and workflow boosts.",
    icon: FiUsers,
  },
  {
    title: "Built with experts",
    description:
      "Developed alongside STEM researchers, classroom teachers, and creative partners.",
    icon: FiCompass,
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
    return "Intro College";
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
    return "Intro College";
  }
  if (min <= 5 && max <= 8) {
    return "Middle School";
  }
  return "High School";
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

const getDriveThumbnail = (url?: string | null) => {
  if (!url || !url.includes("drive.google")) return null;
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const id = idMatch?.[1] ?? url.split("/").at(-2);
  return id ? `https://drive.google.com/thumbnail?id=${id}` : null;
};

const buildMediaItems = (
  unit: INewUnitSchema,
  fallbackThumbnail: string
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
      };
    });
};

export async function getStaticProps() {
  try {
    const userStats = await getFrontEndUserStats();
    const { data: retrievedUnits } = await retrieveUnits(
      {},
      createDbProjections(PROJECTED_UNITS_FIELDS),
      0,
      { ReleaseDate: -1 }
    );
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
      return {
        id: `${unit.numID ?? unit._id ?? unit.Title}`,
        title: unit.Title || "Untitled unit",
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
        targetStandards: getTargetStandards(unit).slice(0, 4),
        careerConnections: getCareerConnections(unit).slice(0, 4),
        sponsorText: toPlainText(sponsorMarkdown) || "Sponsored by partners.",
        sponsorMarkdown,
        sponsorLogo: getSponsorLogo(unit.SponsorLogo),
        media: buildMediaItems(unit, bannerUrl).slice(0, 4),
        targetSubject,
        subjectConnections: getSubjectConnections(unit, targetSubject),
        locale: unit.locale ?? "en-US",
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
    console.error("Teacher portal design preview failed to load units.", error);
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

export default function TeacherPortalDesignPreview({
  featuredUnits,
  allUnits,
  lessons = [],
  userStats,
  blogPosts,
}: TeacherPortalPreviewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavTab>("Home");
  const [activeModal, setActiveModal] = useState<"wizard" | "media" | null>(
    null
  );
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [showStatsDebug, setShowStatsDebug] = useState(false);
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
  const isHomeView = activeTab === "Home";
  const isAllView = activeTab === "All";
  const handleTabClick = (tab: NavTab) => setActiveTab(tab);
  const handleHomeClick = () => setActiveTab("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTargetSubjects, setSelectedTargetSubjects] = useState<string[]>(
    []
  );
  const [selectedAlignedSubjects, setSelectedAlignedSubjects] = useState<string[]>(
    []
  );
  const [selectedGradeBands, setSelectedGradeBands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { status, user, isGpPlusMember, logUserOut } = useSiteSession();
  const isAuthenticated = status === "authenticated";
  const avatarUrl = user?.image ?? null;
  const isPlusMember = isGpPlusMember === true || isGpPlusMember === "true";
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const handleOpenWizard = () => setActiveModal("wizard");
  const handleCloseModal = () => {
    setActiveModal(null);
    setActiveMedia(null);
  };
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

    allUnits.forEach((unit) => {
      const tags = [
        ...unit.careerConnections,
        ...unit.subjectConnections,
      ]
        .filter(Boolean)
        .slice(0, 6);
      const gradeBand = unit.grades;
      const gradeBandGroup = getGradeBandGroup(gradeBand);

      resources.push({
        id: unit.id,
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
        isNew: unit.isNew,
        isPlus: false,
        accent: getAccent(unit.targetSubject || unit.subject),
        icon: FiBookOpen,
      });

      unit.media?.forEach((media, index) => {
        resources.push({
          id: `${unit.id}-${media.type}-${index}`,
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
          isNew: unit.isNew,
          isPlus: false,
          accent: getAccent(unit.targetSubject || unit.subject),
          icon: media.type === "Video" ? FiPlayCircle : FiGrid,
        });
      });
    });

    lessons.forEach((lesson, index) => {
      const unit = unitByTitle.get(lesson.unitTitle || "") ?? null;
      const gradeLabel =
        lesson.grades || lesson.gradesOrYears || unit?.grades || "Grades 6-12";
      const gradeBandGroup = getGradeBandGroup(gradeLabel);
      const alignedSubjects = unit?.subjectConnections ?? [];
      const tags = lesson.tags ?? alignedSubjects;

      resources.push({
        id: `lesson-${lesson.lessonPartNum ?? index}`,
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
        isNew: false,
        isPlus: false,
        accent: getAccent(unit?.targetSubject || unit?.subject),
        icon: FiBookOpen,
      });
    });

    return resources;
  }, [allUnits, lessons]);

  const targetSubjectOptions = useMemo(() => {
    const subjects = new Set<string>();
    allResources.forEach((resource) => {
      if (resource.subject) {
        subjects.add(resource.subject);
      }
    });
    return Array.from(subjects).sort((a, b) => a.localeCompare(b));
  }, [allResources]);

  const alignedSubjectOptions = useMemo(() => {
    const subjects = new Set<string>();
    allResources.forEach((resource) => {
      resource.alignedSubjects.forEach((subject) => subjects.add(subject));
    });
    return Array.from(subjects).sort((a, b) => a.localeCompare(b));
  }, [allResources]);

  const gradeBandOptions = useMemo(
    () => ["Upper Elementary", "Middle School", "High School", "Intro College"],
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
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [allResources]);

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

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allResources.filter((resource) => {
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
      const haystack = [
        resource.title,
        resource.description,
        resource.subject,
        resource.gradeBand,
        resource.tags.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [
    allResources,
    searchQuery,
    selectedTargetSubjects,
    selectedAlignedSubjects,
    selectedGradeBands,
    selectedTags,
    selectedLocales,
  ]);

  const totalResources = allResources.length;
  const hasActiveFilters =
    selectedTargetSubjects.length > 0 ||
    selectedAlignedSubjects.length > 0 ||
    selectedGradeBands.length > 0 ||
    selectedTags.length > 0 ||
    selectedLocales.length > 0 ||
    searchQuery.trim().length > 0;
  const hasActiveFilterChips =
    selectedTargetSubjects.length > 0 ||
    selectedAlignedSubjects.length > 0 ||
    selectedGradeBands.length > 0 ||
    selectedTags.length > 0 ||
    selectedLocales.length > 0;
  const resultsCount = hasActiveFilters ? filteredResources.length : totalResources;
  const totalUnits = allUnits.length;
  const totalVideos = allUnits.reduce(
    (count, unit) => count + (unit.media?.filter((item) => item.type === "Video").length ?? 0),
    0
  );
  const totalApps = allUnits.reduce(
    (count, unit) => count + (unit.media?.filter((item) => item.type === "App").length ?? 0),
    0
  );

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

      const { default: SvgMap } = await import("svgmap");

      if (!isMounted || !container) {
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
  }, [activeTab]);

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
    if (!router.isReady) return;
    const query = router.query;
    const queryText = Array.isArray(query.q) ? query.q[0] : query.q;
    const nextSearch = typeof queryText === "string" ? queryText : "";
    const nextTarget = parseQueryArray(query.target);
    const nextAligned = parseQueryArray(query.aligned);
    const nextGrade = parseQueryArray(query.grade);
    const nextTag = parseQueryArray(query.tag);
    const nextLocale = parseQueryArray(query.locale);
    const hasQueryFilters =
      nextSearch ||
      nextTarget.length ||
      nextAligned.length ||
      nextGrade.length ||
      nextTag.length ||
      nextLocale.length;

    setSearchQuery(nextSearch);
    setSelectedTargetSubjects(nextTarget);
    setSelectedAlignedSubjects(nextAligned);
    setSelectedGradeBands(nextGrade);
    setSelectedTags(nextTag);
    setSelectedLocales(nextLocale);
    setActiveTab(hasQueryFilters ? "All" : "Home");
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!isAllView) {
      const cleared = buildQueryObject({
        q: undefined,
        target: [],
        aligned: [],
        grade: [],
        tag: [],
        locale: [],
      });
      if (normalizeQuery(router.query) !== normalizeQuery(cleared)) {
        router.replace({ pathname: router.pathname, query: cleared }, undefined, {
          shallow: true,
          scroll: false,
        });
      }
      return;
    }

    const query = buildQueryObject({
      q: searchQuery.trim() || undefined,
      target: selectedTargetSubjects,
      aligned: selectedAlignedSubjects,
      grade: selectedGradeBands,
      tag: selectedTags,
      locale: selectedLocales,
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
    selectedTargetSubjects,
    selectedAlignedSubjects,
    selectedGradeBands,
    selectedTags,
    selectedLocales,
  ]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current) return;
      if (!accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const updateCollapse = () => setFiltersCollapsed(mediaQuery.matches);
    updateCollapse();
    mediaQuery.addEventListener("change", updateCollapse);
    return () => mediaQuery.removeEventListener("change", updateCollapse);
  }, []);

  return (
    <>
      <Head>
        <title>Teacher Portal Preview | Galactic Polymath</title>
        <meta
          name="description"
          content="Preview the next-generation Galactic Polymath teacher portal with onboarding, search, and curated resources."
        />
      </Head>
      <div className={styles.page}>
        <nav className={styles.nav}>
          <button
            className={styles.brandButton}
            type="button"
            onClick={handleHomeClick}
            aria-label="Go to the GP Teacher Portal home preview"
          >
            <div className={styles.brand}>
              <div className={styles.brandLogo}>
                <Image src={GpLogo} alt="Galactic Polymath" priority />
              </div>
              <div>
                <p className={styles.brandTitle}>
                  GP Teacher
                  <span className={styles.brandTitleBreak}>Portal</span>
                </p>
                <p className={styles.brandSubtitle}>
                  Interdisciplinary science for grades 5-12+
                </p>
              </div>
            </div>
          </button>
          <button
            className={styles.navToggle}
            type="button"
            aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((prev) => !prev)}
          >
            <Menu aria-hidden="true" />
          </button>
          <div className={`${styles.navRight} ${navOpen ? styles.navRightOpen : ""}`}>
            <div
              className={styles.navTabs}
              role="tablist"
              aria-label="Resource types"
            >
              {NAV_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.navTab} ${
                    activeTab === tab ? styles.navTabActive : ""
                  }`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div
              className={`${styles.profileSlot} ${
                accountMenuOpen ? styles.profileSlotOpen : ""
              }`}
              ref={accountMenuRef}
            >
              {isAuthenticated ? (
                <button
                  className={styles.profileToggle}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={accountMenuOpen}
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                >
                  <div
                    className={`${styles.profileAvatarRing} ${
                      isPlusMember
                        ? styles.profileAvatarPlus
                        : styles.profileAvatarFree
                    }`}
                    aria-hidden="true"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className={styles.profileAvatarImage}
                      />
                    ) : (
                      <span className={styles.profileAvatarFallback}>GP</span>
                    )}
                  </div>
                  <span className={styles.profileButton}>Account</span>
                </button>
              ) : (
                <>
                  <div
                    className={`${styles.profileAvatarRing} ${
                      isPlusMember
                        ? styles.profileAvatarPlus
                        : styles.profileAvatarFree
                    }`}
                    aria-hidden="true"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className={styles.profileAvatarImage}
                      />
                    ) : (
                      <span className={styles.profileAvatarFallback}>GP</span>
                    )}
                  </div>
                  <Link className={styles.profileButton} href="/account">
                    Log in
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <div
                  className={styles.accountMenu}
                  role="menu"
                  aria-hidden={!accountMenuOpen}
                >
                  <div
                    className={styles.accountMenuDivider}
                    role="presentation"
                  />
                  <Link className={styles.accountMenuItem} href="/account">
                    View Account
                  </Link>
                  <button
                    className={styles.accountMenuItem}
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      logUserOut();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
        {isAllView && (
          <>
            <header className={styles.allHero}>
              <div className={styles.allHeroGlow} aria-hidden="true" />
              <div className={styles.allHeroInner}>
                <div className={styles.allHeroCopy}>
                  <p className={styles.kicker}>All resources</p>
                  <h1 className={styles.allHeroTitle}>
                    Search every unit, lesson, app, and video in one place.
                  </h1>
                  <p className={styles.allHeroLead}>
                    Filter by grade band, subject focus, and classroom format to
                    find the best-fit resources fast. GP+ extras stay clearly
                    labeled so you can plan with confidence.
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
              <section className={styles.allShell}>
                <div className={styles.allSearchRow}>
                  <div className={styles.searchBar}>
                    <Search className={styles.searchIcon} aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="Search by title, standards, or skill..."
                      aria-label="Search all resources"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    <button className={styles.allSearchButton} type="button">
                      Search
                    </button>
                  </div>
                </div>
                <aside
                  className={`${styles.allFiltersPanel} ${
                    filtersCollapsed ? styles.allFiltersPanelCollapsed : ""
                  }`}
                >
                  <div className={styles.filterHeader}>
                    <div>
                      <p className={styles.filterKicker}>Refine results</p>
                      <h2>Filters</h2>
                    </div>
                    <div className={styles.filterHeaderActions}>
                      <button
                        className={styles.filterReset}
                        type="button"
                        onClick={() => {
                          setSelectedTargetSubjects([]);
                          setSelectedAlignedSubjects([]);
                          setSelectedGradeBands([]);
                          setSelectedTags([]);
                          setSelectedLocales([]);
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
                            Filter
                          </span>
                        )}
                        <ListFilter aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className={styles.filterContent}>
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
                        {tagOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={
                              selectedTags.includes(option)
                                ? styles.filterPillActive
                                : styles.filterPill
                            }
                            onClick={() =>
                              toggleSelection(option, selectedTags, setSelectedTags)
                            }
                          >
                            {option}
                          </button>
                        ))}
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
                      <button className={styles.primaryButton} type="button">
                        Apply filters
                      </button>
                      <button className={styles.ghostButton} type="button">
                        Save view
                      </button>
                    </div>
                  </div>
                </aside>
                <div className={styles.allResults}>
                  <div className={styles.resultsHeader}>
                    <div className={styles.resultsKicker}>
                      <span>
                        Showing {resultsCount} Results from All Resources
                      </span>
                    </div>
                    <div className={styles.resultsControls}>
                      <button
                        className={styles.resultsControlActive}
                        type="button"
                      >
                        <FiGrid aria-hidden="true" /> Grid
                      </button>
                      <button className={styles.resultsControl} type="button">
                        List
                      </button>
                      <select
                        className={styles.resultsSelect}
                        aria-label="Sort all resources"
                      >
                        <option>Most relevant</option>
                        <option>Newest</option>
                        <option>Most assigned</option>
                        <option>Shortest prep</option>
                      </select>
                    </div>
                  </div>
                  <div
                    className={`${styles.resultsChips} ${
                      hasActiveFilterChips ? "" : styles.resultsChipsEmpty
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
                    ].map((chip) => (
                      <span key={chip} className={styles.activeChip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                  <div className={styles.resourceGrid}>
                    {filteredResources.map((resource) => {
                      const ResourceIcon = resource.icon;
                      return (
                        <article
                          key={resource.id}
                          className={styles.resourceCard}
                          style={
                            {
                              "--card-accent": resource.accent,
                            } as React.CSSProperties
                          }
                        >
                          <div className={styles.resourceMedia}>
                            <img src={resource.image} alt="" loading="lazy" />
                          </div>
                          <div className={styles.resourceContent}>
                            <div className={styles.resourceHeader}>
                              <div>
                                <h3>{resource.title}</h3>
                                <p className={styles.resourceDescription}>
                                  {resource.description}
                                </p>
                              </div>
                              <div className={styles.resourceHeaderMeta}>
                                <span className={styles.resourceTypePill}>
                                  <ResourceIcon aria-hidden="true" />
                                  {resource.type.toLowerCase()}
                                </span>
                                {(resource.isNew || resource.isPlus) && (
                                  <div className={styles.resourceBadges}>
                                    {resource.isNew && (
                                      <span className={styles.resourceBadge}>
                                        New
                                      </span>
                                    )}
                                    {resource.isPlus && (
                                      <span className={styles.resourceBadgePlus}>
                                        GP+
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={styles.resourceMetaRow}>
                              {resource.subject && (
                                <span className={styles.resourceSubject}>
                                  {resource.subject}
                                </span>
                              )}
                              <span>{resource.gradeBand}</span>
                              <span>{resource.timeLabel}</span>
                              {resource.rating && (
                                <span className={styles.resourceRating}>
                                  <FiStar aria-hidden="true" />
                                  {resource.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <div className={styles.resourceTags}>
                              {resource.tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                              ))}
                            </div>
                            <div className={styles.resourceActions}>
                              <button
                                className={styles.primaryButton}
                                type="button"
                              >
                                Preview
                              </button>
                              <button
                                className={styles.ghostButton}
                                type="button"
                              >
                                Add to plan
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
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
                  <p className={styles.kicker}>Open-access, expert-built science.</p>
                  <h1 className={styles.heroTitle}>
                    A clear landing place for teachers who want real-world science,
                    not just astronomy.
                  </h1>
                  <p className={styles.heroLead}>
                    Galactic Polymath delivers interdisciplinary lesson arcs and
                    career pathways that help students see science in context.
                    Everything starts free; GP+ adds editable files and streamlined
                    prep.
                  </p>
                  <div className={styles.heroActions}>
                    <button className={styles.secondaryButton} type="button">
                      Browse latest resources
                    </button>
                  </div>
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
                    <div className={styles.searchBar}>
                      <Search className={styles.searchIcon} aria-hidden="true" />
                      <input
                        type="text"
                        placeholder="Search by title, topic, standards, or skill..."
                        aria-label="Search resources"
                      />
                    </div>
                  </div>
                  <div className={styles.heroCarousel}>
                    {carouselImages.map((src, index) => (
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className={`${styles.heroCarouselImage} ${
                          index === carouselIndex ? styles.heroCarouselActive : ""
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
                        className={`${styles.mapFrame} ${
                          statsVisibility.showMap
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
                        className={`${styles.spotlightCard} ${styles.reveal} ${
                          resource.id === "wizard" ? styles.spotlightWizard : ""
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
                  <div className={styles.newUnitGrid}>
                    {spotlightUnits.map((unit, index) => {
                      const mediaItems = unit.media ?? [];
                      const videoCount = mediaItems.filter(
                        (item) => item.type === "Video"
                      ).length;
                      const appCount = mediaItems.filter((item) => item.type === "App")
                        .length;
                      const subjectConnections = summarizeList(
                        unit.subjectConnections,
                        2
                      );
                      const targetStandards = summarizeList(
                        unit.targetStandards, 1
                      );
                      const careerConnections = summarizeList(
                        unit.careerConnections,
                        1
                      );

                      return (
                        <article
                          key={unit.id}
                          className={`${styles.newUnitCard} ${styles.reveal}`}
                          style={{ transitionDelay: `${index * 110}ms` }}
                          data-animate
                        >
                          <div className={styles.newUnitBody}>
                            <div className={styles.unitHeaderRow}>
                              <div className={styles.unitHeaderInfo}>
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
                                <div className={styles.unitBannerWrap}>
                                  <img src={unit.bannerUrl} alt="" loading="lazy" />
                                  {unit.isNew && (
                                    <span className={styles.newBadge}>New</span>
                                  )}
                                </div>
                              </div>
                              <div className={styles.sponsorPanel}>
                                <p className={styles.sponsorTitle}>Sponsored by</p>
                                {unit.sponsorLogo && (
                                  <div className={styles.sponsorLogo}>
                                    <img src={unit.sponsorLogo} alt="" />
                                  </div>
                                )}
                                {unit.sponsorMarkdown ? (
                                  <RichText
                                    content={unit.sponsorMarkdown}
                                    className={styles.sponsorText}
                                  />
                                ) : (
                                  <p className={styles.sponsorText}>
                                    {unit.sponsorText}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className={styles.unitOverview}>
                              {unit.gistMarkdown ? (
                                <div className={styles.gistBlock}>
                                  <p className={styles.gistLabel}>The Gist</p>
                                  <RichText content={unit.gistMarkdown} />
                                </div>
                              ) : null}
                              <div className={styles.unitConnections}>
                                <div className={styles.epauletteBlock}>
                                  <p className={styles.overviewLabel}>Epaulette</p>
                                  <div className={styles.epauletteWrap}>
                                    {unit.epaulette && (
                                      <img src={unit.epaulette} alt="" />
                                    )}
                                  </div>
                                </div>
                                <div className={styles.unitConnectionsTextBlock}>
                                  <p className={styles.unitConnectionsLabel}>
                                    Quick connections
                                  </p>
                                  <p className={styles.unitConnectionsText}>
                                    <strong>Targets:</strong> {unit.targetSubject}
                                    .{" "}
                                    {subjectConnections
                                      ? `Connects to ${subjectConnections}.`
                                      : "Connects to additional subjects to be added."}
                                  </p>
                                  <p className={styles.unitConnectionsText}>
                                    <strong>Standards:</strong>{" "}
                                    {targetStandards ?? "Not listed yet."}
                                  </p>
                                  <p className={styles.unitConnectionsText}>
                                    <strong>Connected careers:</strong>{" "}
                                    {careerConnections ??
                                      "JobViz connections coming soon."}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className={styles.resourceBlock}>
                              <p>Associated videos/apps</p>
                              {mediaItems.length ? (
                                <>
                                  <div className={styles.resourceSummary}>
                                    <span>{videoCount} videos</span>
                                    <span>{appCount} apps</span>
                                  </div>
                                  <div className={styles.mediaGrid}>
                                    {mediaItems.map((media) => (
                                      <button
                                        key={`${unit.id}-${media.title}`}
                                        type="button"
                                        className={styles.mediaCard}
                                        onClick={() => handleOpenMedia(media)}
                                      >
                                        <div className={styles.mediaThumb}>
                                          <img src={media.thumbnail} alt="" />
                                          <span className={styles.mediaBadge}>
                                            {media.type}
                                          </span>
                                        </div>
                                        <span className={styles.mediaTitle}>
                                          {media.title}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <p className={styles.mediaEmpty}>
                                  Media previews are coming soon.
                                </p>
                              )}
                            </div>
                            <div className={styles.cardActions}>
                              <button className={styles.primaryButton} type="button">
                                Take Me to the Unit
                              </button>
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

        {!isAllView && !isHomeView && (
          <main className={styles.comingSoonMain}>
            <div className={styles.comingSoonCard}>
              <p className={styles.sectionKicker}>Preview in progress</p>
              <h2>{activeTab} content</h2>
              <p>
                We are building dedicated browse pages for every format. The All
                view shows the full filter system in the meantime.
              </p>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => handleTabClick("All")}
              >
                Back to All resources
              </button>
            </div>
          </main>
        )}
      </div>
      {activeModal && (
        <div className={styles.modalOverlay} role="presentation">
          <div
            className={styles.modal}
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
                    <span className={styles.pill}>Intro College</span>
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
                <div className={styles.mediaModalThumb}>
                  <img src={activeMedia.thumbnail} alt="" />
                </div>
                <p>
                  This is a placeholder preview for the{" "}
                  {activeMedia.type.toLowerCase()}. The final version can open
                  the real video or app in a new panel.
                </p>
                {activeMedia.link ? (
                  <a
                    className={styles.primaryButton}
                    href={activeMedia.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open {activeMedia.type}
                  </a>
                ) : (
                  <button className={styles.primaryButton} type="button">
                    Open {activeMedia.type}
                  </button>
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
    </>
  );
}
