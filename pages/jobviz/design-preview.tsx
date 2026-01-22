import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiCompass, FiLayers, FiUsers, FiPlayCircle, FiPlay } from "react-icons/fi";
import { MdOutlineSchool } from "react-icons/md";
import styles from "./design-preview.module.css";
import { retrieveUnits } from "../../backend/services/unitServices";
import { createDbProjections, getLiveUnits } from "../../shared/fns";
import { INewUnitSchema } from "../../backend/models/Unit/types/unit";
import sanitizeHtml from "sanitize-html";
import RichText from "../../components/RichText";
import GpLogo from "../../assets/img/gp_logo_white_transBG.png";
import {
  FrontEndUserStats,
  getFrontEndUserStats,
} from "../../backend/services/userStatsService";

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
}

interface TeacherPortalPreviewProps {
  featuredUnits: PreviewUnit[];
  userStats: FrontEndUserStats;
}

const NAV_TABS = ["All", "Units", "Apps", "Videos", "Lessons"];

const wizardTracks = [
  {
    title: "Showcase authentic science",
    description: "Highlight diverse researchers and real-world inquiry.",
    cta: "Start SciJourneys",
    icon: MdOutlineSchool,
  },
  {
    title: "Connect learning to careers",
    description: "Use JobViz and career storylines to anchor lessons.",
    cta: "Launch JobViz",
    icon: FiCompass,
  },
  {
    title: "Build question-asking skills",
    description: "Guide students through observation and curiosity routines.",
    cta: "Open FairyWrens",
    icon: FiLayers,
  },
];

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
    title: "GP Classroom Starter",
    eyebrow: "Teacher Orientation",
    description:
      "A short path to understand how to teach with GP in your first week.",
    meta: "15 minutes · Printable checklist",
    icon: FiPlayCircle,
  },
  {
    title: "JobViz Career Explorer",
    eyebrow: "Interactive App",
    description:
      "Help students map interests to real careers using curated job data.",
    meta: "Live app · Student-friendly",
    icon: FiCompass,
  },
  {
    title: "SciJourneys Lesson 1",
    eyebrow: "Launch Lesson",
    description:
      "Introduce authentic science with diverse researchers and field stories.",
    meta: "1 class period · Free",
    icon: MdOutlineSchool,
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

    const liveUnits = getLiveUnits(retrievedUnits ?? []);
    const featuredUnits = liveUnits.slice(0, 6).map((unit) => {
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
      };
    });

    return {
      props: {
        featuredUnits: featuredUnits.length ? featuredUnits : fallbackUnits,
        userStats,
      },
      revalidate: 86_400,
    };
  } catch (error) {
    console.error("Teacher portal design preview failed to load units.", error);
    return {
      props: {
        featuredUnits: fallbackUnits,
        userStats: {
          totalTeachers: 0,
          usStates: 0,
          otherCountries: 0,
          highlightedCountries: [],
        },
      },
      revalidate: 86_400,
    };
  }
}

export default function TeacherPortalDesignPreview({
  featuredUnits,
  userStats,
}: TeacherPortalPreviewProps) {
  const [activeModal, setActiveModal] = useState<"wizard" | "media" | null>(
    null
  );
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [animatedStats, setAnimatedStats] = useState({
    totalTeachers: 0,
    usStates: 0,
    otherCountries: 0,
  });
  const newUnits = featuredUnits.filter((unit) => unit.isNew);
  const spotlightUnits = newUnits.length ? newUnits : featuredUnits.slice(0, 3);
  const handleOpenWizard = () => setActiveModal("wizard");
  const handleCloseModal = () => {
    setActiveModal(null);
    setActiveMedia(null);
  };
  const handleOpenMedia = (media: MediaItem) => {
    setActiveMedia(media);
    setActiveModal("media");
  };

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
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setAnimatedStats({
        totalTeachers: userStats.totalTeachers,
        usStates: userStats.usStates,
        otherCountries: userStats.otherCountries,
      });
      return;
    }

    const durationMs = 900;
    const start = window.performance.now();
    const targets = {
      totalTeachers: userStats.totalTeachers,
      usStates: userStats.usStates,
      otherCountries: userStats.otherCountries,
    };

    let animationFrame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats({
        totalTeachers: Math.round(targets.totalTeachers * ease),
        usStates: Math.round(targets.usStates * ease),
        otherCountries: Math.round(targets.otherCountries * ease),
      });

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [userStats]);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      if (mapInstanceRef.current || !mapContainerRef.current) {
        return;
      }

      const { default: SvgMap } = await import("svgmap");

      if (!isMounted || !mapContainerRef.current) {
        return;
      }

      const values = userStats.highlightedCountries.reduce(
        (acc, code) => ({
          ...acc,
          [code]: {
            teachers: 1,
            color: "#2c83c3",
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
        colorMin: "#2c83c3",
        colorMax: "#2c83c3",
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
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = "";
      }
    };
  }, [userStats.highlightedCountries]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <nav className={styles.nav}>
            <div className={styles.brand}>
              <div className={styles.brandLogo}>
                <Image src={GpLogo} alt="Galactic Polymath" priority />
              </div>
              <div>
                <p className={styles.brandTitle}>GP Teacher Portal</p>
                <p className={styles.brandSubtitle}>
                  Interdisciplinary science for grades 5-12+
                </p>
              </div>
            </div>
            <div className={styles.navRight}>
              <div
                className={styles.navTabs}
                role="tablist"
                aria-label="Resource types"
              >
                {NAV_TABS.map((tab, index) => (
                  <button
                    key={tab}
                    type="button"
                    className={`${styles.navTab} ${
                      index === 0 ? styles.navTabActive : ""
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className={styles.profileSlot}>
                <span className={styles.profileAvatar} aria-hidden="true">
                  GP
                </span>
                <button className={styles.profileButton} type="button">
                  Log in
                </button>
              </div>
            </div>
          </nav>
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
                <p className={styles.searchLabel}>Search the library</p>
                <div className={styles.searchBar}>
                  <span className={styles.searchIcon} aria-hidden="true">
                    ⌕
                  </span>
                  <input
                    type="text"
                    placeholder="Search by title, topic, standards, or skill..."
                    aria-label="Search resources"
                  />
                </div>
                <div className={styles.filterNote}>
                  Search is static in this mock; filters live on the library tab.
                </div>
              </div>
              <div className={`${styles.wizardTeaser} ${styles.reveal}`} data-animate>
                <div className={styles.wizardTeaserTitle}>
                  <span className={styles.wizardTeaserIcon}>
                    <FiPlay />
                  </span>
                  <h2>Not sure where to begin?</h2>
                </div>
                <p>
                  Answer three quick prompts and we will route you to the best
                  unit, app, or video to start today.
                </p>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={handleOpenWizard}
                >
                  Open the Easy Start Wizard
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.heroWave} aria-hidden="true" />
        <main className={styles.main}>
          <section
            className={`${styles.sectionStats} ${styles.reveal}`}
            data-animate
          >
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Across the globe</p>
                <h2>Teachers are already exploring GP</h2>
                <p>
                  Used by {animatedStats.totalTeachers.toLocaleString()}{" "}
                  teachers across {animatedStats.usStates.toLocaleString()} US
                  states and{" "}
                  {animatedStats.otherCountries.toLocaleString()} other
                  countries.
                </p>
              </div>
              <div className={styles.statsCtaRow}>
                <a className={styles.primaryButton} href="/account">
                  Log in
                </a>
                <a className={styles.secondaryButton} href="/gp-plus">
                  Create free account
                </a>
              </div>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statsCard}>
                <div>
                  <p className={styles.statsKicker}>Teachers</p>
                  <p className={styles.statsValue}>
                    {animatedStats.totalTeachers.toLocaleString()}
                  </p>
                </div>
                <p className={styles.statsCaption}>
                  Educators using GP resources worldwide.
                </p>
                <div className={styles.statsDivider} aria-hidden="true" />
                <div className={styles.statsList}>
                  <div>
                    <span>US states</span>
                    <strong>{animatedStats.usStates}</strong>
                  </div>
                  <div>
                    <span>Other countries</span>
                    <strong>{animatedStats.otherCountries}</strong>
                  </div>
                </div>
              </div>
              <div className={styles.mapWrap}>
                <div
                  className={styles.mapFrame}
                  id="gp-world-map"
                  ref={mapContainerRef}
                />
                <p className={styles.mapCaption}>
                  Highlighted countries show where GP teachers are located.
                </p>
              </div>
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.sectionOrientation} ${styles.reveal}`}
            data-animate
          >
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Curated for teachers</p>
                <h2>Orientation &amp; quick wins</h2>
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
                  className={`${styles.spotlightCard} ${styles.reveal}`}
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
                </article>
              ))}
            </div>
          </section>

          <div
            className={`${styles.sectionDivider} ${styles.sectionDividerFresh}`}
            aria-hidden="true"
          />

          <section className={`${styles.section} ${styles.sectionFresh}`}>
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
                const targetStandards = summarizeList(unit.targetStandards, 1);
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
          </section>

          <div
            className={`${styles.sectionDivider} ${styles.sectionDividerAlt}`}
            aria-hidden="true"
          />

          <section className={`${styles.sectionAlt} ${styles.reveal}`} data-animate>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Find your path fast</p>
                <h2>Pick a starting track</h2>
                <p>
                  These curated pathways direct teachers to the right resources
                  without the overwhelm.
                </p>
              </div>
            </div>
            <div className={styles.trackGrid}>
              {wizardTracks.map((track, index) => (
                <article
                  key={track.title}
                  className={`${styles.trackCard} ${styles.reveal}`}
                  style={{ transitionDelay: `${index * 120}ms` }}
                  data-animate
                >
                  <div className={styles.trackIcon}>
                    <track.icon />
                  </div>
                  <h3>{track.title}</h3>
                  <p>{track.description}</p>
                  <button className={styles.secondaryButton} type="button">
                    {track.cta}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <div
            className={`${styles.sectionDivider} ${styles.sectionDividerSoft}`}
            aria-hidden="true"
          />

          <section className={`${styles.section} ${styles.reveal}`} data-animate>
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
          </section>
        </main>
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
