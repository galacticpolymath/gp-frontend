import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import RichText from '../RichText';
import styles from './UnitPage.module.css';
import {
  Blocks,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Network,
  NotebookPen,
  SquareArrowOutUpRight,
  Target,
  X,
} from 'lucide-react';
import { TUnitForUI } from '../../backend/models/Unit/types/unit';
import {
  IItem,
  IItemForUI,
  INewUnitLesson,
  IResource,
} from '../../backend/models/Unit/types/teachingMaterials';
import LessonsCarousel from '../LessonSection/Preview/LessonsCarousel';
import { useModalContext } from '../../providers/ModalProvider';
import LocDropdown from '../LocDropdown';
import ChunkGraph from '../LessonSection/TeachIt/ChunkGraph';
import { ISubject } from '../../backend/models/Unit/types/standards';
import { setSessionStorageItem } from '../../shared/fns';

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

type TGradeBand = 'all' | 'k-2' | '3-5' | '6-8' | '9-12';

type TStandardsSubjectFilter = 'all' | string;

type TFlatStandard = {
  id: string;
  target: boolean;
  subject: string;
  setName: string;
  dimensionName: string;
  codes: string[];
  statements: string[];
  alignmentNotes: string;
  grades: string[];
};

type TMergedStandardLine = {
  code: string;
  statement: string;
  alignmentNote: string;
};

type TMergedStandardByDimension = {
  id: string;
  dimensionName: string;
  grades: string[];
  lines: TMergedStandardLine[];
};

const STANDARDS_GRADE_BANDS: { key: TGradeBand; label: string }[] = [
  { key: 'all', label: 'All grade bands' },
  { key: '3-5', label: 'advanced 5' },
  { key: '6-8', label: '6-8' },
  { key: '9-12', label: '9-12' },
];
const STANDARD_BAND_OPTIONS = STANDARDS_GRADE_BANDS.filter(
  (band) => band.key !== 'all'
);

const SUBJECT_COLOR_MAP: Record<string, string> = {
  math: '#DB4125',
  ela: '#ECA14D',
  extra: '#F4F0D9',
  science: '#B798E8',
  'social studies': '#633A9A',
  'social-studies': '#633A9A',
  socialstudies: '#633A9A',
  sustainability: '#349964',
  sel: '#0070DA',
  technology: '#0070DA',
};

const getSubjectColor = (subject: string) =>
  SUBJECT_COLOR_MAP[subject.trim().toLowerCase()] ?? '#B798E8';

const CONSENT_STORAGE_KEY = 'gp_cookie_consent_v1';

type TGtagParams = Record<string, string | number | boolean | null | undefined>;

const trackUnitEvent = (name: string, params: TGtagParams = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  const consent = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (consent !== 'granted') {
    return;
  }

  const gtag = (
    window as typeof window & {
      gtag?: (...args: unknown[]) => void;
    }
  ).gtag;

  if (typeof gtag !== 'function') {
    return;
  }

  gtag('event', name, {
    page_type: 'unit',
    ...params,
  });
};

const suppressPortalNavReveal = (durationMs = 700) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent('gp:suppress-nav-unhide', { detail: { durationMs } })
  );
};

const isPortalNavHidden = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const portalNav = document.querySelector(
    'nav[data-nav-hidden]'
  ) as HTMLElement | null;
  return portalNav?.dataset.navHidden === 'true';
};

const scrollToTop = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const portalNav = document.querySelector(
    'nav[data-nav-hidden]'
  ) as HTMLElement | null;
  const isNavHidden = portalNav?.dataset.navHidden === 'true';
  const navLayoutHeight = portalNav?.offsetHeight ?? 0;
  const targetTop = isNavHidden ? navLayoutHeight : 0;
  window.scrollTo({ top: targetTop, behavior: 'auto' });
};

const parseGradesFromString = (value: string) => {
  const lowered = value.trim().toLowerCase();
  if (!lowered) {
    return [];
  }

  if (lowered.includes('k')) {
    return [0];
  }

  const numericTokens = lowered.match(/\d+/g);
  if (!numericTokens?.length) {
    return [];
  }

  if (numericTokens.length === 1) {
    const grade = Number.parseInt(numericTokens[0], 10);
    return Number.isNaN(grade) ? [] : [grade];
  }

  const start = Number.parseInt(numericTokens[0], 10);
  const end = Number.parseInt(numericTokens[1], 10);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const parseGrades = (grades: string[]) =>
  grades
    .flatMap((grade) => parseGradesFromString(grade))
    .filter((grade, index, arr) => arr.indexOf(grade) === index)
    .sort((a, b) => a - b);

const isStandardInBand = (grades: string[], gradeBand: TGradeBand) => {
  if (gradeBand === 'all') {
    return true;
  }

  const parsed = parseGrades(grades);
  if (!parsed.length) {
    return false;
  }

  const range =
    gradeBand === 'k-2'
      ? [0, 2]
      : gradeBand === '3-5'
      ? [3, 5]
      : gradeBand === '6-8'
      ? [6, 8]
      : [9, 12];

  return parsed.some((grade) => grade >= range[0] && grade <= range[1]);
};

const formatGradeValue = (grades: string[]) => {
  const parsed = parseGrades(grades);
  if (!parsed.length) {
    return 'Grade band not specified';
  }

  const labels = parsed.map((grade) => (grade === 0 ? 'K' : `${grade}`));
  return labels.length === 1
    ? `Grade ${labels[0]}`
    : `Grades ${labels[0]}-${labels[labels.length - 1]}`;
};

const getStepDuration = (step: {
  StepDur?: number | string | null;
  StepDuration?: number | string | null;
  stepDur?: number | string | null;
}) => {
  const candidates = [step.StepDur, step.StepDuration, step.stepDur];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
      return candidate;
    }
    if (typeof candidate === 'string') {
      const parsed = Number.parseFloat(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return null;
};

const flattenStandards = (standardsData?: ISubject[] | null): TFlatStandard[] => {
  if (!Array.isArray(standardsData)) {
    if (standardsData && typeof standardsData === 'object') {
      standardsData = Object.values(standardsData as Record<string, ISubject>);
    } else {
      return [];
    }
  }

  const flat: TFlatStandard[] = [];
  const toList = <T,>(value: T[] | Record<string, T> | null | undefined): T[] => {
    if (Array.isArray(value)) {
      return value;
    }
    if (value && typeof value === 'object') {
      return Object.values(value);
    }
    return [];
  };

  standardsData.forEach((subjectGroup, subjectIndex) => {
    const subject = subjectGroup?.subject?.trim();
    if (!subject) {
      return;
    }

    toList(subjectGroup?.sets as any).forEach((set: any, setIndex) => {
      const setName = set?.name?.trim() || `Set ${setIndex + 1}`;
      toList(set?.dimensions).forEach((dimension: any, dimIndex) => {
        const dimensionName = dimension?.name?.trim() || `Dimension ${dimIndex + 1}`;
        toList(dimension?.standardsGroup).forEach(
          (groupOrStandard: any, groupIndex) => {
            const standards: any[] = toList(groupOrStandard?.standardsGroup).length
              ? toList(groupOrStandard?.standardsGroup)
              : [groupOrStandard];
          standards.forEach((standard, standardIndex) => {
            const codes = Array.isArray(standard?.codes)
              ? standard.codes.filter(Boolean)
              : standard?.codes
              ? [standard.codes]
              : [];
            const statements = Array.isArray(standard?.statements)
              ? standard.statements.filter(Boolean)
              : standard?.statements
              ? [standard.statements]
              : [];
            const grades = Array.isArray(standard?.grades)
              ? standard.grades.filter(Boolean)
              : standard?.grades
              ? [standard.grades]
              : [];

            flat.push({
              id: `${subjectIndex}-${setIndex}-${dimIndex}-${groupIndex}-${standardIndex}`,
              target: !!subjectGroup?.target,
              subject,
              setName,
              dimensionName,
              codes,
              statements,
              alignmentNotes: standard?.alignmentNotes ?? '',
              grades,
            });
          });
          }
        );
      });
    });
  });

  return flat;
};

const groupStandardsBySubject = (standards: TFlatStandard[]) => {
  const grouped = standards.reduce((accum, standard) => {
    if (!accum[standard.subject]) {
      accum[standard.subject] = [];
    }
    accum[standard.subject].push(standard);
    return accum;
  }, {} as Record<string, TFlatStandard[]>);

  return Object.entries(grouped)
    .map(([subject, subjectStandards]) => ({
      subject,
      standards: subjectStandards,
      sets: Array.from(new Set(subjectStandards.map((item) => item.setName))),
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));
};

const getNgssDimensionOrder = (dimensionName: string) => {
  const normalized = dimensionName
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const NGSS_DIMENSION_ORDER: Record<string, number> = {
    'performance expectation': 0,
    'disciplinary core ideas': 1,
    'disciplinary core idea': 1,
    'science and engineering practices': 2,
    'science and engineering practice': 2,
    'cross cutting concepts': 3,
    'cross cutting concept': 3,
  };

  return NGSS_DIMENSION_ORDER[normalized];
};

const mergeStandardsByDimension = (
  standards: TFlatStandard[],
  setNames: string[]
): TMergedStandardByDimension[] => {
  const groupedByDimension = standards.reduce((accum, standard) => {
    const dimensionKey = standard.dimensionName?.trim() || 'Unspecified dimension';
    if (!accum[dimensionKey]) {
      accum[dimensionKey] = {
        id: `${dimensionKey}-${standard.subject}`.replace(/\s+/g, '-').toLowerCase(),
        dimensionName: dimensionKey,
        grades: [],
        lines: [],
      };
    }

    const lineCount = Math.max(standard.codes.length, standard.statements.length, 1);
    for (let idx = 0; idx < lineCount; idx += 1) {
      const code =
        standard.codes[idx] ?? standard.codes[0] ?? 'Code not specified';
      const statement = standard.statements[idx] ?? standard.statements[0] ?? '';

      accum[dimensionKey].lines.push({
        code,
        statement,
        alignmentNote: standard.alignmentNotes?.trim() ?? '',
      });
    }

    accum[dimensionKey].grades.push(...standard.grades);

    return accum;
  }, {} as Record<string, TMergedStandardByDimension>);

  const isNgssAligned = setNames.some(
    (setName) => setName.trim().toLowerCase() === 'ngss'
  );

  return Object.values(groupedByDimension)
    .map((entry) => ({
      ...entry,
      grades: Array.from(new Set(entry.grades)),
      lines: entry.lines
        .sort((a, b) =>
          `${a.code} ${a.statement} ${a.alignmentNote}`.localeCompare(
            `${b.code} ${b.statement} ${b.alignmentNote}`
          )
        )
        .filter(
          (line, index, arr) =>
            arr.findIndex(
              (item) =>
                item.code === line.code &&
                item.statement === line.statement &&
                item.alignmentNote === line.alignmentNote
            ) === index
        ),
    }))
    .sort((a, b) => {
      if (!isNgssAligned) {
        return a.dimensionName.localeCompare(b.dimensionName);
      }

      const orderA = getNgssDimensionOrder(a.dimensionName);
      const orderB = getNgssDimensionOrder(b.dimensionName);

      if (typeof orderA === 'number' && typeof orderB === 'number') {
        return orderA - orderB;
      }
      if (typeof orderA === 'number') {
        return -1;
      }
      if (typeof orderB === 'number') {
        return 1;
      }
      return a.dimensionName.localeCompare(b.dimensionName);
    });
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

const getLessonIdentifier = <TItem extends IItem = IItemForUI>(
  lesson: INewUnitLesson<TItem>,
  index: number
) => {
  if (typeof lesson?.lsn === 'number') {
    return lesson.lsn;
  }
  if (typeof lesson?.lsn === 'string') {
    const parsed = Number.parseInt(lesson.lsn, 10);
    return Number.isNaN(parsed) ? index + 1 : parsed;
  }
  return index + 1;
};

const getLessonDisplayTitle = <TItem extends IItem = IItemForUI>(
  lesson: INewUnitLesson<TItem>,
  index: number
) => {
  const identifier = getLessonIdentifier(lesson, index);
  const title = lesson?.title ?? 'Untitled lesson';
  return `Lesson ${identifier}: ${title}`;
};

const isAssessmentLesson = <TItem extends IItem = IItemForUI>(
  lesson: INewUnitLesson<TItem> | undefined,
  index: number
) => {
  if (!lesson) {
    return false;
  }
  const identifier = getLessonIdentifier(lesson, index);
  if (identifier === 100) {
    return true;
  }
  const title = lesson?.title?.trim().toLowerCase() ?? '';
  return title.includes('assessment');
};

type TPreviewItem = {
  links?: { url: string[] | string | null }[] | null;
  externalUrl?: string | null;
  gdriveRoot?: string | null;
  itemType?: string | null;
  itemCat?: string | null;
  fileType?: string | null;
};

const getFirstItemUrl = (item?: TPreviewItem) => {
  if (item?.externalUrl) {
    return item.externalUrl;
  }
  const urlValue = item?.links?.[0]?.url;
  if (Array.isArray(urlValue)) {
    return urlValue[0] ?? null;
  }
  if (typeof urlValue === 'string') {
    return urlValue;
  }
  return null;
};

const isImageUrl = (value: string) =>
  /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(value);

const isPdfUrl = (value: string) => /\.pdf(\?.*)?$/i.test(value);

const getGoogleDocBase = (value: string) => {
  const match = value.match(
    /https?:\/\/docs\.google\.com\/(presentation|document|spreadsheets)\/d\/([^/]+)/i
  );
  if (!match?.[1] || !match?.[2]) {
    return null;
  }
  return `https://docs.google.com/${match[1]}/d/${match[2]}`;
};

const getGoogleDriveFileBase = (value: string) => {
  const fileMatch = value.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (fileMatch?.[1]) {
    return `https://drive.google.com/file/d/${fileMatch[1]}`;
  }
  const openMatch = value.match(/[?&]id=([^&]+)/i);
  if (openMatch?.[1]) {
    return `https://drive.google.com/file/d/${openMatch[1]}`;
  }
  return null;
};

const getGoogleDriveFileId = (value: string) => {
  const fileMatch = value.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (fileMatch?.[1]) {
    return fileMatch[1];
  }
  const openMatch = value.match(/[?&]id=([^&]+)/i);
  if (openMatch?.[1]) {
    return openMatch[1];
  }
  return null;
};

const withGoogleSuffix = (value: string, suffix: 'view' | 'preview') => {
  const docBase = getGoogleDocBase(value);
  if (docBase) {
    return `${docBase}/${suffix}`;
  }
  const driveBase = getGoogleDriveFileBase(value);
  if (driveBase) {
    return `${driveBase}/${suffix}`;
  }
  return null;
};

const toGoogleDrivePreviewUrl = (value: string) =>
  withGoogleSuffix(value, 'preview');

const toGoogleDriveViewUrl = (value: string) => withGoogleSuffix(value, 'view');

const toGooglePresentationEmbedUrl = (value: string) => {
  const docMatch = value.match(/https?:\/\/docs\.google\.com\/presentation\/d\/([^/]+)/i);
  if (docMatch?.[1]) {
    return `https://docs.google.com/presentation/d/${docMatch[1]}/embed?rm=minimal`;
  }
  const previewUrl = toGoogleDrivePreviewUrl(value);
  return previewUrl ?? null;
};

const toGooglePdfExportUrl = (value: string) => {
  const docMatch = value.match(
    /https?:\/\/docs\.google\.com\/(presentation|document|spreadsheets)\/d\/([^/]+)/i
  );
  if (docMatch?.[1] && docMatch?.[2]) {
    return `https://docs.google.com/${docMatch[1]}/d/${docMatch[2]}/export?format=pdf`;
  }
  const fileId = getGoogleDriveFileId(value);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return null;
};

const getNormalizedGDriveRoot = (value: string) => {
  const docBase = getGoogleDocBase(value);
  if (docBase) {
    return docBase;
  }
  const driveBase = getGoogleDriveFileBase(value);
  if (driveBase) {
    return driveBase;
  }
  const cleaned = value.replace(/\/(preview|view|edit)(\?.*)?$/i, '');
  return cleaned;
};

const getMaterialUrls = (item?: TPreviewItem & { mimeType?: string | null }) => {
  const baseUrl = getFirstItemUrl(item);
  const itemType = item?.itemType?.toLowerCase() ?? '';
  const itemCat = item?.itemCat?.toLowerCase() ?? '';
  const fileType = item?.fileType?.toLowerCase() ?? '';
  const mimeType = item?.mimeType?.toLowerCase() ?? '';
  const isWebResource = itemCat === 'web resource' || fileType === 'web resource';
  const isPresentationType = itemType === 'presentation';
  const isPresentationFileType = fileType === 'presentation';
  const isPresentation = isPresentationType || isPresentationFileType;
  const isWorksheetOrHandout =
    itemType === 'worksheet' ||
    itemType === 'handout' ||
    itemCat === 'worksheet' ||
    itemCat === 'handout';
  const supportsPdfExport =
    !isWebResource &&
    !isPresentation &&
    (isWorksheetOrHandout ||
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('word') ||
      fileType === 'document');

  if (isWebResource) {
    return {
      openUrl: baseUrl,
      previewUrl: baseUrl,
      embedUrl: baseUrl,
      pdfDownloadUrl: null,
    };
  }

  if (item?.gdriveRoot) {
    const gdriveRoot = getNormalizedGDriveRoot(item.gdriveRoot);
    if (isPresentation) {
      const embedUrl = toGooglePresentationEmbedUrl(gdriveRoot) ?? `${gdriveRoot}/preview`;
      return {
        openUrl: `${gdriveRoot}/view`,
        previewUrl: embedUrl,
        embedUrl,
        pdfDownloadUrl: null,
      };
    }
    const previewUrl = `${gdriveRoot}/preview`;
    return {
      openUrl: `${gdriveRoot}/view`,
      previewUrl,
      embedUrl: previewUrl,
      pdfDownloadUrl: supportsPdfExport
        ? toGooglePdfExportUrl(gdriveRoot) ?? null
        : null,
    };
  }

  if (!baseUrl) {
    return {
      openUrl: null,
      previewUrl: null,
      embedUrl: null,
      pdfDownloadUrl: null,
    };
  }

  if (isPresentation) {
    const viewUrl = toGoogleDriveViewUrl(baseUrl) ?? baseUrl;
    const embedUrl = toGooglePresentationEmbedUrl(baseUrl) ?? viewUrl;
    return {
      openUrl: viewUrl,
      previewUrl: embedUrl,
      embedUrl,
      pdfDownloadUrl: null,
    };
  }

  const previewUrl = toGoogleDrivePreviewUrl(baseUrl) ?? baseUrl;
  const pdfDownloadUrl =
    supportsPdfExport
      ? toGooglePdfExportUrl(baseUrl) ?? (isPdfUrl(baseUrl) ? baseUrl : null)
      : null;

  return {
    openUrl: baseUrl,
    previewUrl,
    embedUrl: isWorksheetOrHandout ? previewUrl : previewUrl,
    pdfDownloadUrl,
  };
};

const getFirstLessonResource = (
  resources?: IResource<INewUnitLesson<IItemForUI>>[] | null
) => {
  if (!resources?.length) {
    return null;
  }
  return resources.find((resource) => resource?.lessons?.length) ?? resources[0];
};

const buildSearchEntries = (
  unit: TUnitForUI,
  lessons: INewUnitLesson<IItemForUI>[]
): TSearchEntry[] => {
  const entries: TSearchEntry[] = [];
  const overview = unit.Sections?.overview;
  const teachingMaterials = unit.Sections?.teachingMaterials;

  const overviewText = stripHtml(
    [
      overview?.TheGist,
      overview?.Text,
      (overview as { Description?: string })?.Description,
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
                    step?.VariantNotes,
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

  const acknowledgments = unit.Sections?.acknowledgments;
  const acknowledgementsText = stripHtml(
    acknowledgments?.Data?.map((entry: any) =>
      [
        entry?.role,
        entry?.def,
        entry?.records
          ?.map(
            (rec: any) =>
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
    (
      unit.Sections?.versions?.Data ??
      ((unit.Sections as { versionNotes?: { Data?: any[] } })?.versionNotes?.Data ?? [])
    )?.map((release: any) =>
      [
        release?.major_release,
        release?.sub_releases
          ?.map(
            (sub: any) =>
              `${sub?.version} ${sub?.date} ${sub?.summary} ${sub?.notes} ${sub?.acknowledgments}`
          )
          .join(' '),
      ].join(' ')
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

const UnitPage: React.FC<{ unit: TUnitForUI }> = ({ unit }) => {
  const session = useSession();
  const isAuthenticated = session.status === 'authenticated';
  const isUserTeacher = Boolean(
    (
      session.data as
        | {
            user?: {
              isTeacher?: boolean;
            };
          }
        | null
    )?.user?.isTeacher
  );
  const overview = unit.Sections?.overview;
  const teachingMaterials = unit.Sections?.teachingMaterials;
  const standardsData = (unit.Sections?.standards?.Data ?? []) as ISubject[];
  const flatStandards = useMemo(
    () => flattenStandards(standardsData),
    [standardsData]
  );
  const versionReleases =
    unit.Sections?.versions?.Data ??
    ((unit.Sections as { versionNotes?: { Data?: any[] } })?.versionNotes?.Data ??
      []);
  const lessonResources = getFirstLessonResource(
    teachingMaterials?.classroom?.resources
  );
  const lessons: INewUnitLesson<IItemForUI>[] = lessonResources?.lessons ?? [];

  const availableTabs = useMemo<{ key: TTabKey; label: string; isVisible: boolean }[]>(
    () =>
      [
        { key: TAB_OVERVIEW as TTabKey, label: 'Overview', isVisible: true },
        {
          key: TAB_MATERIALS as TTabKey,
          label: 'Teaching Materials',
          isVisible: lessons.length > 0,
        },
        {
          key: TAB_STANDARDS as TTabKey,
          label: 'Standards',
          isVisible: flatStandards.length > 0 || !!unit.TargetStandardsCodes?.length,
        },
        {
          key: TAB_BACKGROUND as TTabKey,
          label: 'Background',
          isVisible: !!unit.Sections?.background,
        },
        {
          key: TAB_CREDITS as TTabKey,
          label: 'Credits',
          isVisible:
            !!unit.Sections?.acknowledgments ||
            !!unit.Sections?.credits ||
            !!versionReleases.length,
        },
      ].filter((tab) => tab.isVisible),
    [flatStandards.length, lessons.length, unit.TargetStandardsCodes, unit.Sections, versionReleases.length]
  );

  const defaultTab = (availableTabs[0]?.key ?? TAB_OVERVIEW) as TTabKey;
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
  const [isTagListExpanded, setIsTagListExpanded] = useState(false);
  const [visibleTagCount, setVisibleTagCount] = useState(0);
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  const [isStandardsFilterDockOpen, setIsStandardsFilterDockOpen] =
    useState(false);
  const [selectedGradeBands, setSelectedGradeBands] = useState<TGradeBand[]>([
    'all',
  ]);
  const [selectedSubjects, setSelectedSubjects] = useState<
    TStandardsSubjectFilter[]
  >(['all']);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const unitTagListRef = useRef<HTMLDivElement>(null);
  const unitTagMeasureRefs = useRef<Array<HTMLSpanElement | null>>([]);
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
  const heroUnitTags = useMemo(
    () => (overview?.UnitTags ?? []).filter(Boolean),
    [overview?.UnitTags]
  );

  const standardSubjects = useMemo(() => {
    const subjects = flatStandards.map((standard) => standard.subject.trim());
    return Array.from(new Set(subjects)).sort((a, b) => a.localeCompare(b));
  }, [flatStandards]);

  const availableSubjects = useMemo(() => {
    const gradeFiltered = flatStandards.filter((standard) => {
      if (selectedGradeBands.includes('all')) {
        return true;
      }
      return selectedGradeBands.some((band) =>
        isStandardInBand(standard.grades, band)
      );
    });

    return new Set(gradeFiltered.map((standard) => standard.subject));
  }, [flatStandards, selectedGradeBands]);

  const availableGradeBands = useMemo(() => {
    const subjectFiltered = flatStandards.filter((standard) => {
      if (selectedSubjects.includes('all')) {
        return true;
      }
      return selectedSubjects.includes(standard.subject);
    });

    return new Set(
      STANDARD_BAND_OPTIONS.filter((band) =>
        subjectFiltered.some((standard) =>
          isStandardInBand(standard.grades, band.key)
        )
      ).map((band) => band.key)
    );
  }, [flatStandards, selectedSubjects]);

  const activeSubjects = useMemo(() => {
    if (selectedSubjects.includes('all')) {
      return standardSubjects;
    }
    return selectedSubjects.filter((subject) => subject !== 'all');
  }, [selectedSubjects, standardSubjects]);

  const activeGradeBands = useMemo(() => {
    if (selectedGradeBands.includes('all')) {
      return STANDARD_BAND_OPTIONS.map((band) => band.key);
    }
    return selectedGradeBands.filter((band) => band !== 'all');
  }, [selectedGradeBands]);

  const activeFilterCount = useMemo(() => {
    const subjectCount = selectedSubjects.includes('all')
      ? 0
      : selectedSubjects.length;
    const gradeBandCount = selectedGradeBands.includes('all')
      ? 0
      : selectedGradeBands.length;

    return subjectCount + gradeBandCount;
  }, [selectedGradeBands, selectedSubjects]);

  const filteredStandards = useMemo(
    () =>
      flatStandards.filter((standard) => {
        const subjectMatches =
          activeSubjects.length === 0 || activeSubjects.includes(standard.subject);
        const gradeBandMatches =
          activeGradeBands.length === 0 ||
          activeGradeBands.some((band) => isStandardInBand(standard.grades, band));
        return subjectMatches && gradeBandMatches;
      }),
    [activeGradeBands, activeSubjects, flatStandards]
  );

  const targetStandards = filteredStandards.filter((standard) => standard.target);
  const connectedStandards = filteredStandards.filter(
    (standard) => !standard.target
  );
  const targetStandardsBySubject = useMemo(
    () => groupStandardsBySubject(targetStandards),
    [targetStandards]
  );
  const connectedStandardsBySubject = useMemo(
    () => groupStandardsBySubject(connectedStandards),
    [connectedStandards]
  );

  useEffect(() => {
    setSelectedSubjects((current) => {
      if (current.includes('all')) {
        return current;
      }

      const filtered = current.filter((subject) => availableSubjects.has(subject));

      return filtered.length ? filtered : ['all'];
    });
  }, [availableSubjects]);

  useEffect(() => {
    setSelectedGradeBands((current) => {
      if (current.includes('all')) {
        return current;
      }

      const filtered = current.filter((band) => availableGradeBands.has(band));

      return filtered.length ? filtered : ['all'];
    });
  }, [availableGradeBands]);

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
    const nextHash = params.toString();
    const nextUrl = `${window.location.pathname}${window.location.search}#${nextHash}`;
    window.history.replaceState(null, '', nextUrl);
  };

  const handleTabChange = (tab: TTabKey) => {
    if (isPortalNavHidden()) {
      suppressPortalNavReveal(1200);
    }
    setActiveTab(tab);
    updateHash(tab, tab === TAB_MATERIALS ? activeLessonId : null);
    trackUnitEvent('unit_tab_selected', { tab });
    scrollToTop();
  };

  const handleLessonChange = (lessonId: number) => {
    if (isPortalNavHidden()) {
      suppressPortalNavReveal();
    }
    setActiveLessonId(lessonId);
    setActiveTab(TAB_MATERIALS);
    updateHash(TAB_MATERIALS, lessonId);
    trackUnitEvent('unit_lesson_selected', { lesson_id: lessonId });
  };

  const handleSearchSelect = (entry: TSearchEntry) => {
    if (entry.lessonId) {
      handleLessonChange(entry.lessonId);
    } else {
      handleTabChange(entry.tab);
    }
    setSearchTerm('');
    setIsSearchExpanded(false);
    trackUnitEvent('unit_search_result_selected', {
      result_id: entry.id,
      result_tab: entry.tab,
      lesson_id: entry.lessonId ?? null,
    });
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded((current) => {
      if (current) {
        setSearchTerm('');
      }
      trackUnitEvent('unit_search_toggled', { expanded: !current });
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
    setIsTagListExpanded(false);
  }, [heroUnitTags]);

  useEffect(() => {
    if (!heroUnitTags.length) {
      setVisibleTagCount(0);
      return;
    }

    const measureTagRows = () => {
      const container = unitTagListRef.current;
      if (!container) {
        return;
      }
      const measureTags = unitTagMeasureRefs.current
        .slice(0, heroUnitTags.length)
        .filter(Boolean) as HTMLSpanElement[];

      if (!measureTags.length) {
        setVisibleTagCount(0);
        return;
      }

      const rows: number[] = [];
      let nextVisibleCount = 0;

      measureTags.forEach((tag) => {
        const top = tag.offsetTop;
        let rowIndex = rows.findIndex((rowTop) => Math.abs(rowTop - top) <= 1);
        if (rowIndex === -1) {
          rows.push(top);
          rowIndex = rows.length - 1;
        }

        if (rowIndex < 2) {
          nextVisibleCount += 1;
        }
      });

      const hasOverflow = nextVisibleCount < measureTags.length;
      const adjustedVisibleCount = hasOverflow
        ? Math.max(0, nextVisibleCount - 1)
        : nextVisibleCount;

      setVisibleTagCount(adjustedVisibleCount);
    };

    const rafId = window.requestAnimationFrame(measureTagRows);
    window.addEventListener('resize', measureTagRows);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => measureTagRows())
        : null;

    if (resizeObserver && unitTagListRef.current) {
      resizeObserver.observe(unitTagListRef.current);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measureTagRows);
      resizeObserver?.disconnect();
    };
  }, [heroUnitTags]);

  const tagsToDisplay = useMemo(() => {
    if (isTagListExpanded) {
      return heroUnitTags;
    }
    if (visibleTagCount <= 0) {
      return heroUnitTags;
    }
    return heroUnitTags.slice(0, visibleTagCount);
  }, [heroUnitTags, isTagListExpanded, visibleTagCount]);

  const hiddenTagCount = Math.max(0, heroUnitTags.length - tagsToDisplay.length);

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

  useEffect(() => {
    if (activeTab !== TAB_STANDARDS && isStandardsFilterDockOpen) {
      setIsStandardsFilterDockOpen(false);
    }
  }, [activeTab, isStandardsFilterDockOpen]);

  const activeLessonIndex = lessons.findIndex(
    (lesson, index) => getLessonIdentifier(lesson, index) === activeLessonId
  );
  const activeLesson =
    activeLessonIndex >= 0 ? lessons[activeLessonIndex] : undefined;
  const activeLessonItems = activeLesson?.itemList ?? [];
  const chunkDurations = (activeLesson?.chunks ?? [])
    .map((chunk) => chunk?.chunkDur ?? 0)
    .filter((duration): duration is number => typeof duration === 'number' && duration > 0);
  const activeTabIndex = availableTabs.findIndex((tab) => tab.key === activeTab);
  const nextTab =
    activeTabIndex >= 0 && activeTabIndex < availableTabs.length - 1
      ? availableTabs[activeTabIndex + 1]
      : null;

  const unitTitle = unit.Title ?? 'Unit';
  const unitSubtitle = unit.Subtitle ?? '';
  const unitBanner = unit.UnitBanner ?? '';
  const creditsContent = unit.Sections?.credits?.Content?.trim() ?? '';
  const acknowledgmentsEntries = unit.Sections?.acknowledgments?.Data ?? [];
  const hasCreditsTabContent = Boolean(
    creditsContent || acknowledgmentsEntries.length || versionReleases.length
  );
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
  const latestSubRelease = versionReleases
    .flatMap((release: any) => release.sub_releases ?? [])
    .find((subRelease: any) => !!subRelease?.version) ?? null;
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

  useEffect(() => {
    setActiveMaterialIndex(0);
  }, [activeLessonId]);
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;

  const handleVersionInfoClick = () => {
    setShouldScrollToVersionNotes(true);
    handleTabChange(TAB_CREDITS);
  };

  const getCurrentUnitUrl = () => {
    if (typeof window === 'undefined') {
      return '';
    }
    return window.location.href;
  };

  const handleGateNavigateToAccount = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const currentUrl = getCurrentUnitUrl();
    if (!currentUrl) {
      window.location.assign('/account');
      return;
    }
    setSessionStorageItem('userEntryRedirectUrl', currentUrl);
    window.location.assign(`/account?from=${encodeURIComponent(currentUrl)}`);
  };

  const handleGateNavigateToGpPlus = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const currentUrl = getCurrentUnitUrl();
    if (currentUrl) {
      setSessionStorageItem('userEntryRedirectUrl', currentUrl);
    }
    window.location.assign('/gp-plus');
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const shareUrl = window.location.href;
    const shareTitle = `${unitTitle}${unitSubtitle ? `: ${unitSubtitle}` : ''}`;
    const sharePayload = {
      title: shareTitle,
      text: `Explore this Galactic Polymath unit: ${shareTitle}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
        trackUnitEvent('unit_shared', { share_method: 'web_share' });
        return;
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      trackUnitEvent('unit_shared', { share_method: 'clipboard' });
    } catch (error) {
      trackUnitEvent('unit_share_failed', { reason: 'clipboard_write_failed' });
    }
  };

  const handleGradeBandFilter = (gradeBand: TGradeBand) => {
    setSelectedGradeBands((current) => {
      if (gradeBand === 'all') {
        return ['all'];
      }

      const base = current.includes('all')
        ? []
        : current.filter((band) => band !== 'all');

      const next = base.includes(gradeBand)
        ? base.filter((band) => band !== gradeBand)
        : [...base, gradeBand];

      return next.length ? next : ['all'];
    });
    trackUnitEvent('unit_standards_grade_filter', { grade_band: gradeBand });
  };

  const handleSubjectToggle = (subject: TStandardsSubjectFilter) => {
    setSelectedSubjects((current) => {
      if (subject === 'all') {
        return ['all'];
      }

      const base = current.includes('all')
        ? []
        : current.filter((item) => item !== 'all');

      const next = base.includes(subject)
        ? base.filter((item) => item !== subject)
        : [...base, subject];

      return next.length ? next : ['all'];
    });
    trackUnitEvent('unit_standards_subject_filter', { subject });
  };

  const handleResetStandardsFilters = () => {
    setSelectedGradeBands(['all']);
    setSelectedSubjects(['all']);
    trackUnitEvent('unit_standards_filters_reset');
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
                    onClick={handleShare}
                  >
                    <i className="bi bi-share" aria-hidden="true" />
                    Share
                  </button>
                </div>
              )}
              {!(availLocs.length > 0 && numID != null) && (
                <button
                  className={styles.stickyShareAction}
                  type="button"
                  onClick={handleShare}
                >
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
          {activeTab === TAB_MATERIALS && lessons.length > 0 && (
            <div className={styles.lessonSubtabBar}>
              <span className={styles.lessonSubtabLabel}>Lessons:</span>
              <div className={styles.lessonSubtabList}>
                {lessons.map((lesson, index) => {
                  const lessonId = getLessonIdentifier(lesson, index);
                  const isActive = lessonId === activeLessonId;
                  const isAssessment = isAssessmentLesson(lesson, index);
                  return (
                    <button
                      key={`sticky-lesson-tab-${lessonId}`}
                      type="button"
                      className={
                        isActive
                          ? `${styles.lessonSubtabButton} ${styles.lessonSubtabButtonActive}`
                          : styles.lessonSubtabButton
                      }
                      onClick={() => handleLessonChange(lessonId)}
                    >
                      {isAssessment ? (
                        <span
                          className={`${styles.lessonSubtabThumb} ${styles.lessonSubtabThumbAssessment}`}
                          aria-hidden="true"
                        >
                          <NotebookPen size={13} />
                        </span>
                      ) : lesson.tile ? (
                        <span className={styles.lessonSubtabThumb} aria-hidden="true">
                          <Image
                            src={lesson.tile}
                            alt=""
                            width={22}
                            height={22}
                          />
                        </span>
                      ) : null}
                      <span>{isAssessment ? 'Assess' : lessonId}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
          <div className={styles.unitHeroIntro}>
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
          </div>
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
              <h1 className={styles.unitTitle}>{unitTitle}</h1>
              {unitSubtitle && (
                <p className={styles.unitSubtitle}>{unitSubtitle}</p>
              )}
              {!!heroUnitTags.length && (
                <>
                  <div ref={unitTagListRef} className={styles.unitTagList}>
                    {tagsToDisplay.map((tag, index) => (
                      <span key={`${tag}-${index}`} className={styles.unitTag}>
                        {tag}
                      </span>
                    ))}
                    {hiddenTagCount > 0 && (
                      <button
                        type="button"
                        className={`${styles.unitTag} ${styles.unitTagToggle}`}
                        aria-expanded={isTagListExpanded}
                        onClick={() => setIsTagListExpanded((current) => !current)}
                      >
                        {isTagListExpanded ? 'Show fewer' : `+${hiddenTagCount} more`}
                      </button>
                    )}
                  </div>
                  <div className={styles.unitTagMeasureList} aria-hidden="true">
                    {heroUnitTags.map((tag, index) => (
                      <span
                        key={`measure-${tag}-${index}`}
                        className={styles.unitTag}
                        ref={(element) => {
                          unitTagMeasureRefs.current[index] = element;
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
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
                  <div className={`${styles.richTextBlock} ${styles.unitLeadMarkdown}`}>
                    <RichText content={overview.TheGist} />
                  </div>
                )}
                {(overview as { Description?: string })?.Description && (
                  <div className={`${styles.richTextBlock} ${styles.unitSummaryMarkdown}`}>
                    <RichText content={(overview as { Description?: string }).Description ?? ''} />
                  </div>
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
            <div className={styles.materialsLayout}>
              {activeLesson ? (
                <div className={styles.lessonLayout}>
                  <div className={styles.lessonSummaryCard}>
                    <div className={styles.lessonSummaryMain}>
                      {!isAssessmentLesson(activeLesson, activeLessonIndex) && (
                        <p className={styles.lessonEyebrow}>
                          Lesson {getLessonIdentifier(activeLesson, activeLessonIndex)}
                        </p>
                      )}
                      <h3>{activeLesson.title ?? 'Untitled lesson'}</h3>
                      {activeLesson.lsnPreface && (
                        <p className={styles.lessonPreface}>
                          {activeLesson.lsnPreface}
                        </p>
                      )}
                      {!!activeLesson.learningObj?.length && (
                        <div className={styles.lessonObjectives}>
                          <h4>Learning Objectives</h4>
                          <p className={styles.lessonObjectivesLead}>
                            Students will be able to:
                          </p>
                          <ul>
                            {activeLesson.learningObj.map((item, idx) => (
                              <li key={`${item}-${idx}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className={styles.lessonSummaryMeta}>
                      <div className={styles.lessonTileMediaLarge} aria-hidden={!activeLesson.tile}>
                        {activeLesson.tile ? (
                          <Image
                            src={activeLesson.tile}
                            alt={`${activeLesson.title ?? 'Lesson'} tile`}
                            width={180}
                            height={180}
                          />
                        ) : null}
                      </div>
                      {typeof activeLesson.lsnDur === 'number' && (
                        <div className={styles.lessonDuration}>
                          <i className="bi bi-clock-history" aria-hidden="true" />
                          <span>{activeLesson.lsnDur} min</span>
                        </div>
                      )}
                      {activeLesson.status &&
                        ['beta', 'upcoming'].includes(
                          activeLesson.status.toLowerCase()
                        ) && (
                          <span
                            className={`${styles.lessonStatusPill} ${
                              activeLesson.status.toLowerCase() === 'beta'
                                ? styles.lessonStatusPillBeta
                                : styles.lessonStatusPillUpcoming
                            }`}
                          >
                            {activeLesson.status}
                          </span>
                        )}
                      {!!(activeLesson.lsnTags ?? activeLesson.tags ?? []).length && (
                        <div className={styles.lessonTileTags}>
                          {(activeLesson.lsnTags ?? activeLesson.tags ?? []).map(
                            (tag, tagIndex) => (
                              <span
                                key={`${tag}-${tagIndex}`}
                                className={styles.lessonTileTag}
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.lessonMaterialsGrid}>
                    <div className={styles.lessonResourcesCard}>
                      <h4 className={styles.lessonCardHeading}>
                        <Download size={16} aria-hidden="true" />
                        <span>Materials and downloads</span>
                      </h4>
                      <p className={styles.materialsHelperText}>Click an item to preview.</p>
                      {!!activeLessonItems.length ? (
                        <div className={styles.lessonDownloadList}>
                          {activeLessonItems.map((item, idx) => {
                            const previewItem = item as TPreviewItem;
                            const { openUrl, pdfDownloadUrl } = getMaterialUrls(
                              previewItem
                            );
                            const isActive = idx === activeMaterialIndex;
                            const resourceTitle =
                              item.itemTitle ?? `Resource ${idx + 1}`;
                            const isTeacherOnlyItem =
                              typeof item.itemTitle === 'string' &&
                              item.itemTitle.toLowerCase().includes('teacher');
                            const isTeacherLocked =
                              isAuthenticated && !isUserTeacher && isTeacherOnlyItem;
                            const canOpenResource = !!openUrl && !isTeacherLocked && isAuthenticated;
                            const canAccessPdf = !!pdfDownloadUrl && !isTeacherLocked && isAuthenticated;

                            return (
                              <article
                                key={`${item.itemTitle}-${idx}`}
                                className={`${styles.materialRow} ${
                                  isActive ? styles.materialRowActive : ''
                                }`}
                              >
                                <div className={styles.materialRowTop}>
                                  <button
                                    type="button"
                                    className={styles.materialSelectButton}
                                    onClick={() => {
                                      setActiveMaterialIndex(idx);
                                      trackUnitEvent('unit_material_selected', {
                                        lesson_id: activeLessonId ?? null,
                                        material_index: idx,
                                        material_title:
                                          item.itemTitle ?? `Resource ${idx + 1}`,
                                      });
                                    }}
                                    aria-pressed={isActive}
                                  >
                                    <span className={styles.materialRowIcon} aria-hidden="true">
                                      <FileText size={15} />
                                    </span>
                                    <span className={styles.materialRowMain}>
                                      <strong>{resourceTitle}</strong>
                                      {(previewItem.itemType || previewItem.itemCat) && (
                                        <span>
                                          {(previewItem.itemType ?? previewItem.itemCat ?? '').toString()}
                                        </span>
                                      )}
                                    </span>
                                  </button>

                                  <div className={styles.materialRowLinks}>
                                    {canOpenResource ? (
                                      <a
                                        className={styles.materialOpenLink}
                                        href={openUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        View
                                      </a>
                                    ) : (
                                      <span className={styles.materialOpenLinkDisabled}>
                                        {isTeacherLocked || !isAuthenticated ? 'Restricted' : 'No file'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {pdfDownloadUrl && (
                                  <div className={styles.materialRowPdfWrap}>
                                    {canAccessPdf ? (
                                      <a
                                        className={styles.materialPdfLink}
                                        href={pdfDownloadUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Download PDF
                                      </a>
                                    ) : (
                                      <span className={styles.materialPdfLinkDisabled}>
                                        PDF download unavailable
                                      </span>
                                    )}
                                  </div>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={styles.unitMutedText}>
                          Materials will appear here once added.
                        </p>
                      )}
                    </div>
                    <div className={styles.lessonPreviewsCard}>
                      {!!activeLessonItems.length ? (
                        (() => {
                          const safeIndex =
                            activeMaterialIndex > activeLessonItems.length - 1
                              ? 0
                              : activeMaterialIndex;
                          const selectedItem = activeLessonItems[safeIndex];
                          const selectedPreviewItem = selectedItem as TPreviewItem;
                          const { openUrl, previewUrl, embedUrl, pdfDownloadUrl } =
                            getMaterialUrls(
                            selectedPreviewItem
                          );
                          const previewImg =
                            (
                              selectedItem as {
                                filePreviewImg?: string;
                              }
                            )?.filePreviewImg ?? null;
                          const previewTitle =
                            selectedItem?.itemTitle ?? `Resource ${safeIndex + 1}`;
                          const previewDescription =
                            selectedItem?.itemDescription ??
                            'Preview details will appear for this material.';
                          const itemTypeLabel =
                            selectedPreviewItem?.itemType?.toLowerCase() ?? '';
                          const selectedIsTeacherOnly =
                            typeof selectedItem?.itemTitle === 'string' &&
                            selectedItem.itemTitle.toLowerCase().includes('teacher');
                          const isPresentation = itemTypeLabel === 'presentation';
                          const frameSrc = isPresentation ? embedUrl ?? previewUrl ?? openUrl : embedUrl ?? previewUrl;
                          const isPreviewLockedLoggedOut = !isAuthenticated;
                          const isPreviewLockedTeacher =
                            isAuthenticated && !isUserTeacher && selectedIsTeacherOnly;
                          const isPreviewLocked =
                            isPreviewLockedLoggedOut || isPreviewLockedTeacher;
                          const canOpenSelected = !!openUrl && !isPreviewLocked;

                          return (
                            <article className={styles.lessonPreviewItem}>
                              <header className={styles.lessonPreviewHeader}>
                                <h4 className={styles.lessonCardHeading}>
                                  <Eye size={16} aria-hidden="true" />
                                  <span>Item preview</span>
                                </h4>
                                {canOpenSelected ? (
                                  <a
                                    className={styles.materialOpenLink}
                                    href={openUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <span>Open in new tab</span>
                                    <SquareArrowOutUpRight size={13} aria-hidden="true" />
                                  </a>
                                ) : isPreviewLocked ? null : (
                                  <span className={styles.materialOpenLinkDisabled}>
                                    No file link
                                  </span>
                                )}
                              </header>
                              <div
                                className={`${styles.lessonPreviewSurface} ${
                                  isPreviewLocked ? styles.lessonPreviewSurfaceLocked : ''
                                }`}
                              >
                                <div
                                  className={`${styles.lessonPreviewMedia} ${
                                    isPreviewLocked ? styles.lessonPreviewMediaBlurred : ''
                                  }`}
                                >
                                  {frameSrc ? (
                                    <iframe title={`${previewTitle} preview`} src={frameSrc} />
                                  ) : previewImg ? (
                                    <img
                                      src={previewImg}
                                      alt={`${previewTitle} preview`}
                                      loading="lazy"
                                    />
                                  ) : previewUrl && isImageUrl(previewUrl) ? (
                                    <img
                                      src={previewUrl}
                                      alt={`${previewTitle} preview`}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <p className={styles.unitMutedText}>
                                      Preview unavailable for this file type.
                                    </p>
                                  )}
                                </div>
                                {isPreviewLocked && (
                                  <div className={styles.lessonPreviewGate}>
                                    <p>
                                      {isPreviewLockedLoggedOut
                                        ? 'Must Be Logged in to View Teaching Materials'
                                        : 'Only viewable by teachers. If you are a teacher, please update your account.'}
                                    </p>
                                    {isPreviewLockedLoggedOut ? (
                                      <div className={styles.lessonPreviewGateActions}>
                                        <Link
                                          href="/gp-plus"
                                          className={styles.lessonPreviewGateButton}
                                          onClick={handleGateNavigateToGpPlus}
                                        >
                                          Create a Free Account
                                        </Link>
                                        <Link
                                          href="/account"
                                          className={styles.lessonPreviewGateButton}
                                          onClick={handleGateNavigateToAccount}
                                        >
                                          Sign In
                                        </Link>
                                      </div>
                                    ) : (
                                      <Link
                                        href="/account?show_about_user_form=true"
                                        className={styles.lessonPreviewGateButton}
                                      >
                                        Update your account
                                      </Link>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className={styles.lessonPreviewMeta}>
                                <strong>{previewTitle}</strong>
                                <p>{previewDescription}</p>
                                {(selectedPreviewItem.itemType ||
                                  selectedPreviewItem.itemCat) && (
                                  <span className={styles.lessonPreviewType}>
                                    {(selectedPreviewItem.itemType ??
                                      selectedPreviewItem.itemCat ??
                                      '').toString()}
                                  </span>
                                )}
                                {pdfDownloadUrl && isAuthenticated && !isPreviewLockedTeacher && (
                                  <a
                                    className={styles.materialPdfLink}
                                    href={pdfDownloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Download PDF
                                  </a>
                                )}
                              </div>
                            </article>
                          );
                        })()
                      ) : (
                        <p className={styles.unitMutedText}>
                          Item previews will appear here.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={styles.lessonProcedureCardFull}>
                    <div className={styles.lessonProcedureCard}>
                      <div className={styles.lessonProcedureInner}>
                        <div className={styles.lessonProcedureHeader}>
                          <h4 className={styles.lessonCardHeading}>
                            <NotebookPen size={16} aria-hidden="true" />
                            <span>Detailed procedure</span>
                          </h4>
                          <span>Chunk-by-chunk guidance with vocab and teacher notes.</span>
                        </div>
                        <div className={styles.lessonProcedureContent}>
                          {activeLesson.chunks?.map((chunk, index) => (
                            <article
                              key={`${chunk.chunkTitle}-${index}`}
                              className={styles.lessonChunk}
                            >
                            <div className={styles.lessonChunkTimeline}>
                              <div
                                className={`${styles.lessonChunkHeader} ${
                                  chunkDurations.length
                                    ? styles.lessonChunkHeaderOverGraph
                                    : ''
                                }`}
                              >
                                {typeof chunk.chunkDur === 'number' ? (
                                  <>
                                    <span className={styles.lessonChunkDuration}>
                                      <Clock3 size={12} aria-hidden="true" />
                                      <span>{chunk.chunkDur} min</span>
                                    </span>
                                  </>
                                ) : null}
                                <h5>{chunk.chunkTitle ?? 'Lesson segment'}</h5>
                              </div>
                              {!!chunkDurations.length && (
                                <ChunkGraph
                                  className={styles.lessonChunkGraph}
                                  durList={chunkDurations}
                                  chunkNum={index}
                                />
                              )}
                            </div>
                            {(() => {
                              return chunk.steps?.map((step, idx) => {
                                const rawStep = (
                                  step as { Step?: number | string | null }
                                ).Step;
                                const stepNumber =
                                  typeof rawStep === 'number'
                                    ? rawStep
                                    : typeof rawStep === 'string'
                                    ? Number.parseInt(rawStep.replace(/[^\d-]/g, ''), 10)
                                    : Number.NaN;
                                const safeStepNumber =
                                  Number.isFinite(stepNumber) && stepNumber > 0
                                    ? stepNumber
                                    : idx + 1;
                                const stepDuration = getStepDuration(
                                  step as {
                                    StepDur?: number | string | null;
                                    StepDuration?: number | string | null;
                                    stepDur?: number | string | null;
                                  }
                                );

                                return (
                                  <div
                                    key={`${step.StepTitle}-${idx}`}
                                    className={styles.lessonStep}
                                  >
                                    <div className={styles.lessonStepMain}>
                                      <div className={styles.lessonStepTitleRow}>
                                        <strong>
                                          {step.StepTitle
                                            ? `${safeStepNumber}. ${step.StepTitle}`
                                            : `${safeStepNumber}.`}
                                        </strong>
                                        {stepDuration != null && (
                                          <span className={styles.lessonStepDuration}>
                                            {stepDuration} min
                                          </span>
                                        )}
                                      </div>
                                      {step.StepQuickDescription && (
                                        <div className={styles.lessonStepQuickDescription}>
                                          <RichText content={step.StepQuickDescription} />
                                        </div>
                                      )}
                                      {step.StepDetails && (
                                        <div className={styles.lessonStepDetails}>
                                          <RichText content={step.StepDetails} />
                                        </div>
                                      )}
                                      {!!step.Vocab && (
                                        <div className={styles.stepInfoBlock}>
                                          <h6>Vocabulary</h6>
                                          <RichText content={step.Vocab} />
                                        </div>
                                      )}
                                    </div>
                                    <aside className={styles.lessonStepAside}>
                                      {!!step.TeachingTips && (
                                        <div className={styles.stepInfoBlock}>
                                          <h6>Teaching tips</h6>
                                          <RichText content={step.TeachingTips} />
                                        </div>
                                      )}
                                      {!!step.VariantNotes && (
                                        <div className={styles.stepInfoBlock}>
                                          <h6>Variant notes</h6>
                                          <RichText content={step.VariantNotes} />
                                        </div>
                                      )}
                                    </aside>
                                  </div>
                                );
                              });
                            })()}
                            </article>
                          ))}
                          {!activeLesson.chunks?.length && (
                            <p className={styles.unitMutedText}>
                              Detailed steps will appear here once added.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={styles.unitMutedText}>
                  Choose a lesson to explore teaching materials.
                </p>
              )}
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
            </div>
          </section>
        )}

        {activeTab === TAB_STANDARDS && (
          <section className={styles.unitSection}>
            <div className={styles.unitOverviewCardWide}>
              {!!flatStandards.length ? (
                <div className={styles.standardsLayout}>
                  <div className={styles.standardsIntroPanel}>
                    <div className={styles.standardsIntroHeading}>
                      <h2 className={styles.standardsIntroTitle}>
                        Interdisciplinary by Design
                      </h2>
                      <p className={styles.standardsIntroLead}>
                        We align to standards across subjects. Our units are
                        ready for STEAM or team teaching, and project based
                        learning (PBLs) with no modification!
                      </p>
                    </div>
                    {overview?.SteamEpaulette && (
                      <div className={styles.standardsEpaulette}>
                        <Image
                          src={overview.SteamEpaulette}
                          alt="STEAM standards alignment epaulette"
                          width={280}
                          height={120}
                          unoptimized
                        />
                      </div>
                    )}
                    <p className={styles.standardsIntroCopy}>
                      This figure visualizes the percentages of standards aligned to each subject.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.mobileFilterDockTrigger}
                    onClick={() => setIsStandardsFilterDockOpen(true)}
                  >
                    <Filter size={15} aria-hidden="true" />
                    <span>Filter standards</span>
                    {!isStandardsFilterDockOpen && activeFilterCount > 0 && (
                      <span className={styles.mobileFilterCount}>
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  {isStandardsFilterDockOpen && (
                    <button
                      type="button"
                      className={styles.mobileFilterDockBackdrop}
                      aria-label="Close standards filters"
                      onClick={() => setIsStandardsFilterDockOpen(false)}
                    />
                  )}
                  <div
                    className={`${styles.standardsFilters} ${
                      isStandardsFilterDockOpen ? styles.standardsFiltersOpen : ''
                    }`}
                  >
                    <div className={styles.standardsFiltersHeader}>
                      <div className={styles.standardsFiltersTitle}>
                        <Filter size={15} aria-hidden="true" />
                        <span>Filter standards</span>
                      </div>
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          className={styles.standardsFiltersReset}
                          onClick={handleResetStandardsFilters}
                        >
                          Reset
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.standardsFiltersClose}
                        aria-label="Close standards filters"
                        onClick={() => setIsStandardsFilterDockOpen(false)}
                      >
                        <X size={15} aria-hidden="true" />
                      </button>
                    </div>
                    <div className={styles.standardsFiltersBody}>
                      <div className={styles.standardsGradeFilters}>
                      {STANDARDS_GRADE_BANDS.map((band) => (
                        (() => {
                          const isSelected = selectedGradeBands.includes(band.key);
                          const isUnavailable =
                            band.key !== 'all' && !availableGradeBands.has(band.key);
                          return (
                        <button
                          key={band.key}
                          type="button"
                          className={
                            isSelected
                              ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonActive}`
                              : isUnavailable
                              ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonDisabled}`
                              : styles.standardsFilterButton
                          }
                          disabled={isUnavailable}
                          onClick={() => handleGradeBandFilter(band.key)}
                        >
                          {band.label}
                        </button>
                          );
                        })()
                      ))}
                      </div>
                      <div className={styles.standardsSubjectFilters}>
                      <button
                        type="button"
                        className={
                          selectedSubjects.includes('all')
                            ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonActive}`
                            : styles.standardsFilterButton
                        }
                        onClick={() => handleSubjectToggle('all')}
                      >
                        All subjects
                      </button>
                      {standardSubjects.map((subject) => (
                        (() => {
                          const isSelected = selectedSubjects.includes(subject);
                          const isUnavailable = !availableSubjects.has(subject);
                          return (
                        <button
                          key={subject}
                          type="button"
                          className={
                            isSelected
                              ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonActive}`
                              : isUnavailable
                              ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonDisabled}`
                              : styles.standardsFilterButton
                          }
                          disabled={isUnavailable}
                          onClick={() => handleSubjectToggle(subject)}
                        >
                          <span
                            className={styles.subjectColorChip}
                            style={{ backgroundColor: getSubjectColor(subject) }}
                            aria-hidden="true"
                          />
                          <span>{subject}</span>
                        </button>
                          );
                        })()
                      ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.standardsSection}>
                    <h3>
                      <Target size={16} aria-hidden="true" />
                      Target standards
                      <span>{targetStandards.length}</span>
                    </h3>
                    <p className={styles.sectionIntro}>
                      Skills and concepts directly taught or reinforced by this
                      lesson.
                    </p>
                    {targetStandardsBySubject.length ? (
                      <div className={styles.standardsList}>
                        {targetStandardsBySubject.map((subjectGroup) => {
                          const mergedByDimension = mergeStandardsByDimension(
                            subjectGroup.standards,
                            subjectGroup.sets
                          );

                          return (
                            <section
                              key={`target-${subjectGroup.subject}`}
                              className={styles.standardSubjectGroup}
                              style={
                                {
                                  '--subject-color': getSubjectColor(
                                    subjectGroup.subject
                                  ),
                                } as React.CSSProperties
                              }
                            >
                              <header className={styles.standardSubjectHeader}>
                                <div className={styles.subjectHeadingWrap}>
                                  <span
                                    className={styles.subjectColorChip}
                                    style={{
                                      backgroundColor: getSubjectColor(
                                        subjectGroup.subject
                                      ),
                                    }}
                                    aria-hidden="true"
                                  />
                                  <h4>{subjectGroup.subject}</h4>
                                  {subjectGroup.sets.map((setName) => (
                                    <span key={setName} className={styles.standardSetPill}>
                                      {setName}
                                    </span>
                                  ))}
                                </div>
                              </header>
                              <div className={styles.standardRows}>
                                {mergedByDimension.map((standard) => (
                                  <article key={standard.id} className={styles.standardRow}>
                                    <div className={styles.standardMetaRow}>
                                      <p className={styles.standardDimensionText}>
                                        <Blocks size={14} aria-hidden="true" />
                                        <span>{standard.dimensionName}</span>
                                      </p>
                                      <p className={styles.standardGradeText}>
                                        <i className="bi bi-mortarboard-fill" aria-hidden="true" />
                                        <span>{formatGradeValue(standard.grades)}</span>
                                      </p>
                                    </div>
                                    <div className={styles.standardStatementWrap}>
                                      {standard.lines.map((line, idx) => (
                                        <div
                                          key={`${standard.id}-line-${idx}`}
                                          className={styles.standardStatementBlock}
                                        >
                                          <p className={styles.standardStatementLine}>
                                            <span className={styles.standardCode}>
                                              {line.code}:
                                            </span>{' '}
                                            <span>{line.statement}</span>
                                          </p>
                                          {!!line.alignmentNote && (
                                            <div className={styles.standardAlignmentNotes}>
                                              <RichText content={line.alignmentNote} />
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </article>
                                ))}
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    ) : (
                      <p className={styles.unitMutedText}>
                        No target standards match these filters.
                      </p>
                    )}
                  </div>
                  <div className={styles.standardsSection}>
                    <h3>
                      <Network size={16} aria-hidden="true" />
                      Connected standards
                      <span>{connectedStandards.length}</span>
                    </h3>
                    <p className={styles.sectionIntro}>
                      Skills and concepts reviewed or hinted at in this lesson
                      (for building upon).
                    </p>
                    {connectedStandardsBySubject.length ? (
                      <div className={styles.standardsList}>
                        {connectedStandardsBySubject.map((subjectGroup) => {
                          const mergedByDimension = mergeStandardsByDimension(
                            subjectGroup.standards,
                            subjectGroup.sets
                          );

                          return (
                            <section
                              key={`connected-${subjectGroup.subject}`}
                              className={styles.standardSubjectGroup}
                              style={
                                {
                                  '--subject-color': getSubjectColor(
                                    subjectGroup.subject
                                  ),
                                } as React.CSSProperties
                              }
                            >
                              <header className={styles.standardSubjectHeader}>
                                <div className={styles.subjectHeadingWrap}>
                                  <span
                                    className={styles.subjectColorChip}
                                    style={{
                                      backgroundColor: getSubjectColor(
                                        subjectGroup.subject
                                      ),
                                    }}
                                    aria-hidden="true"
                                  />
                                  <h4>{subjectGroup.subject}</h4>
                                  {subjectGroup.sets.map((setName) => (
                                    <span key={setName} className={styles.standardSetPill}>
                                      {setName}
                                    </span>
                                  ))}
                                </div>
                              </header>
                              <div className={styles.standardRows}>
                                {mergedByDimension.map((standard) => (
                                  <article key={standard.id} className={styles.standardRow}>
                                    <div className={styles.standardMetaRow}>
                                      <p className={styles.standardDimensionText}>
                                        <Blocks size={14} aria-hidden="true" />
                                        <span>{standard.dimensionName}</span>
                                      </p>
                                      <p className={styles.standardGradeText}>
                                        <i className="bi bi-mortarboard-fill" aria-hidden="true" />
                                        <span>{formatGradeValue(standard.grades)}</span>
                                      </p>
                                    </div>
                                    <div className={styles.standardStatementWrap}>
                                      {standard.lines.map((line, idx) => (
                                        <div
                                          key={`${standard.id}-line-${idx}`}
                                          className={styles.standardStatementBlock}
                                        >
                                          <p className={styles.standardStatementLine}>
                                            <span className={styles.standardCode}>
                                              {line.code}:
                                            </span>{' '}
                                            <span>{line.statement}</span>
                                          </p>
                                          {!!line.alignmentNote && (
                                            <div className={styles.standardAlignmentNotes}>
                                              <RichText content={line.alignmentNote} />
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </article>
                                ))}
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    ) : (
                      <p className={styles.unitMutedText}>
                        No connected standards match these filters.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.standardsIntroPanel}>
                  <div className={styles.standardsIntroHeading}>
                    <h2 className={styles.standardsIntroTitle}>
                      Interdisciplinary by Design
                    </h2>
                    <p className={styles.standardsIntroLead}>
                      We align to standards across subjects. Our units are ready
                      for STEAM or team teaching, and project based learning
                      (PBLs) with no modification!
                    </p>
                  </div>
                  <p className={styles.unitMutedText}>
                    Standards will appear here once aligned.
                  </p>
                </div>
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
            <h2 className={styles.sectionTitle}>Credits, Acknowledgments, and Versions</h2>
            <p className={styles.sectionIntro}>
              This unit was made possible by hundreds of hours of work by tons of
              people. Thank you!
            </p>
            <div className={styles.unitOverviewCardWide}>
              {hasCreditsTabContent ? (
                <div className={styles.creditsLayout}>
                  {!!creditsContent && (
                    <section className={styles.creditsPanel}>
                      <h3>Credits</h3>
                      <div className={styles.richTextBlock}>
                        <RichText content={creditsContent} />
                      </div>
                    </section>
                  )}
                  {!!acknowledgmentsEntries.length && (
                    <section className={styles.creditsPanel}>
                      <h3>Acknowledgments</h3>
                      <div className={styles.acknowledgmentsList}>
                        {acknowledgmentsEntries.map((entry: any, index: number) => (
                          <article
                            key={`${entry.role}-${index}`}
                            className={styles.acknowledgmentEntry}
                          >
                            <h4>{entry.role}</h4>
                            {entry.def && (
                              <div className={styles.richTextBlock}>
                                <RichText content={entry.def} />
                              </div>
                            )}
                            {entry.records?.length ? (
                              <ul>
                                {entry.records
                                  .map((record: any, idx: number) => {
                                    const name = record?.name?.trim?.() ?? '';
                                    const title = record?.title?.trim?.() ?? '';
                                    const affiliation =
                                      record?.affiliation?.trim?.() ?? '';
                                    const location = record?.location?.trim?.() ?? '';

                                    if (!name && !title && !affiliation && !location) {
                                      return null;
                                    }

                                    const recordMarkdown = `${name}${
                                      title ? `${name ? ' · ' : ''}${title}` : ''
                                    }${
                                      affiliation
                                        ? `${name || title ? ', ' : ''}${affiliation}`
                                        : ''
                                    }${location ? ` (${location})` : ''}`;

                                    return (
                                      <li key={`${name || 'record'}-${idx}`}>
                                        <div className={styles.richTextBlock}>
                                          <RichText content={recordMarkdown} />
                                        </div>
                                      </li>
                                    );
                                  })
                                  .filter(Boolean)}
                              </ul>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    </section>
                  )}
                  <section
                    ref={versionNotesAnchorRef}
                    id="major-release-updates"
                    className={styles.creditsPanel}
                  >
                    <h3>Versions</h3>
                    {versionReleases.length ? (
                      <div className={styles.versionNotes}>
                        {versionReleases.map((release: any, index: number) => (
                          <article
                            key={`${release.major_release}-${index}`}
                            className={styles.versionEntry}
                          >
                            <h4>{release.major_release}</h4>
                            {release.sub_releases?.length ? (
                              <ul>
                                {release.sub_releases.map((sub: any, idx: number) => (
                                  <li key={`${sub.version}-${idx}`}>
                                    <p className={styles.versionMeta}>
                                      {sub.version ?? 'Unlabeled version'}
                                      {sub.date ? ` · ${sub.date}` : ''}
                                    </p>
                                    {sub.summary ? (
                                      <div className={styles.richTextBlock}>
                                        <RichText content={sub.summary} />
                                      </div>
                                    ) : null}
                                    {sub.notes ? (
                                      <div className={styles.richTextBlock}>
                                        <RichText content={sub.notes} />
                                      </div>
                                    ) : null}
                                    {sub.acknowledgments ? (
                                      <div className={styles.richTextBlock}>
                                        <RichText content={sub.acknowledgments} />
                                      </div>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className={styles.unitMutedText}>
                                Version details will appear here.
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.unitMutedText}>
                        Version notes will appear here.
                      </p>
                    )}
                  </section>
                </div>
              ) : (
                <p className={styles.unitMutedText}>
                  Credits, acknowledgments, and version notes will appear here.
                </p>
              )}
            </div>
          </section>
        )}
        {activeTab !== TAB_CREDITS && nextTab && (
          <div className={styles.nextTabCtaWrap}>
            <button
              type="button"
              className={styles.nextTabCta}
              onClick={() => handleTabChange(nextTab.key as TTabKey)}
            >
              Next: {nextTab.label}
            </button>
          </div>
        )}
      </main>
      <aside className={styles.licenseBanner} aria-label="Creative Commons license notice">
        <div className={styles.licenseBannerInner}>
          <Image
            src="/imgs/creative-commons_by-nc-sa.svg"
            alt=""
            aria-hidden="true"
            width={126}
            height={44}
          />
          <p className={styles.licenseBannerText}>
            <strong>CC BY-SA 4.0.</strong> Use and adapt with attribution. If you share
            changes, use the same license.
          </p>
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noreferrer"
            className={styles.licenseBannerLink}
          >
            License details
          </a>
        </div>
      </aside>
    </div>
  );
};

export default UnitPage;
