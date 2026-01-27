import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  BookOpen,
  GraduationCap,
  LayoutGrid,
  ListFilter,
  PlayCircle,
  Search,
} from "lucide-react";
import styles from "./index.module.css";
import { getUnitLessons, retrieveUnits } from "../backend/services/unitServices";
import { createDbProjections, getLiveUnits } from "../shared/fns";
import { INewUnitSchema } from "../backend/models/Unit/types/unit";
import sanitizeHtml from "sanitize-html";
import GpLogo from "../public/GP_bubbleLogo300px.png";
import { IUnitLesson } from "../types/global";

const NAV_TABS = ["All", "Units", "Apps", "Videos", "Lessons"] as const;
const QUERY_KEYS = [
  "q",
  "type",
  "target",
  "aligned",
  "grade",
  "tag",
  "locale",
  "sponsor",
  "career",
] as const;

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
  "Sections.jobvizConnections.Content",
  "Sections.teachingMaterials.classroom.resources",
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

const toPlainText = (value?: string | null) =>
  value
    ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
        .replace(/\s+/g, " ")
        .trim()
    : "";

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

const buildMediaItems = (unit: INewUnitSchema, fallbackThumbnail: string) => {
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

const normalizeType = (value: string) => {
  const normalized = value.toLowerCase();
  if (normalized.startsWith("unit")) return "Unit";
  if (normalized.startsWith("lesson")) return "Lesson";
  if (normalized.startsWith("app")) return "App";
  if (normalized.startsWith("video")) return "Video";
  return null;
};

const getActiveTab = (selectedTypes: string[]) => {
  if (selectedTypes.length !== 1) return "All";
  const type = selectedTypes[0];
  if (type === "Unit") return "Units";
  if (type === "Lesson") return "Lessons";
  if (type === "App") return "Apps";
  if (type === "Video") return "Videos";
  return "All";
};

type ResourceType = "Unit" | "Lesson" | "App" | "Video";

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
  targetStandards: string[];
  careerConnections: string[];
  sponsorText: string;
  media: { title: string; type: "Video" | "App"; thumbnail: string; link?: string | null }[];
  targetSubject: string;
  subjectConnections: string[];
  locale: string;
}

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  image: string;
  subject?: string;
  alignedSubjects: string[];
  careers: string[];
  sponsor?: string;
  gradeBandGroup: string;
  gradeBand: string;
  tags: string[];
  locale: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface HomePageProps {
  units: PreviewUnit[];
  lessons: IUnitLesson[];
}

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

export async function getStaticProps() {
  try {
    const { data: retrievedUnits } = await retrieveUnits(
      {},
      createDbProjections(PROJECTED_UNITS_FIELDS),
      0,
      { ReleaseDate: -1 }
    );

    const liveUnits = getLiveUnits(retrievedUnits ?? []);
    const lessons = getUnitLessons(liveUnits);

    const units = liveUnits.map((unit) => {
      const bannerUrl = getUnitBanner(unit);
      const targetSubject = unit.TargetSubject || "Science";
      const gistMarkdown = unit.Sections?.overview?.TheGist ?? "";
      const sponsorMarkdown = unit.SponsoredBy ?? "";
      return {
        id: `${unit.numID ?? unit._id ?? unit.Title}`,
        title: unit.Title || "Untitled unit",
        subtitle: unit.Subtitle || "Interdisciplinary science for curious learners.",
        bannerUrl,
        subject: targetSubject,
        grades: getGradeLabel(unit),
        lessons: unit.LsnCount ?? null,
        isNew: Boolean(unit.ReleaseDate),
        gist: toPlainText(gistMarkdown),
        targetStandards: getTargetStandards(unit),
        careerConnections: getCareerConnections(unit),
        sponsorText: toPlainText(sponsorMarkdown) || "Sponsored by partners.",
        media: buildMediaItems(unit, bannerUrl),
        targetSubject,
        subjectConnections: getSubjectConnections(unit, targetSubject),
        locale: unit.locale ?? "en-US",
      };
    });

    return {
      props: {
        units,
        lessons,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Failed to build homepage units.", error);
    return {
      props: {
        units: [],
        lessons: [],
      },
      revalidate: 60,
    };
  }
}

const HomePage: React.FC<HomePageProps> = ({ units, lessons }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<ResourceType[]>([]);
  const [selectedTargetSubjects, setSelectedTargetSubjects] = useState<string[]>([]);
  const [selectedAlignedSubjects, setSelectedAlignedSubjects] = useState<string[]>([]);
  const [selectedGradeBands, setSelectedGradeBands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const isSyncingRef = useRef(false);

  const resources = useMemo<ResourceItem[]>(() => {
    const items: ResourceItem[] = [];
    const unitByTitle = new Map(units.map((unit) => [unit.title, unit]));

    units.forEach((unit) => {
      const gradeBandGroup = getGradeBandGroup(unit.grades);
      const tags = [...unit.careerConnections, ...unit.subjectConnections]
        .filter(Boolean)
        .slice(0, 6);
      const sponsor = unit.sponsorText;
      const alignedSubjects = unit.subjectConnections;

      items.push({
        id: `unit-${unit.id}`,
        title: unit.title,
        description: unit.subtitle || unit.gist,
        type: "Unit",
        image: unit.bannerUrl,
        subject: unit.targetSubject,
        alignedSubjects,
        careers: unit.careerConnections,
        sponsor,
        gradeBandGroup,
        gradeBand: unit.grades,
        tags: tags.length ? tags : ["Interdisciplinary"],
        locale: unit.locale,
        icon: BookOpen,
      });

      unit.media.forEach((media, index) => {
        items.push({
          id: `media-${unit.id}-${index}`,
          title: media.title,
          description: `From ${unit.title}`,
          type: media.type,
          image: media.thumbnail,
          subject: unit.targetSubject,
          alignedSubjects,
          careers: unit.careerConnections,
          sponsor,
          gradeBandGroup,
          gradeBand: unit.grades,
          tags: tags.length ? tags : ["Interactive"],
          locale: unit.locale,
          icon: media.type === "Video" ? PlayCircle : LayoutGrid,
        });
      });
    });

    lessons.forEach((lesson, index) => {
      const unit = unitByTitle.get(lesson.unitTitle || "") ?? null;
      const gradeLabel =
        lesson.grades || lesson.gradesOrYears || unit?.grades || "Grades 6-12";
      const gradeBandGroup = getGradeBandGroup(gradeLabel);
      const alignedSubjects = unit?.subjectConnections ?? [];
      const careers = unit?.careerConnections ?? [];
      const sponsor = unit?.sponsorText;
      const tags = lesson.tags ?? alignedSubjects;

      items.push({
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
        careers,
        sponsor,
        gradeBandGroup,
        gradeBand: gradeLabel,
        tags: tags && tags.length ? tags.slice(0, 6) : ["Lesson"],
        locale: unit?.locale ?? "en-US",
        icon: GraduationCap,
      });
    });

    return items;
  }, [units, lessons]);

  const targetSubjectOptions = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((resource) => {
      if (resource.subject) set.add(resource.subject);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const alignedSubjectOptions = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((resource) => {
      resource.alignedSubjects.forEach((subject) => set.add(subject));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const gradeBandOptions = useMemo(
    () => ["Upper Elementary", "Middle School", "High School", "Intro College"],
    []
  );

  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>();
    resources.forEach((resource) => {
      resource.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [resources]);

  const localeOptions = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((resource) => set.add(resource.locale));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const sponsorOptions = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((resource) => {
      if (resource.sponsor) set.add(resource.sponsor);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const careerOptions = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((resource) => {
      resource.careers.forEach((career) => set.add(career));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleType = (type: ResourceType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [type]
    );
  };

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return resources.filter((resource) => {
      if (selectedTypes.length && !selectedTypes.includes(resource.type)) {
        return false;
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
      if (selectedSponsors.length && (!resource.sponsor || !selectedSponsors.includes(resource.sponsor))) {
        return false;
      }
      if (selectedCareers.length && !selectedCareers.some((career) => resource.careers.includes(career))) {
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
        resource.careers.join(" "),
        resource.sponsor,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [
    resources,
    searchQuery,
    selectedTypes,
    selectedTargetSubjects,
    selectedAlignedSubjects,
    selectedGradeBands,
    selectedTags,
    selectedLocales,
    selectedSponsors,
    selectedCareers,
  ]);

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedTargetSubjects.length > 0 ||
    selectedAlignedSubjects.length > 0 ||
    selectedGradeBands.length > 0 ||
    selectedTags.length > 0 ||
    selectedLocales.length > 0 ||
    selectedSponsors.length > 0 ||
    selectedCareers.length > 0 ||
    searchQuery.trim().length > 0;

  const hasActiveFilterChips =
    selectedTypes.length > 0 ||
    selectedTargetSubjects.length > 0 ||
    selectedAlignedSubjects.length > 0 ||
    selectedGradeBands.length > 0 ||
    selectedTags.length > 0 ||
    selectedLocales.length > 0 ||
    selectedSponsors.length > 0 ||
    selectedCareers.length > 0;

  const resultsCount = hasActiveFilters ? filteredResources.length : resources.length;

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

  useEffect(() => {
    if (!router.isReady || isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }

    const query = router.query;
    const parsedTypes = parseQueryArray(query.type)
      .map((value) => normalizeType(value))
      .filter((value): value is ResourceType => Boolean(value));

    const queryText = Array.isArray(query.q) ? query.q[0] : query.q;
    setSearchQuery(typeof queryText === "string" ? queryText : "");
    setSelectedTypes(parsedTypes);
    setSelectedTargetSubjects(parseQueryArray(query.target));
    setSelectedAlignedSubjects(parseQueryArray(query.aligned));
    setSelectedGradeBands(parseQueryArray(query.grade));
    setSelectedTags(parseQueryArray(query.tag));
    setSelectedLocales(parseQueryArray(query.locale));
    setSelectedSponsors(parseQueryArray(query.sponsor));
    setSelectedCareers(parseQueryArray(query.career));
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const query = buildQueryObject({
      q: searchQuery.trim() || undefined,
      type: selectedTypes.length
        ? selectedTypes.map((type) => type.toLowerCase())
        : undefined,
      target: selectedTargetSubjects,
      aligned: selectedAlignedSubjects,
      grade: selectedGradeBands,
      tag: selectedTags,
      locale: selectedLocales,
      sponsor: selectedSponsors,
      career: selectedCareers,
    });

    const currentQuery = QUERY_KEYS.reduce<Record<string, string | string[]>>(
      (acc, key) => {
        const value = router.query[key];
        if (typeof value === "string" || Array.isArray(value)) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    if (normalizeQuery(currentQuery) === normalizeQuery(query)) {
      return;
    }

    isSyncingRef.current = true;
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
  }, [
    router,
    searchQuery,
    selectedTypes,
    selectedTargetSubjects,
    selectedAlignedSubjects,
    selectedGradeBands,
    selectedTags,
    selectedLocales,
    selectedSponsors,
    selectedCareers,
  ]);

  const activeTab = getActiveTab(selectedTypes);

  return (
    <>
      <Head>
        <title>Galactic Polymath Teacher Portal</title>
        <meta
          name="description"
          content="Search and filter Galactic Polymath units, lessons, apps, and videos with shareable discovery views."
        />
      </Head>
      <div className={styles.page}>
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
            <div className={styles.navTabs} role="tablist" aria-label="Resource types">
              {NAV_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.navTab} ${
                    activeTab === tab ? styles.navTabActive : ""
                  }`}
                  onClick={() => {
                    if (tab === "All") {
                      setSelectedTypes([]);
                      return;
                    }
                    const type = normalizeType(tab) as ResourceType | null;
                    if (type) {
                      toggleType(type);
                    }
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroBody}>
            <p className={styles.kicker}>Search + filter</p>
            <h1 className={styles.heroTitle}>Find every GP resource in one place.</h1>
            <p className={styles.heroLead}>
              Share a filtered URL with your team to keep prep aligned and fast.
            </p>
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.shell}>
            <div className={styles.searchRow}>
              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search by title, standards, job role, or sponsor..."
                  aria-label="Search all resources"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <button className={styles.searchButton} type="button">
                  Search
                </button>
              </div>
            </div>

            <aside
              className={`${styles.filtersPanel} ${
                filtersCollapsed ? styles.filtersPanelCollapsed : ""
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
                      setSelectedSponsors([]);
                      setSelectedCareers([]);
                      setSelectedTypes([]);
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className={styles.filterCollapseButton}
                    type="button"
                    aria-label={filtersCollapsed ? "Show filters" : "Hide filters"}
                    aria-expanded={!filtersCollapsed}
                    onClick={() => setFiltersCollapsed((prev) => !prev)}
                  >
                    {filtersCollapsed && (
                      <span className={styles.filterCollapsedLabel}>Filter</span>
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
                  <summary className={styles.filterSummary}>Sponsors</summary>
                  <div className={styles.filterOptions}>
                    {sponsorOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={
                          selectedSponsors.includes(option)
                            ? styles.filterPillActive
                            : styles.filterPill
                        }
                        onClick={() =>
                          toggleSelection(option, selectedSponsors, setSelectedSponsors)
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </details>
                <details className={styles.filterGroup} open>
                  <summary className={styles.filterSummary}>Careers</summary>
                  <div className={styles.filterOptions}>
                    {careerOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={
                          selectedCareers.includes(option)
                            ? styles.filterPillActive
                            : styles.filterPill
                        }
                        onClick={() =>
                          toggleSelection(option, selectedCareers, setSelectedCareers)
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
                        onClick={() => toggleSelection(option, selectedTags, setSelectedTags)}
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
                          toggleSelection(option, selectedLocales, setSelectedLocales)
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </aside>

            <section className={styles.resultsPanel}>
              <div className={styles.resultsHeader}>
                <div className={styles.resultsKicker}>
                  <span>Showing {resultsCount} Results from All Resources</span>
                </div>
              </div>

              <div
                className={`${styles.resultsChips} ${
                  hasActiveFilterChips ? "" : styles.resultsChipsEmpty
                }`}
              >
                {hasActiveFilterChips && (
                  <span className={styles.activeFiltersLabel}>Active filters</span>
                )}
                {[
                  ...selectedTypes,
                  ...selectedTargetSubjects,
                  ...selectedAlignedSubjects,
                  ...selectedGradeBands,
                  ...selectedSponsors,
                  ...selectedCareers,
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
                  const Icon = resource.icon;
                  return (
                    <article key={resource.id} className={styles.resourceCard}>
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
                          <span className={styles.resourceTypePill}>
                            <Icon aria-hidden="true" />
                            {resource.type.toLowerCase()}
                          </span>
                        </div>
                        <div className={styles.resourceMetaRow}>
                          {resource.subject && (
                            <span className={styles.resourceSubject}>
                              {resource.subject}
                            </span>
                          )}
                          <span>{resource.gradeBand}</span>
                          {resource.sponsor && (
                            <span className={styles.resourceSponsor}>
                              {resource.sponsor}
                            </span>
                          )}
                        </div>
                        <div className={styles.resourceTags}>
                          {resource.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                        <div className={styles.resourceActions}>
                          <button className={styles.primaryButton} type="button">
                            Preview
                          </button>
                          <button className={styles.ghostButton} type="button">
                            Add to plan
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        </main>
      </div>
    </>
  );
};

export default HomePage;
