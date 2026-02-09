import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import RichText from '../RichText';
import styles from './UnitDesignPreview.module.css';
import { TUnitForUI } from '../../backend/models/Unit/types/unit';
import {
  INewUnitLesson,
  IResource,
} from '../../backend/models/Unit/types/teachingMaterials';
import LessonsCarousel from '../LessonSection/Preview/LessonsCarousel';
import { useModalContext } from '../../providers/ModalProvider';
import LocDropdown from '../LocDropdown';

const TAB_OVERVIEW = 'overview';
const TAB_MATERIALS = 'materials';
const TAB_STANDARDS = 'standards';
const TAB_BACKGROUND = 'background';
const TAB_CREDITS = 'credits';

type TTabKey =
  | typeof TAB_OVERVIEW
  | typeof TAB_MATERIALS
  | typeof TAB_STANDARDS
  | typeof TAB_BACKGROUND
  | typeof TAB_CREDITS;

type TSearchEntry = {
  id: string;
  tab: TTabKey;
  title: string;
  excerpt: string;
  content: string;
  lessonId?: number | null;
};

const stripHtml = (value?: string | null) => {
  if (!value) {
    return '';
  }
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const normalize = (value: string) => value.toLowerCase();

const buildExcerpt = (value: string, length = 140) => {
  if (value.length <= length) {
    return value;
  }
  return `${value.slice(0, length).trim()}…`;
};

const getLessonIdentifier = (lesson: INewUnitLesson, index: number) => {
  if (typeof lesson?.lsn === 'number') {
    return lesson.lsn;
  }
  if (typeof lesson?.lsn === 'string') {
    const parsed = Number.parseInt(lesson.lsn, 10);
    return Number.isNaN(parsed) ? index + 1 : parsed;
  }
  return index + 1;
};

const getLessonDisplayTitle = (lesson: INewUnitLesson, index: number) => {
  const identifier = getLessonIdentifier(lesson, index);
  const title = lesson?.title ?? 'Untitled lesson';
  return `Lesson ${identifier}: ${title}`;
};

const getFirstLessonResource = (
  resources?: IResource<INewUnitLesson>[] | null
) => {
  if (!resources?.length) {
    return null;
  }
  return resources.find((resource) => resource?.lessons?.length) ?? resources[0];
};

const buildSearchEntries = (
  unit: TUnitForUI,
  lessons: INewUnitLesson[]
): TSearchEntry[] => {
  const entries: TSearchEntry[] = [];
  const overview = unit.Sections?.overview;
  const teachingMaterials = unit.Sections?.teachingMaterials;

  const overviewText = stripHtml(
    [
      overview?.TheGist,
      overview?.Text,
      overview?.Description,
      overview?.LearningSummary,
      overview?.EstUnitTime,
      overview?.TargetSubject,
      overview?.SteamEpaulette,
      overview?.SteamEpaulette_vert,
    ]
      .filter(Boolean)
      .join(' ')
  );

  if (overviewText) {
    entries.push({
      id: 'overview-summary',
      tab: TAB_OVERVIEW,
      title: 'Overview',
      excerpt: buildExcerpt(overviewText),
      content: normalize(overviewText),
    });
  }

  const unitTags = (overview?.UnitTags ?? []) as string[];
  if (unitTags.length) {
    const tagText = unitTags.join(' ');
    entries.push({
      id: 'overview-tags',
      tab: TAB_OVERVIEW,
      title: 'Keywords',
      excerpt: buildExcerpt(tagText),
      content: normalize(tagText),
    });
  }

  if (unit.FeaturedMultimedia?.length) {
    unit.FeaturedMultimedia.forEach((media, index) => {
      const mediaText = stripHtml(
        [media?.title, media?.description, media?.lessonRelevance, media?.by]
          .filter(Boolean)
          .join(' ')
      );
      if (!mediaText) {
        return;
      }
      entries.push({
        id: `media-${index}`,
        tab: TAB_OVERVIEW,
        title: media?.title ?? 'Featured media',
        excerpt: buildExcerpt(mediaText),
        content: normalize(mediaText),
      });
    });
  }

  lessons.forEach((lesson, index) => {
    const lessonId = getLessonIdentifier(lesson, index);
    const lessonText = stripHtml(
      [
        lesson?.title,
        lesson?.preface,
        lesson?.lsnPreface,
        lesson?.gradeVarNote,
        lesson?.learningObj?.join(' '),
        lesson?.lsnPrep?.prepDetails,
        lesson?.lsnPrep?.prepQuickDescription,
        lesson?.lsnPrep?.prepTitle,
        lesson?.chunks
          ?.map((chunk) =>
            [
              chunk?.chunkTitle,
              chunk?.steps
                ?.map((step) =>
                  [
                    step?.StepTitle,
                    step?.StepQuickDescription,
                    step?.StepDetails,
                    step?.Vocab,
                    step?.TeachingTips,
                  ]
                    .filter(Boolean)
                    .join(' ')
                )
                .join(' '),
            ]
              .filter(Boolean)
              .join(' ')
          )
          .join(' '),
        lesson?.itemList
          ?.map((item) =>
            [item?.itemTitle, item?.itemDescription, item?.itemCat]
              .filter(Boolean)
              .join(' ')
          )
          .join(' '),
      ]
        .filter(Boolean)
        .join(' ')
    );

    if (lessonText) {
      entries.push({
        id: `lesson-${lessonId}`,
        tab: TAB_MATERIALS,
        title: getLessonDisplayTitle(lesson, index),
        excerpt: buildExcerpt(lessonText),
        content: normalize(lessonText),
        lessonId,
      });
    }
  });

  const standardsText = stripHtml(
    unit.TargetStandardsCodes?.map((code) =>
      [code?.subject, code?.code, code?.dim].filter(Boolean).join(' ')
    )
      .filter(Boolean)
      .join(' ')
  );

  if (standardsText) {
    entries.push({
      id: 'standards',
      tab: TAB_STANDARDS,
      title: 'Standards',
      excerpt: buildExcerpt(standardsText),
      content: normalize(standardsText),
    });
  }

  const backgroundText = stripHtml(unit.Sections?.background?.Content ?? '');
  if (backgroundText) {
    entries.push({
      id: 'background',
      tab: TAB_BACKGROUND,
      title: 'Background',
      excerpt: buildExcerpt(backgroundText),
      content: normalize(backgroundText),
    });
  }

  const acknowledgements = unit.Sections?.acknowledgements;
  const acknowledgementsText = stripHtml(
    acknowledgements?.Data?.map((entry) =>
      [
        entry?.role,
        entry?.def,
        entry?.records
          ?.map(
            (rec) =>
              `${rec?.name} ${rec?.title} ${rec?.affiliation} ${rec?.location}`
          )
          .join(' '),
      ]
        .filter(Boolean)
        .join(' ')
    )
      .filter(Boolean)
      .join(' ')
  );

  const creditsText = stripHtml(unit.Sections?.credits?.Content ?? '');
  const combinedCredits = [acknowledgementsText, creditsText]
    .filter(Boolean)
    .join(' ');

  if (combinedCredits) {
    entries.push({
      id: 'credits',
      tab: TAB_CREDITS,
      title: 'Credits & acknowledgments',
      excerpt: buildExcerpt(combinedCredits),
      content: normalize(combinedCredits),
    });
  }

  const versionsText = stripHtml(
    unit.Sections?.versionNotes?.Data?.map((release) =>
      [release?.major_release, release?.sub_releases?.map((sub) => `${sub?.version} ${sub?.date} ${sub?.summary} ${sub?.notes} ${sub?.acknowledgments}`).join(' ')].join(' ')
    )
      .filter(Boolean)
      .join(' ') || ''
  );

  if (versionsText) {
    entries.push({
      id: 'versions',
      tab: TAB_CREDITS,
      title: 'Major Release Updates',
      excerpt: buildExcerpt(versionsText),
      content: normalize(versionsText),
    });
  }

  return entries;
};

const UnitDesignPreview: React.FC<{ unit: TUnitForUI }> = ({ unit }) => {
  const overview = unit.Sections?.overview;
  const teachingMaterials = unit.Sections?.teachingMaterials;
  const lessonResources = getFirstLessonResource(
    teachingMaterials?.classroom?.resources
  );
  const lessons = lessonResources?.lessons ?? [];

  const availableTabs = useMemo(
    () =>
      [
        { key: TAB_OVERVIEW, label: 'Overview', isVisible: true },
        {
          key: TAB_MATERIALS,
          label: 'Teaching Materials',
          isVisible: lessons.length > 0,
        },
        {
          key: TAB_STANDARDS,
          label: 'Standards',
          isVisible: !!unit.TargetStandardsCodes?.length,
        },
        {
          key: TAB_BACKGROUND,
          label: 'Background',
          isVisible: !!unit.Sections?.background,
        },
        {
          key: TAB_CREDITS,
          label: 'Credits',
          isVisible:
            !!unit.Sections?.acknowledgements ||
            !!unit.Sections?.credits ||
            !!unit.Sections?.versionNotes?.Data?.length,
        },
      ].filter((tab) => tab.isVisible),
    [lessons.length, unit.TargetStandardsCodes, unit.Sections]
  );

  const defaultTab = availableTabs[0]?.key ?? TAB_OVERVIEW;
  const [activeTab, setActiveTab] = useState<TTabKey>(defaultTab);

  const [activeLessonId, setActiveLessonId] = useState<number | null>(() => {
    if (!lessons.length) {
      return null;
    }
    return getLessonIdentifier(lessons[0], 0);
  });

  const searchEntries = useMemo(
    () => buildSearchEntries(unit, lessons),
    [unit, lessons]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const versionNotesAnchorRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToVersionNotes, setShouldScrollToVersionNotes] =
    useState(false);

  const searchResults = useMemo(() => {
    const term = normalize(searchTerm.trim());
    if (term.length < 2) {
      return [];
    }
    return searchEntries
      .filter((entry) => entry.content.includes(term))
      .slice(0, 8);
  }, [searchEntries, searchTerm]);

  const applyHashState = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const rawHash = window.location.hash.replace(/^#/, '');
    if (!rawHash) {
      return;
    }
    const params = new URLSearchParams(rawHash.includes('=') ? rawHash : '');
    const legacyParts = rawHash.includes('=') ? [] : rawHash.split(':');
    const tabValue = params.get('tab') ?? legacyParts[0] ?? '';
    const lessonValue = params.get('lesson') ?? legacyParts[1] ?? '';
    if (tabValue) {
      const isValid = availableTabs.some((tab) => tab.key === tabValue);
      if (isValid) {
        setActiveTab(tabValue as TTabKey);
      }
    }
    if (lessonValue) {
      const parsed = Number.parseInt(lessonValue, 10);
      if (!Number.isNaN(parsed)) {
        const hasLesson = lessons.some(
          (lesson, index) => getLessonIdentifier(lesson, index) === parsed
        );
        if (hasLesson) {
          setActiveLessonId(parsed);
        }
      }
    }
  };

  useEffect(() => {
    applyHashState();
    const handleHashChange = () => applyHashState();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [availableTabs, lessons]);

  useEffect(() => {
    if (activeTab !== TAB_MATERIALS) {
      return;
    }
    if (activeLessonId != null) {
      return;
    }
    if (!lessons.length) {
      return;
    }
    setActiveLessonId(getLessonIdentifier(lessons[0], 0));
  }, [activeTab, activeLessonId, lessons]);

  const updateHash = (tab: TTabKey, lessonId?: number | null) => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (tab === TAB_MATERIALS && lessonId != null) {
      params.set('lesson', String(lessonId));
    }
    window.location.hash = params.toString();
  };

  const handleTabChange = (tab: TTabKey) => {
    setActiveTab(tab);
    updateHash(tab, tab === TAB_MATERIALS ? activeLessonId : null);
  };

  const handleLessonChange = (lessonId: number) => {
    setActiveLessonId(lessonId);
    setActiveTab(TAB_MATERIALS);
    updateHash(TAB_MATERIALS, lessonId);
  };

  const handleSearchSelect = (entry: TSearchEntry) => {
    if (entry.lessonId) {
      handleLessonChange(entry.lessonId);
    } else {
      handleTabChange(entry.tab);
    }
    setSearchTerm('');
    setIsSearchExpanded(false);
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded((current) => {
      if (current) {
        setSearchTerm('');
      }
      return !current;
    });
  };

  useEffect(() => {
    if (!isSearchExpanded) {
      return;
    }
    searchInputRef.current?.focus();
  }, [isSearchExpanded]);

  useEffect(() => {
    if (activeTab !== TAB_CREDITS || !shouldScrollToVersionNotes) {
      return;
    }
    window.requestAnimationFrame(() => {
      versionNotesAnchorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setShouldScrollToVersionNotes(false);
    });
  }, [activeTab, shouldScrollToVersionNotes]);

  const activeLessonIndex = lessons.findIndex(
    (lesson, index) => getLessonIdentifier(lesson, index) === activeLessonId
  );
  const activeLesson =
    activeLessonIndex >= 0 ? lessons[activeLessonIndex] : undefined;

  const unitTitle = unit.Title ?? 'Unit';
  const unitSubtitle = unit.Subtitle ?? '';
  const unitBanner = unit.UnitBanner ?? '';
  const availLocs = unit.Sections?.overview?.availLocs ?? [];
  const locale = unit.locale ?? 'en-US';
  const numID = unit.numID ?? undefined;
  const alignedSubjects = useMemo(() => {
    const standardsData = unit.Sections?.standards?.Data;
    const subjectsFromStandards = Array.isArray(standardsData)
      ? standardsData
          .map((subjectGroup) => {
            const subjectName =
              typeof subjectGroup?.subject === 'string'
                ? subjectGroup.subject.trim()
                : '';
            if (!subjectName) {
              return null;
            }
            const hasAlignedStandards = (subjectGroup?.sets ?? []).some((set) =>
              (set?.dimensions ?? []).some((dimension) =>
                (dimension?.standardsGroup ?? []).some(
                  (group) => (group?.standardsGroup ?? []).length > 0
                )
              )
            );
            return hasAlignedStandards ? subjectName : null;
          })
          .filter((subject): subject is string => !!subject)
      : [];

    const subjectsSource = subjectsFromStandards.length
      ? subjectsFromStandards
      : (unit.TargetStandardsCodes ?? [])
          .map((standard) => {
            if (typeof standard?.subject === 'string') {
              return standard.subject.trim();
            }
            if (typeof standard?.set === 'string') {
              return standard.set.trim();
            }
            return '';
          })
          .filter(Boolean);

    return Array.from(new Set(subjectsSource));
  }, [unit.Sections?.standards?.Data, unit.TargetStandardsCodes]);

  const additionalAlignedSubjects = useMemo(() => {
    const targetSubject = overview?.TargetSubject?.trim().toLowerCase();
    return alignedSubjects.filter(
      (subject) => subject.toLowerCase() !== targetSubject
    );
  }, [alignedSubjects, overview?.TargetSubject]);
  const versionReleases = unit.Sections?.versionNotes?.Data ?? [];
  const latestSubRelease = versionReleases
    .flatMap((release) => release.sub_releases ?? [])
    .find((subRelease) => !!subRelease?.version) ?? null;
  const unitVersionLabel = latestSubRelease?.version ?? null;
  const updatedDate = latestSubRelease?.date
    ? !Number.isNaN(new Date(latestSubRelease.date).getTime())
      ? format(new Date(latestSubRelease.date), 'MMM d, yyyy')
      : latestSubRelease.date
    : null;
  const unitVersionText = unitVersionLabel
    ? updatedDate
      ? `ver. ${unitVersionLabel} (${updatedDate})`
      : `ver. ${unitVersionLabel}`
    : null;
  const { _isGpPlusModalDisplayed } = useModalContext();
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;

  const handleVersionInfoClick = () => {
    setShouldScrollToVersionNotes(true);
    handleTabChange(TAB_CREDITS);
  };

  return (
    <div className={styles.unitPage}>
      <div className={styles.unitStickyHeader}>
        <div className={styles.unitStickyInner}>
          <div className={styles.unitStickyTopRow}>
            <div className={styles.unitStickyTitle}>
              <span className={styles.unitStickyText}>
                {unitTitle}
                {unitSubtitle ? `: ${unitSubtitle}` : ''}
              </span>
            </div>
          </div>
          <div className={styles.unitSearch}>
            <div className={styles.unitSearchRow}>
              <div
                className={
                  isSearchExpanded
                    ? `${styles.unitSearchInputWrap} ${styles.unitSearchInputWrapExpanded}`
                    : `${styles.unitSearchInputWrap} ${styles.unitSearchInputWrapCollapsed}`
                }
              >
                <button
                  type="button"
                  className={styles.unitSearchIcon}
                  aria-label={
                    isSearchExpanded ? 'Collapse unit search' : 'Expand unit search'
                  }
                  aria-controls="unit-search"
                  aria-expanded={isSearchExpanded}
                  onClick={handleSearchToggle}
                >
                  <i className="bi bi-search" />
                </button>
                <input
                  id="unit-search"
                  ref={searchInputRef}
                  className={
                    isSearchExpanded
                      ? `${styles.unitSearchInput} ${styles.unitSearchInputExpanded}`
                      : `${styles.unitSearchInput} ${styles.unitSearchInputCollapsed}`
                  }
                  type="search"
                  placeholder="Search lessons, steps, resources"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setSearchTerm('');
                      setIsSearchExpanded(false);
                    }
                  }}
                  tabIndex={isSearchExpanded ? 0 : -1}
                />
              </div>
              {availLocs.length > 0 && numID != null && (
                <div className={styles.unitLocaleActions}>
                  <div className={styles.unitLocaleSwitcher}>
                    <LocDropdown availLocs={availLocs} loc={locale} id={numID} />
                  </div>
                  <button
                    className={styles.stickyShareAction}
                    type="button"
                  >
                    <i className="bi bi-share" aria-hidden="true" />
                    Share
                  </button>
                </div>
              )}
              {!(availLocs.length > 0 && numID != null) && (
                <button className={styles.stickyShareAction} type="button">
                  <i className="bi bi-share" aria-hidden="true" />
                  Share
                </button>
              )}
            </div>
          </div>
          <div className={styles.unitTabList}>
            {availableTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={
                  tab.key === activeTab
                    ? `${styles.unitTabButton} ${styles.unitTabButtonActive}`
                    : styles.unitTabButton
                }
                onClick={() => handleTabChange(tab.key as TTabKey)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {isSearchExpanded && searchTerm.length > 1 && (
            <div className={styles.unitSearchResults}>
              {searchResults.length ? (
                searchResults.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={styles.unitSearchResult}
                    onClick={() => handleSearchSelect(entry)}
                  >
                    <span className={styles.searchResultTitle}>
                      {entry.title}
                    </span>
                    <span className={styles.searchResultExcerpt}>
                      {entry.excerpt}
                    </span>
                  </button>
                ))
              ) : (
                <p className={styles.searchResultEmpty}>
                  No matches yet. Try a different keyword.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {activeTab === TAB_OVERVIEW && (
        <section className={styles.unitHero}>
          <div className={styles.unitHeroGrid}>
            <div className={styles.unitHeroMedia}>
              {unitBanner ? (
                <div className={styles.unitBanner}>
                  <Image
                    src={unitBanner}
                    alt={unit.Title ? `${unit.Title} banner` : 'Unit banner'}
                    width={1400}
                    height={720}
                    priority
                  />
                </div>
              ) : (
                <div className={styles.unitBannerFallback}>
                  <p>Unit banner coming soon</p>
                </div>
              )}
            </div>
            <div className={styles.unitHeroHeader}>
              <div className={styles.unitEyebrowRow}>
                <p className={styles.unitEyebrow}>Galactic Polymath · Unit</p>
                {unitVersionText && (
                  <button
                    type="button"
                    className={styles.unitVersionInfo}
                    onClick={handleVersionInfoClick}
                  >
                    {unitVersionText}
                  </button>
                )}
              </div>
              <h1 className={styles.unitTitle}>{unitTitle}</h1>
              {unitSubtitle && (
                <p className={styles.unitSubtitle}>{unitSubtitle}</p>
              )}
              {!!overview?.UnitTags?.length && (
                <div className={styles.unitTagList}>
                  {overview.UnitTags.map((tag) => (
                    <span key={tag} className={styles.unitTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <main className={styles.unitMain}>
        {activeTab === TAB_OVERVIEW && (
          <section className={styles.unitSection}>
            <div className={styles.unitOverviewGrid}>
              <div
                className={`${styles.unitOverviewCard} ${styles.unitOverviewCardPrimary}`}
              >
                <h3>The Gist</h3>
                {overview?.TheGist && (
                  <p className={styles.unitLead}>{overview.TheGist}</p>
                )}
                {overview?.LearningSummary && (
                  <p className={styles.unitSummaryText}>
                    {overview.LearningSummary}
                  </p>
                )}
                {overview?.Text && (
                  <div className={styles.richTextBlock}>
                    <RichText content={overview.Text} />
                  </div>
                )}
              </div>
              <div
                className={`${styles.unitOverviewCard} ${styles.unitOverviewCardCompact}`}
              >
                <h3>At a glance</h3>
                <div className={styles.atGlanceGrid}>
                  {overview?.EstUnitTime && (
                    <div className={styles.atGlanceItem}>
                      <span className={styles.atGlanceIcon} aria-hidden="true">
                        <i className="bi bi-clock-history" />
                      </span>
                      <div className={styles.atGlanceContent}>
                        <span className={styles.atGlanceLabel}>Estimated time</span>
                        <strong className={styles.atGlanceValue}>
                          {overview.EstUnitTime}
                        </strong>
                      </div>
                    </div>
                  )}
                  {unit.ForGrades && (
                    <div className={styles.atGlanceItem}>
                      <span className={styles.atGlanceIcon} aria-hidden="true">
                        <i className="bi bi-mortarboard-fill" />
                      </span>
                      <div className={styles.atGlanceContent}>
                        <span className={styles.atGlanceLabel}>Grades</span>
                        <strong className={styles.atGlanceValue}>{unit.ForGrades}</strong>
                      </div>
                    </div>
                  )}
                  {overview?.TargetSubject && (
                    <button
                      type="button"
                      className={`${styles.atGlanceItem} ${styles.atGlanceItemAction}`}
                      onClick={() => handleTabChange(TAB_STANDARDS)}
                    >
                      <span className={styles.atGlanceIcon} aria-hidden="true">
                        <i className="bi bi-journal-richtext" />
                      </span>
                      <div className={styles.atGlanceContent}>
                        <span className={styles.atGlanceLabel}>Subject focus</span>
                        <strong className={styles.atGlanceValue}>
                          {overview.TargetSubject}
                        </strong>
                      </div>
                      {overview?.SteamEpaulette && (
                        <div className={styles.learningEpaulette}>
                          <Image
                            src={overview.SteamEpaulette}
                            alt="GP learning epaulette"
                            width={240}
                            height={240}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </div>
                      )}
                      {!!additionalAlignedSubjects.length && (
                        <span className={styles.alignedSubjectsText}>
                          Also aligned to {additionalAlignedSubjects.join(', ')}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.unitOverviewCardWide}>
                <h3>Supporting Multimedia</h3>
                {unit.FeaturedMultimedia?.length ? (
                  <div className={styles.previewCarousel}>
                    <LessonsCarousel mediaItems={unit.FeaturedMultimedia} />
                  </div>
                ) : (
                  <p className={styles.unitMutedText}>
                    Featured media will appear here once curated.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === TAB_MATERIALS && (
          <section className={styles.unitSection}>
            <h2 className={styles.sectionTitle}>Teaching materials</h2>
            <p className={styles.sectionIntro}>
              Jump between lessons and keep the detailed procedure within reach.
            </p>
            <div className={styles.gpPlusBannerWrap}>
              <div className={styles.gpPlusBanner}>
                <div className={styles.gpPlusLogo}>
                  <Image
                    alt="GP+ logo"
                    width={88}
                    height={88}
                    src="/imgs/gp-logos/gp_submark.png"
                  />
                </div>
                <div className={styles.gpPlusCopy}>
                  <div className={styles.gpPlusHeadline}>
                    Download &amp; Edit lessons in one-click
                  </div>
                  <div className={styles.gpPlusSubhead}>Get 50% off GP+</div>
                </div>
                <button
                  type="button"
                  className={styles.gpPlusCta}
                  onClick={() => setIsGpPlusModalDisplayed(true)}
                >
                  <span className={styles.gpPlusCtaIcon}>
                    <Image
                      alt="GP+ icon"
                      width={48}
                      height={48}
                      src="/plus/plus.png"
                    />
                  </span>
                  <span>Upgrade to GP+</span>
                </button>
              </div>
            </div>
            <div className={styles.materialsLayout}>
              <div className={styles.lessonTabColumn}>
                <h3 className={styles.lessonTabHeading}>Lessons</h3>
                <div className={styles.lessonTabList}>
                  {lessons.map((lesson, index) => {
                    const lessonId = getLessonIdentifier(lesson, index);
                    const isActive = lessonId === activeLessonId;
                    const tags = lesson.lsnTags ?? lesson.tags ?? [];
                    return (
                      <button
                        key={`lesson-tab-${lessonId}`}
                        type="button"
                        className={
                          isActive
                            ? `${styles.lessonTabButton} ${styles.lessonTabButtonActive}`
                            : styles.lessonTabButton
                        }
                        onClick={() => handleLessonChange(lessonId)}
                      >
                        <div className={styles.lessonTileCard}>
                          <div className={styles.lessonTileMedia}>
                            {lesson.tile ? (
                              <Image
                                src={lesson.tile}
                                alt={`${lesson.title ?? 'Lesson'} tile`}
                                width={72}
                                height={72}
                              />
                            ) : (
                              <div className={styles.lessonTilePlaceholder} />
                            )}
                          </div>
                          <div className={styles.lessonTileContent}>
                            <div className={styles.lessonTileTitle}>
                              {lessonId}. {lesson.title ?? 'Untitled lesson'}
                            </div>
                            {!!tags?.length && (
                              <div className={styles.lessonTileTags}>
                                {tags.map((tag, tagIndex) => (
                                  <span
                                    key={`${tag}-${tagIndex}`}
                                    className={styles.lessonTileTag}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {lessonResources?.links?.url && lessonResources?.links?.linkText && (
                  <a
                    className={styles.lessonFolderLink}
                    href={lessonResources.links.url?.[0] ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lessonResources.links.linkText}
                  </a>
                )}
              </div>
              <div className={styles.lessonContent}>
                {activeLesson ? (
                  <div className={styles.lessonLayout}>
                    <div className={styles.lessonSummaryCard}>
                      <h3>
                        {getLessonDisplayTitle(activeLesson, activeLessonIndex)}
                      </h3>
                      {activeLesson.preface && (
                        <p className={styles.unitLead}>{activeLesson.preface}</p>
                      )}
                      {activeLesson.lsnPreface && (
                        <p className={styles.unitSummaryText}>
                          {activeLesson.lsnPreface}
                        </p>
                      )}
                      <div className={styles.unitDetailsList}>
                        {activeLesson.lsnDur && (
                          <div className={styles.unitDetailItem}>
                            <span className={styles.unitDetailLabel}>
                              Lesson duration
                            </span>
                            <strong className={styles.unitDetailValue}>
                              {activeLesson.lsnDur} min
                            </strong>
                          </div>
                        )}
                        {activeLesson.updated_date && (
                          <div className={styles.unitDetailItem}>
                            <span className={styles.unitDetailLabel}>Last updated</span>
                            <strong className={styles.unitDetailValue}>
                              {activeLesson.updated_date}
                            </strong>
                          </div>
                        )}
                        {activeLesson.status && (
                          <div className={styles.unitDetailItem}>
                            <span className={styles.unitDetailLabel}>Status</span>
                            <strong className={styles.unitDetailValue}>
                              {activeLesson.status}
                            </strong>
                          </div>
                        )}
                      </div>
                      {!!activeLesson.learningObj?.length && (
                        <div className={styles.lessonObjectives}>
                          <h4>Learning objectives</h4>
                          <ul>
                            {activeLesson.learningObj.map((item, idx) => (
                              <li key={`${item}-${idx}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {activeLesson.lsnPrep && (
                        <div className={styles.lessonPrepCard}>
                          <h4>Teacher prep</h4>
                          <p>
                            {activeLesson.lsnPrep.prepQuickDescription ||
                              activeLesson.lsnPrep.prepTitle}
                          </p>
                          {activeLesson.lsnPrep.prepDetails && (
                            <p>{activeLesson.lsnPrep.prepDetails}</p>
                          )}
                        </div>
                      )}
                      {!!activeLesson.itemList?.length && (
                        <div className={styles.lessonResourceList}>
                          <h4>Materials & downloads</h4>
                          {activeLesson.itemList.map((item, idx) => (
                            <div key={`${item.itemTitle}-${idx}`}>
                              <strong>{item.itemTitle}</strong>
                              {item.itemDescription && (
                                <p>{item.itemDescription}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles.lessonProcedureCard}>
                      <details>
                        <summary>
                          Detailed procedure
                          <span>View step-by-step guidance</span>
                        </summary>
                        <div className={styles.lessonProcedureContent}>
                          {activeLesson.chunks?.map((chunk, index) => (
                            <div
                              key={`${chunk.chunkTitle}-${index}`}
                              className={styles.lessonChunk}
                            >
                              <h4>{chunk.chunkTitle ?? 'Lesson segment'}</h4>
                              {chunk.steps?.map((step, idx) => (
                                <div
                                  key={`${step.StepTitle}-${idx}`}
                                  className={styles.lessonStep}
                                >
                                  <strong>
                                    {step.StepTitle ||
                                      `Step ${step.Step ?? idx + 1}`}
                                  </strong>
                                  {step.StepQuickDescription && (
                                    <p>{step.StepQuickDescription}</p>
                                  )}
                                  {step.StepDetails && (
                                    <p>{step.StepDetails}</p>
                                  )}
                                  {step.TeachingTips && (
                                    <p className={styles.unitMutedText}>
                                      Tip: {step.TeachingTips}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                          {!activeLesson.chunks?.length && (
                            <p className={styles.unitMutedText}>
                              Detailed steps will appear here once added.
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                ) : (
                  <p className={styles.unitMutedText}>
                    Choose a lesson to explore teaching materials.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === TAB_STANDARDS && (
          <section className={styles.unitSection}>
            <h2 className={styles.sectionTitle}>Standards alignment</h2>
            <p className={styles.sectionIntro}>
              All target and connected standards in one place.
            </p>
            <div className={styles.unitOverviewCardWide}>
              {!!unit.TargetStandardsCodes?.length ? (
                <ul className={styles.standardsList}>
                  {unit.TargetStandardsCodes.map((standard, index) => (
                    <li key={`${standard.code}-${index}`}>
                      <strong>{standard.subject}</strong>
                      <span>{standard.code}</span>
                      {standard.dim && (
                        <span className={styles.unitMutedText}>
                          {standard.dim}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.unitMutedText}>
                  Standards will appear here once aligned.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === TAB_BACKGROUND && (
          <section className={styles.unitSection}>
            <h2 className={styles.sectionTitle}>Background</h2>
            <p className={styles.sectionIntro}>
              Context and real-world connections for this unit.
            </p>
            <div className={styles.unitOverviewCardWide}>
              {unit.Sections?.background?.Content ? (
                <div className={styles.richTextBlock}>
                  <RichText content={unit.Sections.background.Content} />
                </div>
              ) : (
                <p className={styles.unitMutedText}>
                  Background content will appear here.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === TAB_CREDITS && (
          <section className={styles.unitSection}>
            <h2 className={styles.sectionTitle}>Credits & acknowledgments</h2>
            <p className={styles.sectionIntro}>
              Partners, collaborators, and credits.
            </p>
            <div className={styles.unitOverviewCardWide}>
              {unit.Sections?.acknowledgements?.Data?.length ||
              unit.Sections?.credits?.Content ||
              versionReleases.length ? (
                <div className={styles.acknowledgmentsList}>
                  {unit.Sections?.credits?.Content && (
                    <div className={styles.richTextBlock}>
                      <RichText content={unit.Sections.credits.Content} />
                    </div>
                  )}
                  {unit.Sections?.acknowledgements?.Data?.map((entry, index) => (
                    <div key={`${entry.role}-${index}`}>
                      <h4>{entry.role}</h4>
                      {entry.def && <p>{entry.def}</p>}
                      {entry.records?.length ? (
                        <ul>
                          {entry.records.map((record, idx) => (
                            <li key={`${record.name}-${idx}`}>
                              <strong>{record.name}</strong>
                              {record.title ? ` · ${record.title}` : ''}
                              {record.affiliation ? `, ${record.affiliation}` : ''}
                              {record.location ? ` (${record.location})` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                  <div
                    ref={versionNotesAnchorRef}
                    id="major-release-updates"
                    className={styles.versionNotes}
                  >
                    <h4>Major release updates</h4>
                    {versionReleases.length ? (
                      versionReleases.map((release, index) => (
                        <div key={`${release.major_release}-${index}`}>
                          <strong>{release.major_release}</strong>
                          {release.sub_releases?.length ? (
                            <ul>
                              {release.sub_releases.map((sub, idx) => (
                                <li key={`${sub.version}-${idx}`}>
                                  <span>
                                    {sub.version ?? 'Unlabeled version'}
                                    {sub.date ? ` · ${sub.date}` : ''}
                                  </span>
                                  {sub.summary ? <p>{sub.summary}</p> : null}
                                  {sub.notes ? <p>{sub.notes}</p> : null}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className={styles.unitMutedText}>
                        Version notes will appear here.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className={styles.unitMutedText}>
                  Credits and acknowledgments will appear here.
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default UnitDesignPreview;
