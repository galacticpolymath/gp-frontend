import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import axios from 'axios';
import RichText from '../RichText';
import styles from './UnitPage.module.css';
import {
  Apple,
  BookA,
  BookOpenText,
  ChevronUp,
  Clock3,
  BrainCog,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  GraduationCap,
  Link2,
  NotebookPen,
  Printer,
  Split,
  Lightbulb,
  TextSearch,
  SquareArrowOutUpRight,
} from 'lucide-react';
import { TUnitForUI } from '../../backend/models/Unit/types/unit';
import { IConnectionJobViz } from '../../backend/models/Unit/JobViz';
import {
  IItem,
  IItemForUI,
  INewUnitLesson,
  IResource,
} from '../../backend/models/Unit/types/teachingMaterials';
import { useModalContext } from '../../providers/ModalProvider';
import LocDropdown from '../LocDropdown';
import ChunkGraph from '../LessonSection/TeachIt/ChunkGraph';
import { ISubject } from '../../backend/models/Unit/types/standards';
import { setSessionStorageItem } from '../../shared/fns';
import useSiteSession from '../../customHooks/useSiteSession';
import { ensureValidToken } from '../LessonSection/TeachIt/CopyLessonBtn';
import { useCustomCookies } from '../../customHooks/useCustomCookies';
import { createJobTour } from '../JobViz/JobTours/jobTourApi';
import {
  DEFAULT_JOB_TOUR_ASSIGNMENT,
  DEFAULT_JOB_TOUR_VERSION_PREFIX,
} from '../JobViz/JobTours/jobTourConstants';
import {
  getIconNameForNode,
  getJobSpecificIconName,
  getNodeBySocCode,
} from '../JobViz/jobvizUtils';
import ProfileAvatarRing from '../ProfileAvatarRing';
import OverviewTab from './tabs/OverviewTab';
import StandardsTab from './tabs/StandardsTab';
import CreditsTab from './tabs/CreditsTab';
import MaterialsStandalonePreview from './materials/MaterialsStandalonePreview';
import MaterialsResourcesPanel from './materials/MaterialsResourcesPanel';
import MaterialsPreviewPane from './materials/MaterialsPreviewPane';
import FeaturedMediaPreview from './materials/previews/FeaturedMediaPreview';
import ProcedurePreview from './materials/previews/ProcedurePreview';
import BackgroundPreview from './materials/previews/BackgroundPreview';
import GoingFurtherPreview from './materials/previews/GoingFurtherPreview';
import JobVizPreview from './materials/previews/JobVizPreview';
import MaterialItemPreview from './materials/previews/MaterialItemPreview';
import NextNavigationCta from './shared/NextNavigationCta';
import UnitLicenseBanner from './shared/UnitLicenseBanner';
import {
  parsePreviewFromUrlValue,
  parseTabFromUrlValue,
  PREVIEW_TO_URL,
  TAB_TO_URL,
  URL_PARAM_AUTOPRINT,
  URL_PARAM_LESSON,
  URL_PARAM_PREVIEW,
  URL_PARAM_RESOURCE,
  URL_PARAM_STANDALONE,
  URL_PARAM_TAB,
  URL_STANDALONE_BACKGROUND,
  URL_STANDALONE_PROCEDURE,
} from './urlState';

const TAB_OVERVIEW = 'overview';
const TAB_MATERIALS = 'materials';
const TAB_STANDARDS = 'standards';
const TAB_CREDITS = 'credits';
const LESSON_TILE_FALLBACK_SRC = '/imgs/gp_logo_gradient_transBG.png';

type TTabKey =
  | typeof TAB_OVERVIEW
  | typeof TAB_MATERIALS
  | typeof TAB_STANDARDS
  | typeof TAB_CREDITS;

type TSearchEntry = {
  id: string;
  tab: TTabKey;
  title: string;
  excerpt: string;
  text: string;
  content: string;
  anchorId?: string;
  lessonId?: number | null;
};

type TSearchResult = TSearchEntry & {
  snippet: string;
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

const getMaterialTypeIcon = (itemType?: unknown, itemCat?: unknown) => {
  const rawType =
    typeof itemType === 'string' && itemType.trim()
      ? itemType
      : typeof itemCat === 'string'
      ? itemCat
      : '';
  const normalizedType = rawType.trim().toLowerCase();

  if (
    normalizedType.includes('sheet') ||
    normalizedType.includes('spread') ||
    normalizedType.includes('excel') ||
    normalizedType.includes('csv') ||
    normalizedType.includes('data')
  ) {
    return <FileSpreadsheet size={15} />;
  }
  if (
    normalizedType.includes('image') ||
    normalizedType.includes('photo') ||
    normalizedType.includes('png') ||
    normalizedType.includes('jpg')
  ) {
    return <FileImage size={15} />;
  }
  if (normalizedType.includes('video') || normalizedType.includes('clip')) {
    return <FileVideo size={15} />;
  }
  if (normalizedType.includes('link') || normalizedType.includes('url')) {
    return <Link2 size={15} />;
  }
  if (normalizedType.includes('zip') || normalizedType.includes('archive')) {
    return <FileArchive size={15} />;
  }
  return <FileText size={15} />;
};

const CONSENT_STORAGE_KEY = 'gp_cookie_consent_v1';
const GOOGLE_DRIVE_FOLDER_URL_BASE = 'https://drive.google.com/drive/folders';

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

const setPortalNavHidden = (hidden: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }
  const root = document.documentElement;
  const portalNav = document.querySelector('nav[data-nav-hidden]') as HTMLElement | null;
  const navHeight = portalNav?.getBoundingClientRect().height ?? 0;
  root.style.setProperty('--portal-nav-offset', hidden ? '0px' : `${Math.max(0, Math.round(navHeight))}px`);
  window.dispatchEvent(new CustomEvent('gp:set-nav-hidden', { detail: { hidden } }));
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

const getLessonSearchAnchorId = (lessonId: number) =>
  `unit-search-lesson-${lessonId}`;

const buildContextSnippet = (value: string, term: string, length = 180) => {
  if (!value) return '';
  const normalizedTerm = normalize(term.trim());
  if (!normalizedTerm) {
    return buildExcerpt(value, length);
  }
  const normalizedValue = normalize(value);
  const matchIndex = normalizedValue.indexOf(normalizedTerm);
  if (matchIndex === -1) {
    return buildExcerpt(value, length);
  }
  const padding = Math.max(40, Math.floor((length - normalizedTerm.length) / 2));
  const start = Math.max(0, matchIndex - padding);
  const end = Math.min(value.length, matchIndex + normalizedTerm.length + padding);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < value.length ? '…' : '';
  return `${prefix}${value.slice(start, end).trim()}${suffix}`;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderHighlightedText = (
  value: string,
  term: string,
  markClassName: string
) => {
  const trimmedTerm = term.trim();
  if (!trimmedTerm) {
    return value;
  }
  const matcher = new RegExp(`(${escapeRegExp(trimmedTerm)})`, 'ig');
  const loweredTerm = trimmedTerm.toLowerCase();
  const parts = value.split(matcher);
  return parts.map((part, index) =>
    part.toLowerCase() === loweredTerm ? (
      <mark key={`${part}-${index}`} className={markClassName}>
        {part}
      </mark>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    )
  );
};

const scrollToSearchAnchor = (element: HTMLElement) => {
  if (typeof window === 'undefined') return;
  const topOffset = 140;
  const top = element.getBoundingClientRect().top + window.scrollY - topOffset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
};

const highlightFirstMatchInElement = (
  element: HTMLElement,
  term: string,
  flashClassName: string,
  fadeClassName: string,
  durationMs = 3000
) => {
  const normalizedTerm = term.trim().toLowerCase();
  if (normalizedTerm.length < 2 || typeof window === 'undefined') {
    return null;
  }
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const textNode = node as Text;
    const value = textNode.textContent ?? '';
    const index = value.toLowerCase().indexOf(normalizedTerm);
    if (index >= 0) {
      const range = document.createRange();
      range.setStart(textNode, index);
      range.setEnd(textNode, index + normalizedTerm.length);
      const marker = document.createElement('span');
      marker.className = flashClassName;
      try {
        range.surroundContents(marker);
      } catch {
        return null;
      }
      window.setTimeout(() => {
        marker.classList.add(fadeClassName);
        window.setTimeout(() => {
          const parent = marker.parentNode;
          if (!parent) return;
          while (marker.firstChild) {
            parent.insertBefore(marker.firstChild, marker);
          }
          parent.removeChild(marker);
        }, 420);
      }, durationMs);
      return marker;
    }
    node = walker.nextNode();
  }
  return null;
};

const stripLinePrefix = (value: string) =>
  value
    .replace(/^(authors?|created by|written by|by)\s*[:\-]\s*/i, '')
    .trim();

const normalizeJobVizConnections = (
  connections?: Array<
    IConnectionJobViz | { job_title?: string[] | string; soc_code?: string[] | string } | null
  > | null
): IConnectionJobViz[] => {
  if (!Array.isArray(connections)) {
    return [];
  }

  return connections
    .map((connection) => {
      if (!connection) {
        return null;
      }

      const jobTitle = Array.isArray(connection.job_title)
        ? connection.job_title[0]
        : connection.job_title;
      const socCode = Array.isArray(connection.soc_code)
        ? connection.soc_code[0]
        : connection.soc_code;

      if (
        typeof jobTitle !== 'string' ||
        typeof socCode !== 'string' ||
        !jobTitle.trim() ||
        !socCode.trim()
      ) {
        return null;
      }

      return {
        job_title: jobTitle.trim(),
        soc_code: socCode.trim(),
      };
    })
    .filter((item): item is IConnectionJobViz => !!item);
};

const cleanContributorToken = (value: string) =>
  value
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isLikelyContributorName = (value: string) => {
  if (!value) return false;
  if (value.length < 3 || value.length > 80) return false;
  if (/\d/.test(value)) return false;
  if (/https?:\/\//i.test(value)) return false;

  const blockedWords = [
    'university',
    'department',
    'school',
    'grade',
    'lesson',
    'curriculum',
    'galactic polymath',
    'license',
    'http',
    'www.',
  ];
  const lowered = value.toLowerCase();
  if (blockedWords.some((word) => lowered.includes(word))) return false;

  const words = value.split(/\s+/).filter(Boolean);
  return words.length >= 2 && words.length <= 5;
};

const extractContributorNamesFromCredits = (creditsHtml?: string | null) => {
  if (!creditsHtml) return [];

  const normalizedText = creditsHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\u00a0/g, ' ');
  const lines = normalizedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const left = line.split('|')[0] ?? '';
      const cleaned = stripLinePrefix(left)
        .replace(/^[\s\-*•]+/, '')
        .replace(/^"+|"+$/g, '')
        .trim();
      return isLikelyContributorName(cleaned) ? cleaned : null;
    })
    .filter((name): name is string => !!name);
};

const asContributorName = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const cleaned = cleanContributorToken(value);
    return isLikelyContributorName(cleaned) ? cleaned : null;
  }
  if (!value || typeof value !== 'object') return null;

  const nameField = (value as { name?: unknown }).name;
  if (typeof nameField === 'string') {
    const cleaned = cleanContributorToken(nameField);
    return isLikelyContributorName(cleaned) ? cleaned : null;
  }
  if (nameField && typeof nameField === 'object') {
    const first = (nameField as { first?: unknown }).first;
    const middle = (nameField as { middle?: unknown }).middle;
    const last = (nameField as { last?: unknown }).last;
    const composed = [first, middle, last]
      .filter((part): part is string => typeof part === 'string' && !!part.trim())
      .join(' ')
      .trim();
    return isLikelyContributorName(composed) ? composed : null;
  }
  return null;
};

const dedupeContributors = (names: string[]) => {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    const normalized = name.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(name);
  }
  return unique;
};

const getUnitContributorNames = (
  unit: TUnitForUI,
  acknowledgmentsEntries: any[],
  creditsContent: string
) => {
  const parsedCreditNames = dedupeContributors(
    extractContributorNamesFromCredits(creditsContent)
  );

  if (parsedCreditNames.length) {
    return parsedCreditNames;
  }

  const unitAny = unit as any;
  const structuredCandidates = [
    unitAny?.contributors,
    unitAny?.authors,
    unitAny?.citation?.authors,
    unitAny?.attribution?.authors,
    unitAny?.Sections?.credits?.Contributors,
    unitAny?.Sections?.credits?.contributors,
    unitAny?.Sections?.credits?.Authors,
    unitAny?.Sections?.credits?.authors,
  ]
    .flat()
    .filter(Boolean);
  const structuredNames = structuredCandidates
    .map(asContributorName)
    .filter((name): name is string => !!name);

  const acknowledgmentNames = acknowledgmentsEntries
    .flatMap((entry) => entry?.records ?? [])
    .map((record: any) => asContributorName(record?.name ?? record))
    .filter((name): name is string => !!name);

  return dedupeContributors([
    ...structuredNames,
    ...acknowledgmentNames,
  ]);
};

const getCitationYear = (value?: string | Date | null) => {
  if (!value) return 'n.d.';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'n.d.';
  return `${date.getFullYear()}`;
};

const toVancouverName = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length <= 1) return name;
  const last = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return `${last} ${initials}`.trim();
};

const toVancouverAuthors = (names: string[]) => {
  if (!names.length) return 'Galactic Polymath';
  const formatted = names.map(toVancouverName);
  return formatted.join(', ');
};

const formatVancouverCitedDate = (value: Date) => {
  const year = value.getFullYear();
  const month = value.toLocaleString('en-US', { month: 'short' });
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year} ${month} ${day}`;
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

type TActiveLessonPreviewMode =
  | 'materials'
  | 'procedure'
  | 'background'
  | 'featured-media'
  | 'going-further'
  | 'jobviz';

const parseFeaturedMediaLessonIds = (value?: string | null) => {
  if (!value) {
    return [];
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === 'all') {
    return [];
  }

  return normalized
    .split(/[,/&]|and/gi)
    .map((token) => Number.parseInt(token.replace(/[^\d-]/g, ''), 10))
    .filter((num) => Number.isFinite(num) && num > 0);
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
  externalURL?: string | null;
  gdriveRoot?: string | null;
  itemType?: string | null;
  itemCat?: string | null;
  fileType?: string | null;
};

type TGoingFurtherItem = {
  item?: number | null;
  itemTitle?: string | null;
  itemDescription?: string | null;
  itemLink?: string | null;
};

type TUserGDriveData = {
  userLessonFolderGDriveIds: {
    lessonNum: string;
    lessonDriveId: string;
    gradesRange?: string;
  }[];
  userGDriveItemIdsOfLessonFolder: {
    userGDriveItemCopyId: string;
    originalLessonItemIdInGpGoogleDrive: string;
  }[];
};

type TResolvedLessonFolderResponse = {
  lessonFolder: {
    id: string;
    name: string;
    parentFolder: {
      id: string;
      name: string;
    };
  };
  lessonsFolder: {
    sharedGDriveId: string;
    name: string;
  };
};

const getFirstItemUrl = (item?: TPreviewItem) => {
  if (item?.externalURL) {
    return item.externalURL;
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

const getGoogleDocMatch = (value: string) => {
  const match = value.match(
    /https?:\/\/docs\.google\.com\/(presentation|document|spreadsheets)\/d\/([^/]+)/i
  );
  if (!match?.[1] || !match?.[2]) {
    return null;
  }
  return {
    kind: match[1].toLowerCase() as
      | 'presentation'
      | 'document'
      | 'spreadsheets',
    id: match[2],
  };
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

const getGoogleDriveFolderIdFromUrl = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const folderMatch = value.match(/drive\.google\.com\/drive\/folders\/([^/?]+)/i);
  if (folderMatch?.[1]) {
    return folderMatch[1];
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

const toGoogleOfficeExport = (value: string) => {
  const match = getGoogleDocMatch(value);
  if (!match) {
    return null;
  }

  if (match.kind === 'presentation') {
    return {
      format: 'PPTX',
      url: `https://docs.google.com/presentation/d/${match.id}/export/pptx`,
    };
  }
  if (match.kind === 'document') {
    return {
      format: 'DOCX',
      url: `https://docs.google.com/document/d/${match.id}/export?format=docx`,
    };
  }
  if (match.kind === 'spreadsheets') {
    return {
      format: 'XLSX',
      url: `https://docs.google.com/spreadsheets/d/${match.id}/export?format=xlsx`,
    };
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
  const isPresentationCategory = itemCat === 'presentation';
  const isPresentation = isPresentationType || isPresentationFileType;
  const isPresentationWorksheetVariant =
    isPresentationCategory && !isPresentationType;
  const isWorksheetOrHandout =
    itemType === 'worksheet' ||
    itemType === 'handout' ||
    itemCat === 'worksheet' ||
    itemCat === 'handout';
  const supportsPdfExport =
    !isWebResource &&
    !isPresentation &&
    (isPresentationWorksheetVariant ||
      isWorksheetOrHandout ||
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
      officeDownloadUrl: null,
      officeFormat: null,
    };
  }

  if (item?.gdriveRoot) {
    const gdriveRoot = getNormalizedGDriveRoot(item.gdriveRoot);
    if (isPresentation) {
      const viewUrl = toGoogleDriveViewUrl(gdriveRoot) ?? `${gdriveRoot}/view`;
      return {
        openUrl: viewUrl,
        previewUrl: viewUrl,
        embedUrl: viewUrl,
        pdfDownloadUrl: null,
        officeDownloadUrl: toGoogleOfficeExport(gdriveRoot)?.url ?? null,
        officeFormat: toGoogleOfficeExport(gdriveRoot)?.format ?? null,
      };
    }
    const officeExport = toGoogleOfficeExport(gdriveRoot);
    const previewUrl = `${gdriveRoot}/preview`;
    return {
      openUrl: `${gdriveRoot}/view`,
      previewUrl,
      embedUrl: previewUrl,
      pdfDownloadUrl: supportsPdfExport
        ? toGooglePdfExportUrl(gdriveRoot) ?? null
        : null,
      officeDownloadUrl: officeExport?.url ?? null,
      officeFormat: officeExport?.format ?? null,
    };
  }

  if (!baseUrl) {
    return {
      openUrl: null,
      previewUrl: null,
      embedUrl: null,
      pdfDownloadUrl: null,
      officeDownloadUrl: null,
      officeFormat: null,
    };
  }

  if (isPresentation) {
    const viewUrl = toGoogleDriveViewUrl(baseUrl) ?? baseUrl;
    const officeExport = toGoogleOfficeExport(baseUrl);
    return {
      openUrl: viewUrl,
      previewUrl: viewUrl,
      embedUrl: viewUrl,
      pdfDownloadUrl: null,
      officeDownloadUrl: officeExport?.url ?? null,
      officeFormat: officeExport?.format ?? null,
    };
  }

  const previewUrl = toGoogleDrivePreviewUrl(baseUrl) ?? baseUrl;
  const officeExport = toGoogleOfficeExport(baseUrl);
  const pdfDownloadUrl =
    supportsPdfExport
      ? toGooglePdfExportUrl(baseUrl) ?? (isPdfUrl(baseUrl) ? baseUrl : null)
      : null;

  return {
    openUrl: baseUrl,
    previewUrl,
    embedUrl: isWorksheetOrHandout ? previewUrl : previewUrl,
    pdfDownloadUrl,
    officeDownloadUrl: officeExport?.url ?? null,
    officeFormat: officeExport?.format ?? null,
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

const getLessonResourcePersistKey = (
  resource: IResource<INewUnitLesson<IItemForUI>>,
  index: number
) => {
  const gradePrefix = resource?.gradePrefix?.trim() ?? '';
  const grades = resource?.grades?.trim() ?? '';
  return `${gradePrefix}|${grades}|${index}`;
};

const buildSearchEntries = (
  unit: TUnitForUI,
  lessons: INewUnitLesson<IItemForUI>[],
  flatStandards: TFlatStandard[]
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
      text: overviewText,
      content: normalize(overviewText),
      anchorId: 'unit-search-overview-gist',
    });
  }

  const heroText = stripHtml(
    [unit.Title, unit.Subtitle, unit.ForGrades].filter(Boolean).join(' ')
  );
  if (heroText) {
    entries.push({
      id: 'overview-hero',
      tab: TAB_OVERVIEW,
      title: 'Unit details',
      excerpt: buildExcerpt(heroText),
      text: heroText,
      content: normalize(heroText),
      anchorId: 'unit-search-overview-hero',
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
      text: tagText,
      content: normalize(tagText),
      anchorId: 'unit-search-overview-tags',
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
        text: mediaText,
        content: normalize(mediaText),
        anchorId: 'unit-search-overview-media',
      });
    });
  }

  const materialsPrefaceText = stripHtml(
    teachingMaterials?.unitPreface?.trim() ?? ''
  );
  if (materialsPrefaceText) {
    entries.push({
      id: 'materials-preface',
      tab: TAB_MATERIALS,
      title: 'Teaching materials preface',
      excerpt: buildExcerpt(materialsPrefaceText),
      text: materialsPrefaceText,
      content: normalize(materialsPrefaceText),
      anchorId: 'unit-search-materials-preface',
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
        text: lessonText,
        content: normalize(lessonText),
        anchorId: getLessonSearchAnchorId(lessonId),
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
      text: standardsText,
      content: normalize(standardsText),
      anchorId: 'unit-search-standards-content',
    });
  }

  const standardsDetailText = stripHtml(
    flatStandards
      .map((standard) =>
        [
          standard.subject,
          standard.setName,
          standard.dimensionName,
          standard.codes.join(' '),
          standard.statements.join(' '),
          standard.alignmentNotes,
          standard.grades.join(' '),
        ]
          .filter(Boolean)
          .join(' ')
      )
      .join(' ')
  );

  if (standardsDetailText) {
    entries.push({
      id: 'standards-detail',
      tab: TAB_STANDARDS,
      title: 'Standards details',
      excerpt: buildExcerpt(standardsDetailText),
      text: standardsDetailText,
      content: normalize(standardsDetailText),
      anchorId: 'unit-search-standards-content',
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
      text: combinedCredits,
      content: normalize(combinedCredits),
      anchorId: 'unit-search-credits-content',
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
      text: versionsText,
      content: normalize(versionsText),
      anchorId: 'major-release-updates',
    });
  }

  return entries;
};

const UnitPage: React.FC<{ unit: TUnitForUI }> = ({ unit }) => {
  const {
    status,
    user,
    token,
    isGpPlusMember,
    gdriveAccessToken,
    gdriveRefreshToken,
    gdriveAccessTokenExp,
  } = useSiteSession();
  const { setAppCookie } = useCustomCookies();
  const isAuthenticated = status === 'authenticated';
  const isUserTeacher = Boolean(
    (user as { isTeacher?: boolean } | undefined)?.isTeacher
  );
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [avatarCandidateIndex, setAvatarCandidateIndex] = useState(0);
  const [isAvatarHydrated, setIsAvatarHydrated] = useState(false);
  const avatarCandidates = useMemo(() => {
    const imageValue =
      typeof (user as { image?: unknown } | undefined)?.image === 'string'
        ? ((user as { image?: string }).image ?? '').trim()
        : '';
    const pictureValue =
      typeof (user as { picture?: unknown } | undefined)?.picture === 'string'
        ? ((user as { picture?: string }).picture ?? '').trim()
        : '';
    const profileValue = profileAvatarUrl?.trim() ?? '';
    const localValue = localAvatarUrl?.trim() ?? '';

    return [imageValue, pictureValue, profileValue, localValue].filter(
      (value, index, arr): value is string => Boolean(value) && arr.indexOf(value) === index
    );
  }, [localAvatarUrl, profileAvatarUrl, user]);
  const effectiveAvatarUrl = isAvatarHydrated
    ? avatarCandidates[avatarCandidateIndex] ?? null
    : null;
  const isGpPlusUser = isGpPlusMember === true;
  const isGpPlusResolved = typeof isGpPlusMember === 'boolean';
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
  const classroomResources = teachingMaterials?.classroom?.resources ?? [];
  const unitId = unit?._id ? String(unit._id) : '';
  const gradeBandStorageKey = `unit-materials-grade-band:${unitId}`;
  const [selectedResourceIndex, setSelectedResourceIndex] = useState(0);
  const lessonResources =
    classroomResources[selectedResourceIndex] ??
    getFirstLessonResource(classroomResources);
  const [lessons, setLessons] = useState<INewUnitLesson<IItemForUI>[]>(
    lessonResources?.lessons ?? []
  );

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
    () => buildSearchEntries(unit, lessons, flatStandards),
    [unit, lessons, flatStandards]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchNavigation, setPendingSearchNavigation] = useState<{
    term: string;
    anchorId?: string;
    tab: TTabKey;
    lessonId?: number | null;
  } | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isPortalNavCollapsed, setIsPortalNavCollapsed] = useState(true);
  const [isTagListExpanded, setIsTagListExpanded] = useState(false);
  const [visibleTagCount, setVisibleTagCount] = useState(0);
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  const [activeLessonPreviewMode, setActiveLessonPreviewMode] =
    useState<TActiveLessonPreviewMode>('materials');
  const [standalonePreviewMode, setStandalonePreviewMode] = useState<
    'none' | 'procedure' | 'background'
  >('none');
  const isStandalonePreview = standalonePreviewMode !== 'none';
  const isBackgroundStandaloneView = standalonePreviewMode === 'background';
  const [isRetrievingLessonFolderIds, setIsRetrievingLessonFolderIds] =
    useState(false);
  const [resolvedLessonFolderFromApi, setResolvedLessonFolderFromApi] =
    useState<TResolvedLessonFolderResponse | null>(null);
  const [isResolvingLessonFolder, setIsResolvingLessonFolder] = useState(false);
  const [isGpPlusBannerDismissed, setIsGpPlusBannerDismissed] = useState(false);
  const [isStandardsFilterDockOpen, setIsStandardsFilterDockOpen] =
    useState(false);
  const [selectedGradeBands, setSelectedGradeBands] = useState<TGradeBand[]>([
    'all',
  ]);
  const [selectedSubjects, setSelectedSubjects] = useState<
    TStandardsSubjectFilter[]
  >(['all']);
  const [copiedEntry, setCopiedEntry] = useState<
    'attribution' | 'citation' | null
  >(null);
  const [copyErrorEntry, setCopyErrorEntry] = useState<
    'attribution' | 'citation' | null
  >(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const copyLessonBtnRef = useRef<HTMLButtonElement | null>(null);
  const unitTagListRef = useRef<HTMLDivElement>(null);
  const unitTagMeasureRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const versionNotesAnchorRef = useRef<HTMLDivElement>(null);
  const hasAutoPrintedStandaloneRef = useRef(false);
  const lessonMaterialsGridRef = useRef<HTMLDivElement>(null);
  const lessonPreviewsCardRef = useRef<HTMLDivElement>(null);
  const [lessonPreviewsCardHeight, setLessonPreviewsCardHeight] = useState<
    number | null
  >(null);
  const [lessonMaterialsStickyTop, setLessonMaterialsStickyTop] = useState<
    number | null
  >(null);
  const citationStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [shouldScrollToVersionNotes, setShouldScrollToVersionNotes] =
    useState(false);
  const [officeUpsellFormat, setOfficeUpsellFormat] = useState<string | null>(
    null
  );
  const [isSavingJobVizTour, setIsSavingJobVizTour] = useState(false);
  const [jobVizSaveMessage, setJobVizSaveMessage] = useState<string | null>(
    null
  );
  const [jobVizSaveError, setJobVizSaveError] = useState<string | null>(null);

  useEffect(() => {
    setIsAvatarHydrated(true);
  }, []);

  useEffect(() => {
    setAvatarCandidateIndex(0);
  }, [avatarCandidates]);

  useEffect(() => {
    if (!isAvatarHydrated || !isAuthenticated) return;
    const hasSessionAvatar =
      Boolean((user as { image?: string | null } | undefined)?.image) ||
      Boolean((user as { picture?: string | null } | undefined)?.picture);
    if (hasSessionAvatar) return;

    const localAvatarUrl = (() => {
      if (typeof window === 'undefined') return null;

      try {
        const raw = window.localStorage.getItem('userAccount');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return typeof parsed?.picture === 'string' && parsed.picture
          ? parsed.picture
          : null;
      } catch {
        return null;
      }
    })();

    if (localAvatarUrl) {
      setLocalAvatarUrl(localAvatarUrl);
      return;
    }

    if (!token) return;

    let isCancelled = false;
    (async () => {
      try {
        const { data } = await axios.get<{ picture?: string }>(
          '/api/get-user-account-data',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isCancelled) return;

        if (typeof data?.picture === 'string' && data.picture) {
          setProfileAvatarUrl(data.picture);
        }
      } catch {
        // no-op: fallback initials remain visible
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAvatarHydrated, isAuthenticated, token, user]);
  const shouldShowGradeBandChooser = classroomResources.some(
    (resource) =>
      Boolean(resource?.gradePrefix?.trim() || resource?.grades?.trim())
  );
  const hasMultipleGradeBandOptions = classroomResources.length > 1;
  const teachingMaterialsPreface = teachingMaterials?.unitPreface?.trim() ?? '';

  const searchResults = useMemo<TSearchResult[]>(() => {
    const term = normalize(searchTerm.trim());
    if (term.length < 2) {
      return [];
    }
    return searchEntries
      .filter((entry) => entry.content.includes(term))
      .slice(0, 8)
      .map((entry) => ({
        ...entry,
        snippet: buildContextSnippet(entry.text, searchTerm.trim()),
      }));
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

  useEffect(() => {
    const applyUrlState = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const tabParamValue = params.get(URL_PARAM_TAB) ?? '';
      const lessonValue = params.get(URL_PARAM_LESSON) ?? '';
      const previewParamValue = params.get(URL_PARAM_PREVIEW) ?? '';
      const resourceParamValue = params.get(URL_PARAM_RESOURCE) ?? '';
      const tabValue = tabParamValue
        ? parseTabFromUrlValue(tabParamValue)
        : undefined;

      if (tabValue) {
        const isValid = availableTabs.some((tab) => tab.key === tabValue);
        if (isValid) {
          setActiveTab(tabValue);
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
      const previewValue = previewParamValue
        ? parsePreviewFromUrlValue(previewParamValue)
        : undefined;
      if (previewValue) {
        setActiveLessonPreviewMode(previewValue);
      }

      if (resourceParamValue) {
        const parsed = Number.parseInt(resourceParamValue, 10);
        if (!Number.isNaN(parsed) && parsed >= 0) {
          setActiveMaterialIndex(parsed);
        }
      }
    };

    applyUrlState();
    const handleNavigation = () => applyUrlState();
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [availableTabs, lessons]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const standaloneParam = searchParams.get(URL_PARAM_STANDALONE);
    const shouldShowProcedureOnly = standaloneParam === URL_STANDALONE_PROCEDURE;
    const shouldShowBackgroundOnly = standaloneParam === URL_STANDALONE_BACKGROUND;

    if (shouldShowProcedureOnly || shouldShowBackgroundOnly) {
      setStandalonePreviewMode(
        shouldShowProcedureOnly ? 'procedure' : 'background'
      );
      const lessonFromQuery = Number.parseInt(
        searchParams.get(URL_PARAM_LESSON) ?? '',
        10
      );
      if (!Number.isNaN(lessonFromQuery)) {
        setActiveLessonId(lessonFromQuery);
      }
      setActiveTab(TAB_MATERIALS);
      setActiveLessonPreviewMode(
        shouldShowProcedureOnly ? 'procedure' : 'background'
      );
      return;
    }
    setStandalonePreviewMode('none');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isStandalonePreview) {
      hasAutoPrintedStandaloneRef.current = false;
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const shouldAutoPrint = searchParams.get(URL_PARAM_AUTOPRINT) === '1';
    if (!shouldAutoPrint || hasAutoPrintedStandaloneRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      hasAutoPrintedStandaloneRef.current = true;
      window.print();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [isStandalonePreview]);

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

  const updateUrlState = useCallback(({
    tab,
    lessonId,
    previewMode,
    materialIndex,
  }: {
    tab: TTabKey;
    lessonId?: number | null;
    previewMode?: TActiveLessonPreviewMode | null;
    materialIndex?: number | null;
  }) => {
    if (typeof window === 'undefined') {
      return;
    }
    const currentParams = new URLSearchParams(window.location.search);

    currentParams.set(URL_PARAM_TAB, TAB_TO_URL[tab]);

    if (tab === TAB_MATERIALS && lessonId != null) {
      currentParams.set(URL_PARAM_LESSON, String(lessonId));
    } else {
      currentParams.delete(URL_PARAM_LESSON);
    }

    if (tab === TAB_MATERIALS && previewMode && PREVIEW_TO_URL[previewMode]) {
      currentParams.set(URL_PARAM_PREVIEW, PREVIEW_TO_URL[previewMode]);
    } else {
      currentParams.delete(URL_PARAM_PREVIEW);
    }

    if (
      tab === TAB_MATERIALS &&
      typeof materialIndex === 'number' &&
      materialIndex >= 0
    ) {
      currentParams.set(URL_PARAM_RESOURCE, String(materialIndex));
    } else {
      currentParams.delete(URL_PARAM_RESOURCE);
    }

    const nextQuery = currentParams.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;
    window.history.replaceState(null, '', nextUrl);
  }, []);

  const handleTabChange = (tab: TTabKey) => {
    if (isPortalNavHidden()) {
      suppressPortalNavReveal(1200);
    }
    setActiveTab(tab);
    updateUrlState({
      tab,
      lessonId: tab === TAB_MATERIALS ? activeLessonId : null,
      previewMode: tab === TAB_MATERIALS ? activeLessonPreviewMode : null,
      materialIndex: tab === TAB_MATERIALS ? activeMaterialIndex : null,
    });
    trackUnitEvent('unit_tab_selected', { tab });
    scrollToTop();
  };

  const handleLessonChange = (lessonId: number) => {
    if (isPortalNavHidden()) {
      suppressPortalNavReveal();
    }
    setActiveLessonId(lessonId);
    setActiveTab(TAB_MATERIALS);
    updateUrlState({
      tab: TAB_MATERIALS,
      lessonId,
      previewMode: activeLessonPreviewMode,
      materialIndex: activeMaterialIndex,
    });
    trackUnitEvent('unit_lesson_selected', { lesson_id: lessonId });
    scrollToTop();
  };

  useEffect(() => {
    if (typeof window === 'undefined' || isStandalonePreview) {
      return;
    }

    updateUrlState({
      tab: activeTab,
      lessonId: activeTab === TAB_MATERIALS ? activeLessonId : null,
      previewMode: activeTab === TAB_MATERIALS ? activeLessonPreviewMode : null,
      materialIndex: activeTab === TAB_MATERIALS ? activeMaterialIndex : null,
    });
  }, [
    activeLessonId,
    activeLessonPreviewMode,
    activeMaterialIndex,
    activeTab,
    isStandalonePreview,
    updateUrlState,
  ]);

  const handleSearchSelect = (entry: TSearchResult) => {
    const term = searchTerm.trim();
    if (entry.lessonId) {
      handleLessonChange(entry.lessonId);
    } else {
      handleTabChange(entry.tab);
    }
    setPendingSearchNavigation({
      term,
      anchorId: entry.anchorId,
      tab: entry.tab,
      lessonId: entry.lessonId ?? null,
    });
    setSearchTerm('');
    setIsSearchExpanded(false);
    trackUnitEvent('unit_search_result_selected', {
      result_id: entry.id,
      result_tab: entry.tab,
      lesson_id: entry.lessonId ?? null,
    });
  };

  useEffect(() => {
    if (!pendingSearchNavigation || typeof window === 'undefined') {
      return;
    }
    if (pendingSearchNavigation.tab !== activeTab) {
      return;
    }
    if (
      pendingSearchNavigation.lessonId != null &&
      activeLessonId !== pendingSearchNavigation.lessonId
    ) {
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;
    let attempts = 0;
    const maxAttempts = 16;
    const findAndHighlight = () => {
      if (cancelled) return;
      const anchorElement = pendingSearchNavigation.anchorId
        ? document.getElementById(pendingSearchNavigation.anchorId)
        : null;
      const target = anchorElement as HTMLElement | null;
      if (!target) {
        attempts += 1;
        if (attempts < maxAttempts) {
          timeoutId = window.setTimeout(findAndHighlight, 80);
          return;
        }
        setPendingSearchNavigation(null);
        return;
      }
      const marker = highlightFirstMatchInElement(
        target,
        pendingSearchNavigation.term,
        styles.searchInPageMatchFlash,
        styles.searchInPageMatchFade
      );
      scrollToSearchAnchor(marker ?? target);
      setPendingSearchNavigation(null);
    };

    timeoutId = window.setTimeout(findAndHighlight, 20);
    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [activeLessonId, activeTab, pendingSearchNavigation]);

  const handleSearchToggle = () => {
    setIsSearchExpanded((current) => {
      if (current) {
        setSearchTerm('');
      }
      trackUnitEvent('unit_search_toggled', { expanded: !current });
      return !current;
    });
  };

  const handleTagSearchClick = (
    tagValue: string,
    source: 'unit_hero' | 'lesson_tile'
  ) => {
    const term = tagValue.trim();
    if (!term) {
      return;
    }
    trackUnitEvent('unit_tag_search_clicked', {
      tag: term,
      source,
      tab: activeTab,
      lesson_id: activeLessonId ?? null,
    });
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams();
    params.append('tag', term);
    window.location.assign(`/search?${params.toString()}`);
  };

  const handlePortalNavToggle = () => {
    const nextCollapsed = !isPortalNavCollapsed;
    setPortalNavHidden(nextCollapsed);
    setIsPortalNavCollapsed(nextCollapsed);
    if (nextCollapsed) {
      suppressPortalNavReveal(1200);
    }
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (activeTab !== TAB_MATERIALS || isStandalonePreview) {
      setLessonPreviewsCardHeight(null);
      return;
    }

    let rafId = 0;

    const measurePreviewCardHeight = () => {
      if (!lessonMaterialsGridRef.current) {
        return;
      }

      if (window.innerWidth < 768) {
        setLessonPreviewsCardHeight(null);
        setLessonMaterialsStickyTop(null);
        return;
      }

      const rootStyles = window.getComputedStyle(document.documentElement);
      const portalNavOffset = Number.parseFloat(
        rootStyles.getPropertyValue('--portal-nav-offset')
      );
      const unitStickyHeader = document.querySelector(
        `.${styles.unitStickyHeader}`
      ) as HTMLElement | null;
      const unitStickyHeaderHeight = unitStickyHeader
        ? unitStickyHeader.getBoundingClientRect().height
        : 0;
      const stickyTopOffset =
        (Number.isFinite(portalNavOffset) ? portalNavOffset : 0) +
        unitStickyHeaderHeight +
        0;
      const viewportBottomPadding = 14;
      const nextHeight = Math.max(
        380,
        Math.floor(window.innerHeight - stickyTopOffset - viewportBottomPadding)
      );
      setLessonMaterialsStickyTop(stickyTopOffset);

      setLessonPreviewsCardHeight((currentHeight) => {
        if (currentHeight != null && Math.abs(currentHeight - nextHeight) < 2) {
          return currentHeight;
        }
        return nextHeight;
      });
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(measurePreviewCardHeight);
    };

    scheduleMeasure();
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('gp:set-nav-hidden', scheduleMeasure as EventListener);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(scheduleMeasure)
        : null;

    if (resizeObserver && lessonMaterialsGridRef.current) {
      resizeObserver.observe(lessonMaterialsGridRef.current);
    }
    const unitStickyHeader = document.querySelector(
      `.${styles.unitStickyHeader}`
    ) as HTMLElement | null;
    if (resizeObserver && unitStickyHeader) {
      resizeObserver.observe(unitStickyHeader);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('gp:set-nav-hidden', scheduleMeasure as EventListener);
      resizeObserver?.disconnect();
    };
  }, [
    activeLessonId,
    activeMaterialIndex,
    activeLessonPreviewMode,
    activeTab,
    isStandalonePreview,
  ]);

  const activeLessonIndex = lessons.findIndex(
    (lesson, index) => getLessonIdentifier(lesson, index) === activeLessonId
  );
  const activeLesson =
    activeLessonIndex >= 0 ? lessons[activeLessonIndex] : undefined;
  const activeLessonItems = activeLesson?.itemList ?? [];
  const hasDetailedFlow = !!activeLesson?.chunks?.length;
  const activeLessonFeaturedMedia = useMemo(() => {
    if (!activeLessonId || !unit.FeaturedMultimedia?.length) {
      return [];
    }
    return unit.FeaturedMultimedia.filter((media) => {
      const lessonIds = parseFeaturedMediaLessonIds(
        media?.forLsn ?? (media as { forPart?: string | null })?.forPart ?? null
      );
      if (!lessonIds.length) {
        return false;
      }
      return lessonIds.includes(activeLessonId);
    });
  }, [activeLessonId, unit.FeaturedMultimedia]);
  const hasFeaturedMedia = activeLessonFeaturedMedia.length > 0;
  const hasBackgroundContent = Boolean(unit.Sections?.background?.Content?.trim());
  const isDetailedFlowOpen = activeLessonPreviewMode === 'procedure';
  const isBackgroundOpen = activeLessonPreviewMode === 'background';
  const isFeaturedMediaOpen = activeLessonPreviewMode === 'featured-media';
  const activeLessonGoingFurther = (activeLesson?.goingFurther ?? []).filter(
    Boolean
  ) as TGoingFurtherItem[];
  const hasGoingFurther = activeLessonGoingFurther.length > 0;
  const isGoingFurtherOpen = activeLessonPreviewMode === 'going-further';
  const isJobVizPreviewOpen = activeLessonPreviewMode === 'jobviz';
  const chunkDurations = (activeLesson?.chunks ?? [])
    .map((chunk) => chunk?.chunkDur ?? 0)
    .filter((duration): duration is number => typeof duration === 'number' && duration > 0);
  const activeTabIndex = availableTabs.findIndex((tab) => tab.key === activeTab);
  const nextTab =
    activeTabIndex >= 0 && activeTabIndex < availableTabs.length - 1
      ? availableTabs[activeTabIndex + 1]
      : null;
  const nextLessonId =
    activeLessonIndex >= 0 && activeLessonIndex < lessons.length - 1
      ? getLessonIdentifier(lessons[activeLessonIndex + 1], activeLessonIndex + 1)
      : null;

  const unitTitle = unit.Title ?? 'Unit';
  const unitSubtitle = unit.Subtitle ?? '';
  const jobVizConnections = useMemo(
    () => normalizeJobVizConnections(unit.Sections?.jobvizConnections?.Content),
    [unit.Sections?.jobvizConnections?.Content]
  );
  const hasJobVizConnections = jobVizConnections.length > 0;
  const jobVizSocCodes = useMemo(
    () => jobVizConnections.map((connection) => connection.soc_code),
    [jobVizConnections]
  );
  const jobVizConnectionIcons = useMemo(() => {
    return new Map(
      jobVizConnections.map((connection) => {
        const node = getNodeBySocCode(connection.soc_code);
        const primaryIconName = node
          ? getJobSpecificIconName(node) ?? getIconNameForNode(node)
          : 'BriefcaseBusiness';
        const secondaryIconName = node
          ? getIconNameForNode(node)
          : 'Sparkles';
        return [connection.soc_code, { primaryIconName, secondaryIconName }];
      })
    );
  }, [jobVizConnections]);
  const jobVizPreviewUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (jobVizSocCodes.length) {
      params.set('socCodes', jobVizSocCodes.join(','));
    }
    if (unitTitle) {
      params.set('unitName', unitTitle);
    }
    params.set('preview', '1');
    params.set('student', '1');
    params.set('previewAssignmentBanner', '1');
    return `/jobviz?${params.toString()}`;
  }, [jobVizSocCodes, unitTitle]);
  const unitBanner = unit.UnitBanner ?? '';
  const creditsContent = unit.Sections?.credits?.Content?.trim() ?? '';
  const acknowledgmentsEntries = unit.Sections?.acknowledgments?.Data ?? [];
  const hasCreditsTabContent = Boolean(
    creditsContent || acknowledgmentsEntries.length || versionReleases.length
  );
  const availLocs = unit.Sections?.overview?.availLocs ?? [];
  const locale = unit.locale ?? 'en-US';
  const numID = unit.numID ?? undefined;
  const contributorNames = useMemo(
    () => getUnitContributorNames(unit, acknowledgmentsEntries, creditsContent),
    [acknowledgmentsEntries, creditsContent, unit]
  );
  const citationTitle = `${unitTitle}${unitSubtitle ? `: ${unitSubtitle}` : ''}`;
  const citationSourceUrl = useMemo(() => {
    const fallbackPath =
      typeof numID !== 'undefined' ? `/units/${locale}/${numID}` : '/units';
    const baseUrl =
      typeof unit.URL === 'string' && unit.URL.trim()
        ? unit.URL.trim()
        : fallbackPath;
    return typeof window !== 'undefined' && baseUrl.startsWith('/')
      ? `${window.location.origin}${baseUrl}`
      : baseUrl;
  }, [locale, numID, unit.URL]);
  const citationAuthorsLabel = contributorNames.length
    ? contributorNames.join(', ')
    : 'Galactic Polymath';
  const attributionText = useMemo(
    () =>
      `"${citationTitle}" by ${citationAuthorsLabel}. Source: [Galactic Polymath](${citationSourceUrl}). License: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).`,
    [citationAuthorsLabel, citationSourceUrl, citationTitle]
  );
  const vancouverCitation = useMemo(() => {
    const year = getCitationYear(unit.ReleaseDate);
    const citedDate = formatVancouverCitedDate(new Date());
    return `${toVancouverAuthors(
      contributorNames
    )}. ${citationTitle} [Internet]. Galactic Polymath; ${year} [cited ${citedDate}]. Available from: ${citationSourceUrl}`;
  }, [citationSourceUrl, citationTitle, contributorNames, unit.ReleaseDate]);
  const attributionDisplayParts = useMemo(
    () => ({
      titleByAuthors: `"${citationTitle}" by ${citationAuthorsLabel}.`,
      sourceLabel: 'Galactic Polymath',
      sourceHref: citationSourceUrl,
      licenseLabel: 'CC BY-NC-SA 4.0',
      licenseHref: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    }),
    [citationAuthorsLabel, citationSourceUrl, citationTitle]
  );
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
  const targetStandardsSummary = useMemo(() => {
    const standards = Array.isArray(unit.TargetStandardsCodes)
      ? unit.TargetStandardsCodes
      : [];
    if (!standards.length) {
      return null;
    }

    const normalizedSetNames = standards
      .map((standard) => {
        const raw =
          typeof standard?.set === 'string'
            ? standard.set
            : typeof standard?.subject === 'string'
              ? standard.subject
              : '';
        return raw.trim();
      })
      .filter(Boolean);
    const setNames = Array.from(new Set(normalizedSetNames));
    const primarySet =
      setNames.find((setName) => setName.toLowerCase() === 'ngss') ??
      setNames[0] ??
      'Standards';

    const setScopedStandards = standards.filter((standard) => {
      const setValue =
        typeof standard?.set === 'string'
          ? standard.set.trim().toLowerCase()
          : typeof standard?.subject === 'string'
            ? standard.subject.trim().toLowerCase()
            : '';
      return setValue === primarySet.trim().toLowerCase();
    });

    const dedupeByCode = (items: typeof standards) =>
      Array.from(
        new Set(
          items
            .map((item) =>
              typeof item?.code === 'string' ? item.code.trim().toLowerCase() : ''
            )
            .filter(Boolean)
        )
      ).length;

    const cccItems = setScopedStandards.filter((standard) =>
      /cross[\s-]*cutting.*concept/i.test(standard?.dim ?? '')
    );
    const sepItems = setScopedStandards.filter((standard) =>
      /science.*engineering.*practice|engineering.*science.*practice/i.test(
        standard?.dim ?? ''
      )
    );

    const cccCount = dedupeByCode(cccItems);
    const sepCount = dedupeByCode(sepItems);
    const standardCodes = Array.from(
      new Set(
        setScopedStandards
          .map((standard) =>
            typeof standard?.code === 'string' ? standard.code.trim() : ''
          )
          .filter(Boolean)
      )
    );

    const summaryParts: string[] = [];
    if (standardCodes.length) {
      summaryParts.push(standardCodes.join(', '));
    }
    if (cccCount > 0) {
      summaryParts.push(
        `${cccCount} Cross-Cutting Concept${cccCount === 1 ? '' : 's'} (${
          cccCount === 1 ? 'CCC' : 'CCCs'
        })`
      );
    }
    if (sepCount > 0) {
      summaryParts.push(
        `${sepCount} Science and Engineering Practice${
          sepCount === 1 ? '' : 's'
        } (${sepCount === 1 ? 'SEP' : 'SEPs'})`
      );
    }

    if (!summaryParts.length) {
      const setCount = dedupeByCode(setScopedStandards);
      summaryParts.push(
        `${setCount} target standard${setCount === 1 ? '' : 's'}`
      );
    }

    return {
      set: primarySet,
      details: summaryParts.join(', '),
    };
  }, [unit.TargetStandardsCodes]);
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
    setLessons(lessonResources?.lessons ?? []);
  }, [lessonResources?.lessons]);

  useEffect(() => {
    if (!classroomResources.length || typeof window === 'undefined') {
      return;
    }

    const savedResourceKey = window.localStorage.getItem(gradeBandStorageKey);
    if (!savedResourceKey) {
      return;
    }

    const matchedIndex = classroomResources.findIndex((resource, index) => {
      return getLessonResourcePersistKey(resource, index) === savedResourceKey;
    });

    if (matchedIndex >= 0) {
      setSelectedResourceIndex(matchedIndex);
    }
  }, [classroomResources, gradeBandStorageKey]);

  useEffect(() => {
    if (!classroomResources.length || typeof window === 'undefined') {
      return;
    }

    const selectedResource = classroomResources[selectedResourceIndex];
    if (!selectedResource) {
      return;
    }

    window.localStorage.setItem(
      gradeBandStorageKey,
      getLessonResourcePersistKey(selectedResource, selectedResourceIndex)
    );
  }, [classroomResources, gradeBandStorageKey, selectedResourceIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setPortalNavHidden(true);
    const syncTimer = window.setTimeout(() => setPortalNavHidden(true), 120);
    suppressPortalNavReveal(1200);
    setIsPortalNavCollapsed(true);
    return () => window.clearTimeout(syncTimer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncPortalNavState = () => {
      setIsPortalNavCollapsed(isPortalNavHidden());
    };

    syncPortalNavState();
    const portalNav = document.querySelector('nav[data-nav-hidden]');
    if (!portalNav || typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver(syncPortalNavState);
    observer.observe(portalNav, {
      attributes: true,
      attributeFilter: ['data-nav-hidden'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!lessons.length) {
      setActiveLessonId(null);
      return;
    }

    const lessonStillExists = lessons.some(
      (lesson, index) => getLessonIdentifier(lesson, index) === activeLessonId
    );

    if (!lessonStillExists) {
      setActiveLessonId(getLessonIdentifier(lessons[0], 0));
    }
  }, [activeLessonId, lessons]);

  useEffect(() => {
    setActiveMaterialIndex(0);
    setActiveLessonPreviewMode('materials');
  }, [activeLessonId]);
  useEffect(() => {
    return () => {
      if (citationStatusTimeoutRef.current) {
        clearTimeout(citationStatusTimeoutRef.current);
      }
    };
  }, []);
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;

  const activeLessonSharedGDriveFolder = useMemo(() => {
    if (!activeLesson?.sharedGDriveLessonFolders?.length) {
      return null;
    }

    if (activeLessonId === 100) {
      return (
        activeLesson.sharedGDriveLessonFolders.find(
          (folder) => folder?.name?.toLowerCase() === 'assessments'
        ) ?? null
      );
    }

    const lessonGradeType = (
      (lessonResources as { gradePrefix?: string | null; grades?: string | null }) ??
      {}
    ).gradePrefix
      ? (
          lessonResources as { gradePrefix?: string | null; grades?: string | null }
        ).gradePrefix
      : (
          lessonResources as { gradePrefix?: string | null; grades?: string | null }
        ).grades;

    const normalizedGradeType = lessonGradeType?.toLowerCase().trim();
    if (!normalizedGradeType) {
      return activeLesson.sharedGDriveLessonFolders[0] ?? null;
    }

    const matchingFolder = activeLesson.sharedGDriveLessonFolders.find((folder) => {
      const parentFolderGradeType = folder.parentFolder?.name
        ?.split('_')
        ?.at(-1)
        ?.toLowerCase()
        ?.trim();
      return parentFolderGradeType === normalizedGradeType;
    });

    return matchingFolder ?? activeLesson.sharedGDriveLessonFolders[0] ?? null;
  }, [activeLesson, activeLessonId, lessonResources]);

  const resolvedLessonsFolder = useMemo(() => {
    if (activeLesson?.lessonsFolder?.sharedGDriveId) {
      return activeLesson.lessonsFolder;
    }

    const fallbackLesson = lessons.find(
      (lesson) => lesson?.lessonsFolder?.sharedGDriveId
    );
    return fallbackLesson?.lessonsFolder;
  }, [activeLesson, lessons]);

  const resolvedAllUnitLessons = useMemo(() => {
    if (activeLesson?.allUnitLessons?.length) {
      return activeLesson.allUnitLessons;
    }

    const fallbackLesson = lessons.find((lesson) => lesson?.allUnitLessons?.length);
    return fallbackLesson?.allUnitLessons;
  }, [activeLesson, lessons]);

  const activeLessonSharedGDriveFolderFallback = useMemo(() => {
    if (!resolvedAllUnitLessons?.length || activeLesson?.lsn == null) {
      return null;
    }

    const lessonIdStr = String(activeLesson.lsn);
    const matchedLesson = resolvedAllUnitLessons.find(
      (lesson) => lesson.id === lessonIdStr
    );

    if (!matchedLesson?.sharedGDriveId) {
      return null;
    }

    return {
      id: matchedLesson.sharedGDriveId,
      name: activeLesson.title ?? `lesson-${lessonIdStr}`,
      parentFolder: {
        id:
          resolvedLessonsFolder?.sharedGDriveId ??
          unit.GdrivePublicID ??
          '',
        name:
          resolvedLessonsFolder?.name ??
          unit.MediumTitle ??
          unit.Title ??
          'Unit',
      },
    };
  }, [
    activeLesson,
    resolvedAllUnitLessons,
    resolvedLessonsFolder,
    unit.GdrivePublicID,
    unit.MediumTitle,
    unit.Title,
  ]);

  const resolvedActiveLessonSharedFolder =
    activeLessonSharedGDriveFolder ?? activeLessonSharedGDriveFolderFallback;
  const selectedGradeBandFolderId = getGoogleDriveFolderIdFromUrl(
    lessonResources?.links?.url?.[0] ?? null
  );

  useEffect(() => {
    let didCancel = false;

    const resolveLessonFolder = async () => {
      if (!unit.GdrivePublicID || activeLessonId == null) {
        setResolvedLessonFolderFromApi(null);
        setIsResolvingLessonFolder(false);
        return;
      }

      setIsResolvingLessonFolder(true);

      try {
        const url = new URL(
          `${window.location.origin}/api/gp-plus/resolve-lesson-folder`
        );
        url.searchParams.set('unitRootFolderId', unit.GdrivePublicID);
        url.searchParams.set('lessonId', String(activeLessonId));
        if (selectedGradeBandFolderId) {
          url.searchParams.set('gradeBandFolderId', selectedGradeBandFolderId);
        }

        const response = await fetch(url.href);
        if (!response.ok || didCancel) {
          setResolvedLessonFolderFromApi(null);
          return;
        }

        const data = (await response.json()) as TResolvedLessonFolderResponse;
        if (!didCancel) {
          setResolvedLessonFolderFromApi(data);
        }
      } catch (error) {
        console.error('Failed to resolve lesson folder from API:', error);
        if (!didCancel) {
          setResolvedLessonFolderFromApi(null);
        }
      } finally {
        if (!didCancel) {
          setIsResolvingLessonFolder(false);
        }
      }
    };

    resolveLessonFolder();
    return () => {
      didCancel = true;
    };
  }, [activeLessonId, selectedGradeBandFolderId, unit.GdrivePublicID]);

  const resolvedLessonsFolderForCopy = useMemo(() => {
    if (resolvedLessonsFolder?.sharedGDriveId) {
      return {
        sharedGDriveId: resolvedLessonsFolder.sharedGDriveId,
        name:
          resolvedLessonsFolder.name?.trim() ||
          lessonResources?.links?.linkText?.trim() ||
          lessonResources?.grades?.trim() ||
          lessonResources?.gradePrefix?.trim() ||
          unit.MediumTitle ||
          unit.Title ||
          'Lesson Materials',
      };
    }

    const parentFolder = (
      resolvedActiveLessonSharedFolder as {
        parentFolder?: { id?: string; name?: string };
      } | null
    )?.parentFolder;

    if (parentFolder?.id && parentFolder?.name) {
      return {
        sharedGDriveId: parentFolder.id,
        name: parentFolder.name,
      };
    }

    const rootMaterialsFolderUrl = lessonResources?.links?.url?.[0] ?? null;
    const rootMaterialsFolderId = getGoogleDriveFolderIdFromUrl(rootMaterialsFolderUrl);
    if (rootMaterialsFolderId) {
      return {
        sharedGDriveId: rootMaterialsFolderId,
        name:
          lessonResources?.links?.linkText?.trim() ||
          lessonResources?.grades?.trim() ||
          'Lesson Materials',
      };
    }

    if (unit.GdrivePublicID) {
      return {
        sharedGDriveId: unit.GdrivePublicID,
        name:
          unit.MediumTitle?.trim() ||
          unit.Title?.trim() ||
          'Lesson Materials',
      };
    }

    return undefined;
  }, [
    lessonResources,
    resolvedActiveLessonSharedFolder,
    resolvedLessonsFolder,
    unit.GdrivePublicID,
    unit.MediumTitle,
    unit.Title,
  ]);

  const lessonFolderIdFromAllUnitLessons =
    activeLessonId != null
      ? resolvedAllUnitLessons?.find(
          (lesson) => lesson.id === String(activeLessonId)
        )?.sharedGDriveId
      : undefined;
  const resolvedSharedFolderIdForCopy =
    resolvedLessonFolderFromApi?.lessonFolder?.id ||
    resolvedActiveLessonSharedFolder?.id ||
    lessonFolderIdFromAllUnitLessons ||
    selectedGradeBandFolderId ||
    unit.GdrivePublicID ||
    '';
  const resolvedSharedFolderNameForCopy =
    resolvedLessonFolderFromApi?.lessonFolder?.name?.trim() ||
    resolvedActiveLessonSharedFolder?.name?.trim() ||
    activeLesson?.title?.trim() ||
    `Lesson ${activeLessonId ?? ''}`.trim() ||
    'Lesson';
  const effectiveLessonsFolderForCopy = useMemo(() => {
    const folderId =
      resolvedLessonFolderFromApi?.lessonsFolder?.sharedGDriveId?.trim() ||
      resolvedLessonsFolderForCopy?.sharedGDriveId?.trim() ||
      (resolvedActiveLessonSharedFolder as { parentFolder?: { id?: string } } | null)
        ?.parentFolder?.id?.trim() ||
      undefined;

    if (!folderId) {
      return undefined;
    }

    const folderName =
      resolvedLessonFolderFromApi?.lessonsFolder?.name?.trim() ||
      resolvedLessonsFolderForCopy?.name?.trim() ||
      (resolvedActiveLessonSharedFolder as { parentFolder?: { name?: string } } | null)
        ?.parentFolder?.name?.trim() ||
      lessonResources?.links?.linkText?.trim() ||
      lessonResources?.grades?.trim() ||
      lessonResources?.gradePrefix?.trim() ||
      unit.MediumTitle?.trim() ||
      unit.Title?.trim() ||
      'Lesson Materials';

    return {
      sharedGDriveId: folderId,
      name: folderName,
    };
  }, [
    lessonResources,
    resolvedActiveLessonSharedFolder,
    resolvedLessonFolderFromApi,
    resolvedLessonsFolderForCopy,
    unit.MediumTitle,
    unit.Title,
  ]);
  const lessonsGradesForCopy =
    lessonResources?.grades?.trim() ||
    lessonResources?.gradePrefix?.trim() ||
    'default';
  const allUnitLessonsForCopy =
    resolvedAllUnitLessons?.length
      ? resolvedAllUnitLessons
      : resolvedSharedFolderIdForCopy && activeLessonId != null
      ? [
          {
            id: String(activeLessonId),
            sharedGDriveId: resolvedSharedFolderIdForCopy,
          },
        ]
      : undefined;

  const hasValidLessonsFolderForCopy = Boolean(
    effectiveLessonsFolderForCopy?.sharedGDriveId &&
      effectiveLessonsFolderForCopy?.name
  );
  // Copy requires both the lesson source folder and the lessons container folder mapping.
  const canShowCopyAllToGoogleDriveBtn = Boolean(
    resolvedSharedFolderIdForCopy &&
      hasValidLessonsFolderForCopy &&
      allUnitLessonsForCopy?.length
  );
  const browseAllMaterialsUrl = lessonResources?.links?.url?.[0] ?? null;
  const canBrowseAllMaterials = Boolean(browseAllMaterialsUrl);
  const isCopyAllDisabledForGpPlus = isGpPlusUser && !canShowCopyAllToGoogleDriveBtn;
  const isBrowseDisabledForGpPlus = isGpPlusUser && !canBrowseAllMaterials;
  const copyAllUnavailableReason =
    isResolvingLessonFolder
      ? 'Resolving lesson folder...'
      : 'Copy is unavailable because the lesson folder mapping is still resolving. Please wait a moment and try again.';
  const browseUnavailableReason =
    'Browse is unavailable because this lesson does not yet have a mapped Google Drive folder.';

  const selectMaterialItem = (
    index: number,
    itemTitle: string | null | undefined
  ) => {
    setActiveLessonPreviewMode('materials');
    setActiveMaterialIndex(index);
    trackUnitEvent('unit_material_selected', {
      lesson_id: activeLessonId ?? null,
      material_index: index,
      material_title: itemTitle ?? `Resource ${index + 1}`,
    });
  };

  useEffect(() => {
    if (
      !isAuthenticated ||
      !isGpPlusUser ||
      !token ||
      !gdriveAccessToken ||
      !gdriveRefreshToken ||
      !gdriveAccessTokenExp ||
      !unitId ||
      !lessonResources?.lessons?.length
    ) {
      return;
    }

    const gradesRange = (
      lessonResources as { grades?: string | null } | null
    )?.grades;
    if (!gradesRange) {
      return;
    }

    const lessonNumIds = lessonResources.lessons
      .map((lesson) => lesson?.lsn)
      .filter((lsn): lsn is number => typeof lsn === 'number')
      .map((lsn) => lsn.toString());

    const gpLessonItemIds = lessonResources.lessons.flatMap((lesson) =>
      (lesson.itemList ?? [])
        .map((item) =>
          'gpGDriveItemId' in item && item.gpGDriveItemId
            ? String(item.gpGDriveItemId)
            : ''
        )
        .filter(Boolean)
    );

    if (!lessonNumIds.length || !gpLessonItemIds.length) {
      return;
    }

    let didCancel = false;

    const retrieveUserLessonFolderIds = async () => {
      setIsRetrievingLessonFolderIds(true);

      try {
        const validToken = await ensureValidToken(gdriveAccessTokenExp, setAppCookie);
        if (!validToken || didCancel) {
          return;
        }

        const url = new URL(
          `${window.location.origin}/api/gp-plus/get-gdrive-lesson-ids`
        );

        lessonNumIds.forEach((lessonNumId) => {
          url.searchParams.append('lessonNumIds', lessonNumId);
        });
        gpLessonItemIds.forEach((itemId) => {
          url.searchParams.append('lessonItemIds', itemId);
        });
        url.searchParams.append('unitId', unitId);
        url.searchParams.append('grades', gradesRange);

        const response = await fetch(url.href, {
          headers: {
            Authorization: `Bearer ${token}`,
            'gdrive-token': validToken,
            'gdrive-token-refresh': gdriveRefreshToken,
          },
        });

        if (!response.ok || didCancel) {
          return;
        }

        const data = (await response.json()) as TUserGDriveData | null;
        if (!data || didCancel) {
          return;
        }

        setLessons((currentLessons) => {
          return currentLessons.map((lesson) => {
            const lessonNumId =
              typeof lesson.lsn === 'number' ? lesson.lsn.toString() : '';
            const userLessonFolder = data.userLessonFolderGDriveIds?.find(
              (folder) => folder.lessonNum === lessonNumId
            );

            const itemList = (lesson.itemList ?? []).map((item) => {
              const gpItemId =
                'gpGDriveItemId' in item && item.gpGDriveItemId
                  ? item.gpGDriveItemId
                  : null;

              if (!gpItemId) {
                return item;
              }

              const copiedItem = data.userGDriveItemIdsOfLessonFolder?.find(
                (itemCopy) =>
                  itemCopy.originalLessonItemIdInGpGoogleDrive === gpItemId
              );

              return copiedItem?.userGDriveItemCopyId
                ? { ...item, userGDriveItemCopyId: copiedItem.userGDriveItemCopyId }
                : item;
            });

            return {
              ...lesson,
              itemList,
              userGDriveLessonFolderId: userLessonFolder?.lessonDriveId,
            };
          });
        });
      } catch (error) {
        console.error('Failed to retrieve user lesson folder ids:', error);
      } finally {
        if (!didCancel) {
          setIsRetrievingLessonFolderIds(false);
        }
      }
    };

    retrieveUserLessonFolderIds();

    return () => {
      didCancel = true;
    };
  }, [
    gdriveAccessToken,
    gdriveAccessTokenExp,
    gdriveRefreshToken,
    isAuthenticated,
    isGpPlusUser,
    lessonResources,
    setAppCookie,
    token,
    unitId,
  ]);

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

  const handleCopyAllUpsellClick = () => {
    const currentUrl = getCurrentUnitUrl();
    if (currentUrl) {
      setSessionStorageItem('userEntryRedirectUrl', currentUrl);
    }
    window.location.assign('/gp-plus');
  };

  const handleBrowseAllMaterialsClick = () => {
    if (!isGpPlusUser) {
      handleCopyAllUpsellClick();
      return;
    }

    if (!browseAllMaterialsUrl) {
      return;
    }

    window.open(browseAllMaterialsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyAllMaterialsClick = () => {
    if (!isGpPlusUser) {
      handleCopyAllUpsellClick();
      return;
    }

    if (!canShowCopyAllToGoogleDriveBtn) {
      return;
    }

    copyLessonBtnRef.current?.click();
  };

  const handlePreviewJobVizAssignmentClick = () => {
    if (!hasJobVizConnections) {
      return;
    }
    window.open(jobVizPreviewUrl, '_blank', 'noopener,noreferrer');
  };

  const getJobTourVersionString = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${DEFAULT_JOB_TOUR_VERSION_PREFIX}.${now.getFullYear()}${month}${day}`;
  };

  const handleSaveJobVizTourClick = async () => {
    if (!isAuthenticated || !isGpPlusUser || !token || !hasJobVizConnections) {
      return;
    }

    setIsSavingJobVizTour(true);
    setJobVizSaveMessage(null);
    setJobVizSaveError(null);

    try {
      const payload = {
        heading: `${unitTitle} JobViz Tour`,
        whoCanSee: 'me' as const,
        classSubject: alignedSubjects[0] ?? 'Science',
        gradeLevel: 'All',
        tags: ['JobViz', unitTitle].filter(Boolean),
        gpUnitsAssociated: [
          String(unit.numID ?? unit._id ?? unitTitle),
        ].filter(Boolean),
        explanation: '',
        assignment: DEFAULT_JOB_TOUR_ASSIGNMENT,
        selectedJobs: Array.from(new Set(jobVizSocCodes)),
        version: getJobTourVersionString(),
        publishedDate: null,
      };

      const result = await createJobTour(payload, token);
      setJobVizSaveMessage('Tour saved to My JobViz Tours.');

      if (result?.jobTourId) {
        window.open(`/jobviz?tourId=${result.jobTourId}&edit=1`, '_blank', 'noopener,noreferrer');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.msg ||
        error?.message ||
        'Unable to save this JobViz tour right now.';
      setJobVizSaveError(message);
    } finally {
      setIsSavingJobVizTour(false);
    }
  };

  const handleOpenOfficeUpsell = (format: string) => {
    setOfficeUpsellFormat(format);
  };

  const handleCloseOfficeUpsell = () => {
    setOfficeUpsellFormat(null);
  };

  const openStandalonePreviewInNewTab = (
    mode: 'procedure' | 'background',
    autoPrint = false
  ) => {
    if (typeof window === 'undefined' || activeLessonId == null) {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.hash = '';
    const searchParams = new URLSearchParams();
    searchParams.set(
      URL_PARAM_STANDALONE,
      mode === 'procedure'
        ? URL_STANDALONE_PROCEDURE
        : URL_STANDALONE_BACKGROUND
    );
    searchParams.set(URL_PARAM_LESSON, String(activeLessonId));
    if (autoPrint) {
      searchParams.set(URL_PARAM_AUTOPRINT, '1');
    }
    nextUrl.search = `?${searchParams.toString()}`;
    window.open(nextUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  const handleOpenProcedureInNewTab = () => {
    openStandalonePreviewInNewTab('procedure');
  };
  const handleOpenBackgroundInNewTab = () => {
    openStandalonePreviewInNewTab('background');
  };

  const handlePrintProcedureFromPreview = () => {
    openStandalonePreviewInNewTab('procedure', true);
  };

  const handlePrintBackgroundFromPreview = () => {
    openStandalonePreviewInNewTab('background', true);
  };

  const handleCopyCitation = async (
    text: string,
    entryType: 'attribution' | 'citation'
  ) => {
    if (typeof window === 'undefined') {
      return;
    }

    const setStatusWithReset = (status: 'copied' | 'error') => {
      if (status === 'copied') {
        setCopiedEntry(entryType);
        setCopyErrorEntry(null);
      } else {
        setCopiedEntry(null);
        setCopyErrorEntry(entryType);
      }
      if (citationStatusTimeoutRef.current) {
        clearTimeout(citationStatusTimeoutRef.current);
      }
      citationStatusTimeoutRef.current = setTimeout(() => {
        setCopiedEntry(null);
        setCopyErrorEntry(null);
      }, 2200);
    };

    try {
      await navigator.clipboard.writeText(text);
      setStatusWithReset('copied');
      return;
    } catch (error) {}

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const wasCopied = document.execCommand('copy');
      document.body.removeChild(textarea);
      setStatusWithReset(wasCopied ? 'copied' : 'error');
    } catch (error) {
      setStatusWithReset('error');
    }
  };

  const latestCopiedLessonFolderId = activeLesson?.userGDriveLessonFolderId?.trim();
  const latestCopiedLessonFolderUrl = latestCopiedLessonFolderId
    ? `${GOOGLE_DRIVE_FOLDER_URL_BASE}/${latestCopiedLessonFolderId}`
    : null;
  const fixedLessonPaneStyle =
    lessonPreviewsCardHeight != null
      ? {
          height: `${lessonPreviewsCardHeight}px`,
          maxHeight: `${lessonPreviewsCardHeight}px`,
        }
      : undefined;
  const previewPaneStickyStyle =
    lessonMaterialsStickyTop != null
      ? {
          ...fixedLessonPaneStyle,
          position: 'sticky' as const,
          top: `${lessonMaterialsStickyTop}px`,
          alignSelf: 'start' as const,
        }
      : fixedLessonPaneStyle;

  const renderProcedurePanel = (
    showLinkOutAction: boolean,
    showPanelHeading = true,
    panelClassName?: string
  ) => {
    const prep = activeLesson?.lsnPrep;
    const prepTitle = prep?.prepTitle;
    const prepDur = prep?.prepDur;
    const prepQuickDescription = prep?.prepQuickDescription;
    const prepDetails = prep?.prepDetails;
    const prepTeachingTips = prep?.prepTeachingTips;
    const prepVariantNotes = prep?.prepVariantNotes;
    const hasPrepContent = Boolean(
      prep &&
        (prepTitle ||
          prepDur != null ||
          prepQuickDescription ||
          prepDetails ||
          prepTeachingTips ||
          prepVariantNotes)
    );

    return (
      <div
        className={
          panelClassName
            ? `${styles.lessonProcedureInPreview} ${panelClassName}`
            : styles.lessonProcedureInPreview
        }
      >
        <div className={styles.lessonProcedureHeader}>
          {(showPanelHeading || showLinkOutAction) && (
            <div className={styles.lessonProcedureHeaderTop}>
              {showPanelHeading ? (
                <h3 className={styles.lessonCardHeading}>
                  <Apple size={16} aria-hidden="true" />
                  <span>Lesson Procedure</span>
                </h3>
              ) : (
                <span />
              )}
              {showLinkOutAction && (
                <div className={styles.lessonPreviewHeaderActions}>
                  <button
                    type="button"
                    className={styles.procedureLinkOutBtn}
                    onClick={handlePrintProcedureFromPreview}
                  >
                    <span>Print</span>
                    <Printer size={13} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.procedureLinkOutBtn}
                    onClick={handleOpenProcedureInNewTab}
                  >
                    <span>Open in New Tab</span>
                    <SquareArrowOutUpRight size={13} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}
          {showPanelHeading && (
            <span>Chunk-by-chunk guidance with vocab and teacher notes.</span>
          )}
        </div>
        <div className={styles.lessonProcedureContent}>
          {hasPrepContent && (
            <section className={styles.lessonPrepSection}>
              <div className={styles.lessonPrepHeader}>
                <Clock3 size={16} aria-hidden="true" />
                {prepDur != null && (
                  <span className={styles.lessonPrepDuration}>
                    {prepDur} min
                  </span>
                )}
                <h4>{prepTitle ?? 'Prep'}</h4>
              </div>
              {prepQuickDescription && (
                <div className={styles.lessonStepQuickDescription}>
                  <RichText content={prepQuickDescription} />
                </div>
              )}
              {prepDetails && (
                <div className={styles.lessonStepDetails}>
                  <RichText content={prepDetails} />
                </div>
              )}
              <aside className={styles.lessonPrepAside}>
                {!!prepTeachingTips && (
                  <div
                    className={`${styles.stepInfoBlock} ${styles.stepInfoBlockTeachingTips}`}
                  >
                    <h6 className={styles.stepInfoHeading}>
                      <Lightbulb size={14} aria-hidden="true" />
                      <span>Teaching tips</span>
                    </h6>
                    <RichText content={prepTeachingTips} />
                  </div>
                )}
                {!!prepVariantNotes && (
                  <div
                    className={`${styles.stepInfoBlock} ${styles.stepInfoBlockVariantNotes}`}
                  >
                    <h6 className={styles.stepInfoHeading}>
                      <Split size={14} aria-hidden="true" />
                      <span>Variant notes</span>
                    </h6>
                    <RichText content={prepVariantNotes} />
                  </div>
                )}
              </aside>
            </section>
          )}
          {activeLesson?.chunks?.map((chunk, index) => (
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
                  <span className={styles.lessonChunkDuration}>
                    <Clock3 size={12} aria-hidden="true" />
                    <span>{chunk.chunkDur} min:</span>
                  </span>
                ) : null}
                <h5 className={styles.lessonChunkTitle}>
                  {chunk.chunkTitle ?? 'Lesson segment'}
                </h5>
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
                const hasStepAsideContent = Boolean(
                  step.Vocab || step.TeachingTips || step.VariantNotes
                );

                return (
                  <div
                    key={`${step.StepTitle}-${idx}`}
                    className={`${styles.lessonStep} ${
                      hasStepAsideContent
                        ? styles.lessonStepWithAside
                        : styles.lessonStepFullWidth
                    }`}
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
                    </div>
                    {hasStepAsideContent && (
                      <aside className={styles.lessonStepAside}>
                        {!!step.Vocab && (
                          <div className={styles.stepInfoBlock}>
                            <h6 className={styles.stepInfoHeading}>
                              <BookA size={14} aria-hidden="true" />
                              <span>Vocabulary</span>
                            </h6>
                            <RichText content={step.Vocab} />
                          </div>
                        )}
                        {!!step.TeachingTips && (
                          <div
                            className={`${styles.stepInfoBlock} ${styles.stepInfoBlockTeachingTips}`}
                          >
                            <h6 className={styles.stepInfoHeading}>
                              <Lightbulb size={14} aria-hidden="true" />
                              <span>Teaching tips</span>
                            </h6>
                            <RichText content={step.TeachingTips} />
                          </div>
                        )}
                        {!!step.VariantNotes && (
                          <div
                            className={`${styles.stepInfoBlock} ${styles.stepInfoBlockVariantNotes}`}
                          >
                            <h6 className={styles.stepInfoHeading}>
                              <Split size={14} aria-hidden="true" />
                              <span>Variant notes</span>
                            </h6>
                            <RichText content={step.VariantNotes} />
                          </div>
                        )}
                      </aside>
                    )}
                  </div>
                );
              });
            })()}
          </article>
        ))}
        {!activeLesson?.chunks?.length && (
          <p className={styles.unitMutedText}>
            Detailed steps will appear here once added.
          </p>
        )}
        <p className={styles.procedureEndMarker}>End</p>
      </div>
    </div>
    );
  };

  const renderBackgroundPanel = (
    showLinkOutAction: boolean,
    showPanelHeading = true,
    panelClassName?: string
  ) => {
    const backgroundContent = unit.Sections?.background?.Content?.trim() ?? '';

    return (
      <div
        className={
          panelClassName
            ? `${styles.lessonProcedureInPreview} ${panelClassName}`
            : styles.lessonProcedureInPreview
        }
      >
        <div className={styles.lessonProcedureHeader}>
          {(showPanelHeading || showLinkOutAction) && (
            <div className={styles.lessonProcedureHeaderTop}>
              {showPanelHeading ? (
                <h3 className={styles.lessonCardHeading}>
                  <BookOpenText size={16} aria-hidden="true" />
                  <span>Background</span>
                </h3>
              ) : (
                <span />
              )}
              {showLinkOutAction && (
                <div className={styles.lessonPreviewHeaderActions}>
                  <button
                    type="button"
                    className={styles.procedureLinkOutBtn}
                    onClick={handlePrintBackgroundFromPreview}
                  >
                    <span>Print</span>
                    <Printer size={13} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.procedureLinkOutBtn}
                    onClick={handleOpenBackgroundInNewTab}
                  >
                    <span>Open in New Tab</span>
                    <SquareArrowOutUpRight size={13} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}
          {showPanelHeading && (
            <span>Context and real-world connections for this unit.</span>
          )}
        </div>
        <div
          id="unit-search-background-content"
          className={styles.lessonProcedureContent}
        >
          {backgroundContent ? (
            <div className={styles.richTextBlock}>
              <RichText content={backgroundContent} />
            </div>
          ) : (
            <p className={styles.unitMutedText}>Background content will appear here.</p>
          )}
        </div>
      </div>
    );
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
  const handleProcedureReturnClick = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    if (typeof window === 'undefined') {
      return;
    }
    window.location.assign(procedureReturnHref);
  };
  const handlePrintPreview = () => {
    if (typeof window === 'undefined') {
      return;
    }
    window.print();
  };

  const currentLessonLabel =
    activeLesson && isAssessmentLesson(activeLesson, activeLessonIndex)
      ? 'Assessment'
      : `Lesson ${activeLessonId ?? ''}`;
  const procedureReturnHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set(URL_PARAM_TAB, TAB_TO_URL[TAB_MATERIALS]);
    params.set(URL_PARAM_LESSON, String(activeLessonId ?? ''));
    const materialsPathWithQuery = `?${params.toString()}`;

    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      currentUrl.hash = '';
      currentUrl.search = materialsPathWithQuery;
      return `${currentUrl.pathname}${currentUrl.search}`;
    }

    if (typeof unit.URL === 'string' && unit.URL.trim()) {
      try {
        const sourceUrl = new URL(unit.URL.trim());
        sourceUrl.hash = '';
        sourceUrl.search = materialsPathWithQuery;
        return `${sourceUrl.pathname}${sourceUrl.search}`;
      } catch (error) {}
    }

    if (numID != null) {
      return `/units/${locale}/${numID}${materialsPathWithQuery}`;
    }

    return `/units/${locale}${materialsPathWithQuery}`;
  }, [activeLessonId, locale, numID, unit.URL]);
  const procedureReturnQrUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new URL(procedureReturnHref, window.location.origin).toString();
    }

    if (typeof unit.URL === 'string' && unit.URL.trim()) {
      try {
        const fallback = new URL(unit.URL.trim());
        const params = new URLSearchParams();
        params.set(URL_PARAM_TAB, TAB_TO_URL[TAB_MATERIALS]);
        params.set(URL_PARAM_LESSON, String(activeLessonId ?? ''));
        fallback.hash = '';
        fallback.search = `?${params.toString()}`;
        return fallback.toString();
      } catch (error) {}
    }

    return procedureReturnHref;
  }, [activeLessonId, procedureReturnHref, unit.URL]);

  return (
    <div
      className={`${styles.unitPage} ${
        isStandalonePreview ? styles.unitPageProcedureOnly : ''
      }`}
    >
      {!isStandalonePreview && (
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
                    <TextSearch size={16} aria-hidden="true" />
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
                    placeholder="Search within this unit"
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
                <button
                  type="button"
                  className={styles.unitNavVisibilityToggle}
                  onClick={handlePortalNavToggle}
                  aria-label={isPortalNavCollapsed ? 'Profile menu' : 'Collapse menu'}
                >
                  <ChevronUp
                    size={18}
                    aria-hidden="true"
                    className={
                      isPortalNavCollapsed
                        ? styles.unitNavVisibilityToggleIconCollapsed
                        : styles.unitNavVisibilityToggleIconExpanded
                    }
                  />
                  {isPortalNavCollapsed ? (
                    <span className={styles.unitNavProfileSummary}>
                      <ProfileAvatarRing
                        avatarUrl={effectiveAvatarUrl}
                        isPlusMember={isGpPlusUser}
                        size={22}
                        onError={() =>
                          setAvatarCandidateIndex((currentIndex) =>
                            currentIndex + 1 < avatarCandidates.length
                              ? currentIndex + 1
                              : avatarCandidates.length
                          )
                        }
                      />
                    </span>
                  ) : (
                    <span>Collapse</span>
                  )}
                </button>
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
                        ) : (
                          <span className={styles.lessonSubtabThumb} aria-hidden="true">
                            <Image
                              src={LESSON_TILE_FALLBACK_SRC}
                              alt=""
                              width={22}
                              height={22}
                            />
                          </span>
                        )}
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
                        {renderHighlightedText(
                          entry.title,
                          searchTerm,
                          styles.searchResultHighlight
                        )}
                      </span>
                      <span className={styles.searchResultExcerpt}>
                        {renderHighlightedText(
                          entry.snippet,
                          searchTerm,
                          styles.searchResultHighlight
                        )}
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
      )}

      {activeTab === TAB_OVERVIEW && (
        <section
          id="unit-search-overview-hero"
          className={`${styles.unitHero} ${styles.unitTabFadeIn}`}
        >
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
                  <div
                    id="unit-search-overview-tags"
                    ref={unitTagListRef}
                    className={styles.unitTagList}
                  >
                    {tagsToDisplay.map((tag, index) => (
                      <button
                        key={`${tag}-${index}`}
                        type="button"
                        className={`${styles.unitTag} ${styles.unitTagButton}`}
                        title="Search for related resources"
                        aria-label={`Search for related resources: ${tag}`}
                        onClick={() => handleTagSearchClick(tag, 'unit_hero')}
                      >
                        {tag}
                      </button>
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
          <OverviewTab
            unit={unit}
            overview={overview}
            onGoToStandards={() => handleTabChange(TAB_STANDARDS)}
            additionalAlignedSubjects={additionalAlignedSubjects}
            targetStandardsSummary={targetStandardsSummary}
          />
        )}

        {activeTab === TAB_MATERIALS && (
          <section className={`${styles.unitSection} ${styles.unitTabFadeIn}`}>
            <div className={styles.materialsLayout}>
              {activeLesson ? (
                isStandalonePreview ? (
                  <MaterialsStandalonePreview
                    isBackgroundStandaloneView={isBackgroundStandaloneView}
                    handlePrintPreview={handlePrintPreview}
                    procedureReturnHref={procedureReturnHref}
                    handleProcedureReturnClick={handleProcedureReturnClick}
                    unitBanner={unitBanner}
                    unitTitle={unitTitle}
                    currentLessonLabel={currentLessonLabel}
                    activeLesson={activeLesson}
                    lessonTileFallbackSrc={LESSON_TILE_FALLBACK_SRC}
                    procedureReturnQrUrl={procedureReturnQrUrl}
                    renderBackgroundPanel={renderBackgroundPanel}
                    renderProcedurePanel={renderProcedurePanel}
                  />
                ) : (
                <div
                  key={`lesson-content-${activeLessonId ?? 'none'}`}
                  id={
                    activeLessonId != null
                      ? getLessonSearchAnchorId(activeLessonId)
                      : undefined
                  }
                  className={`${styles.lessonLayout} ${styles.unitTabFadeIn}`}
                >
                  <div className={styles.lessonSummaryCard}>
                    <div className={styles.lessonSummaryMain}>
                      {!isAssessmentLesson(activeLesson, activeLessonIndex) && (
                        <div className={styles.lessonEyebrowRow}>
                          <p className={styles.lessonEyebrow}>
                            Lesson {getLessonIdentifier(activeLesson, activeLessonIndex)}
                          </p>
                          {typeof activeLesson.lsnDur === 'number' && (
                            <button
                              type="button"
                              className={styles.lessonDurationPill}
                              onClick={() => setActiveLessonPreviewMode('procedure')}
                              aria-label="Open lesson procedure preview"
                            >
                              <i className="bi bi-clock-history" aria-hidden="true" />
                              {activeLesson.lsnDur} min
                            </button>
                          )}
                        </div>
                      )}
                      <div className={styles.lessonTitleMarkdown}>
                        <RichText content={activeLesson.title ?? 'Untitled lesson'} />
                      </div>
                      {activeLesson.lsnPreface && (
                        <RichText
                          className={styles.lessonPreface}
                          content={activeLesson.lsnPreface}
                        />
                      )}
                      {!!activeLesson.learningObj?.length && (
                        <div className={styles.lessonObjectives}>
                          <h4 className={styles.lessonObjectivesLead}>
                            <BrainCog size={16} aria-hidden="true" />
                            Students will be able to:
                          </h4>
                          <ul>
                            {activeLesson.learningObj.map((item, idx) => (
                              <li key={`${item}-${idx}`}>
                                <RichText content={item} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {!!(activeLesson.lsnTags ?? activeLesson.tags ?? []).length && (
                        <div className={styles.lessonTileTags}>
                          {(activeLesson.lsnTags ?? activeLesson.tags ?? []).map(
                            (tag, tagIndex) => (
                              <span
                                key={`${tag}-${tagIndex}`}
                                className={styles.lessonTileTagWrap}
                              >
                                <button
                                  type="button"
                                  className={styles.lessonTileTag}
                                  title="Search for related resources"
                                  aria-label={`Search for related resources: ${tag}`}
                                  onClick={() => handleTagSearchClick(tag, 'lesson_tile')}
                                >
                                  {tag}
                                </button>
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <div className={styles.lessonSummaryMeta}>
                      <div className={styles.lessonTileMediaLarge} aria-hidden="true">
                        <Image
                          src={activeLesson.tile || LESSON_TILE_FALLBACK_SRC}
                          alt={`${activeLesson.title ?? 'Lesson'} tile`}
                          width={180}
                          height={180}
                        />
                      </div>
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
                    </div>
                  </div>
                  {(teachingMaterialsPreface || shouldShowGradeBandChooser) && (
                    <div
                      id="unit-search-materials-preface"
                      className={styles.gradeBandSelectorCard}
                    >
                      {teachingMaterialsPreface && (
                        <div className={styles.gradeBandPreface}>
                          <RichText content={teachingMaterialsPreface} />
                        </div>
                      )}
                      {shouldShowGradeBandChooser && (
                        <div className={styles.gradeBandChooser}>
                          <h4 className={styles.gradeBandHeading}>
                            <GraduationCap size={15} aria-hidden="true" />
                            <span>Available Grade Bands</span>
                          </h4>
                          <div className={styles.gradeBandOptions}>
                            {classroomResources.map((resource, index) => {
                              const label =
                                resource.gradePrefix?.trim() ||
                                resource.grades?.trim() ||
                                `Option ${index + 1}`;
                              const optionId = `grade-band-${unitId}-${index}`;
                              return (
                                <label
                                  key={optionId}
                                  htmlFor={optionId}
                                  className={styles.gradeBandOption}
                                >
                                  <input
                                    id={optionId}
                                    type="radio"
                                    name={`grade-band-${unitId}`}
                                    checked={selectedResourceIndex === index}
                                    onChange={() => setSelectedResourceIndex(index)}
                                    disabled={!hasMultipleGradeBandOptions}
                                  />
                                  <span>{label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    ref={lessonMaterialsGridRef}
                    className={styles.lessonMaterialsGrid}
                  >
                    <MaterialsResourcesPanel
                      isGpPlusUser={isGpPlusUser}
                      isGpPlusBannerDismissed={isGpPlusBannerDismissed}
                      setIsGpPlusBannerDismissed={setIsGpPlusBannerDismissed}
                      setIsGpPlusModalDisplayed={setIsGpPlusModalDisplayed}
                      quickStartProps={{
                        isFeaturedMediaOpen,
                        isDetailedFlowOpen,
                        isBackgroundOpen,
                        isGoingFurtherOpen,
                        hasFeaturedMedia,
                        hasDetailedFlow,
                        hasBackgroundContent,
                        hasGoingFurther,
                        setActiveLessonPreviewMode,
                      }}
                      gpPlusFunctionsProps={{
                        isJobVizPreviewOpen,
                        hasJobVizConnections,
                        setActiveLessonPreviewMode,
                        handleBrowseAllMaterialsClick,
                        handleCopyAllMaterialsClick,
                        isBrowseDisabledForGpPlus,
                        isCopyAllDisabledForGpPlus,
                        latestCopiedLessonFolderUrl,
                        browseUnavailableReason,
                        copyAllUnavailableReason,
                        isGpPlusUser,
                        canShowCopyAllToGoogleDriveBtn,
                        copyLessonBtnRef,
                        unitId,
                        unit,
                        activeLessonId,
                        activeLesson,
                        lessonsGradesForCopy,
                        resolvedSharedFolderIdForCopy,
                        resolvedSharedFolderNameForCopy,
                        allUnitLessonsForCopy,
                        effectiveLessonsFolderForCopy,
                        isRetrievingLessonFolderIds,
                        setLessons,
                      }}
                      previewDownloadProps={{
                        activeLessonItems,
                        activeLessonPreviewMode,
                        activeMaterialIndex,
                        isAuthenticated,
                        isUserTeacher,
                        isGpPlusUser,
                        isGpPlusMember,
                        isGpPlusResolved,
                        getMaterialTypeIcon,
                        getMaterialUrls,
                        selectMaterialItem,
                        handleOpenOfficeUpsell,
                      }}
                    />
                    <MaterialsPreviewPane
                      lessonPreviewsCardRef={lessonPreviewsCardRef}
                      previewPaneStickyStyle={previewPaneStickyStyle}
                      activeLessonPreviewMode={activeLessonPreviewMode}
                    >
                      {isFeaturedMediaOpen ? (
                        <FeaturedMediaPreview
                          hasFeaturedMedia={hasFeaturedMedia}
                          activeLessonFeaturedMedia={activeLessonFeaturedMedia}
                        />
                      ) : isDetailedFlowOpen ? (
                        <ProcedurePreview renderProcedurePanel={renderProcedurePanel} />
                      ) : isBackgroundOpen ? (
                        <BackgroundPreview renderBackgroundPanel={renderBackgroundPanel} />
                      ) : isGoingFurtherOpen ? (
                        <GoingFurtherPreview
                          hasGoingFurther={hasGoingFurther}
                          activeLessonGoingFurther={activeLessonGoingFurther}
                        />
                      ) : isJobVizPreviewOpen ? (
                        <JobVizPreview
                          hasJobVizConnections={hasJobVizConnections}
                          unitTitle={unitTitle}
                          jobVizConnections={jobVizConnections}
                          jobVizConnectionIcons={jobVizConnectionIcons}
                          isGpPlusUser={isGpPlusUser}
                          isAuthenticated={isAuthenticated}
                          isSavingJobVizTour={isSavingJobVizTour}
                          handlePreviewJobVizAssignmentClick={handlePreviewJobVizAssignmentClick}
                          handleSaveJobVizTourClick={handleSaveJobVizTourClick}
                          jobVizSaveMessage={jobVizSaveMessage}
                          jobVizSaveError={jobVizSaveError}
                        />
                      ) : !!activeLessonItems.length ? (
                        <MaterialItemPreview
                          activeLessonItems={activeLessonItems}
                          activeMaterialIndex={activeMaterialIndex}
                          getMaterialUrls={getMaterialUrls}
                          toGooglePdfExportUrl={toGooglePdfExportUrl}
                          getNormalizedGDriveRoot={getNormalizedGDriveRoot}
                          getFirstItemUrl={getFirstItemUrl}
                          isImageUrl={isImageUrl}
                          isAuthenticated={isAuthenticated}
                          isUserTeacher={isUserTeacher}
                          isGpPlusUser={isGpPlusUser}
                          isGpPlusMember={isGpPlusMember}
                          handleGateNavigateToGpPlus={handleGateNavigateToGpPlus}
                          handleGateNavigateToAccount={handleGateNavigateToAccount}
                          handleCopyAllMaterialsClick={handleCopyAllMaterialsClick}
                          handleOpenOfficeUpsell={handleOpenOfficeUpsell}
                          isCopyAllDisabledForGpPlus={isCopyAllDisabledForGpPlus}
                          latestCopiedLessonFolderUrl={latestCopiedLessonFolderUrl}
                        />
                      ) : (
                        <p className={styles.unitMutedText}>
                          Item previews will appear here.
                        </p>
                      )}
                    </MaterialsPreviewPane>
                  </div>
                </div>
                )
              ) : (
                <p className={styles.unitMutedText}>
                  Choose a lesson to explore teaching materials.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === TAB_STANDARDS && (
          <StandardsTab
            flatStandards={flatStandards}
            overview={overview}
            isStandardsFilterDockOpen={isStandardsFilterDockOpen}
            setIsStandardsFilterDockOpen={setIsStandardsFilterDockOpen}
            activeFilterCount={activeFilterCount}
            handleResetStandardsFilters={handleResetStandardsFilters}
            standardsGradeBands={STANDARDS_GRADE_BANDS}
            selectedGradeBands={selectedGradeBands}
            availableGradeBands={availableGradeBands}
            handleGradeBandFilter={handleGradeBandFilter}
            selectedSubjects={selectedSubjects}
            handleSubjectToggle={handleSubjectToggle}
            standardSubjects={standardSubjects}
            availableSubjects={availableSubjects}
            getSubjectColor={getSubjectColor}
            targetStandards={targetStandards}
            targetStandardsBySubject={targetStandardsBySubject}
            connectedStandards={connectedStandards}
            connectedStandardsBySubject={connectedStandardsBySubject}
            mergeStandardsByDimension={mergeStandardsByDimension}
            formatGradeValue={formatGradeValue}
          />
        )}

        {activeTab === TAB_CREDITS && (
          <CreditsTab
            hasCreditsTabContent={hasCreditsTabContent}
            creditsContent={creditsContent}
            acknowledgmentsEntries={acknowledgmentsEntries}
            versionNotesAnchorRef={versionNotesAnchorRef}
            versionReleases={versionReleases}
          />
        )}
        <NextNavigationCta
          activeTab={activeTab}
          materialsTabKey={TAB_MATERIALS}
          creditsTabKey={TAB_CREDITS}
          isStandalonePreview={isStandalonePreview}
          nextLessonId={nextLessonId}
          nextTab={nextTab}
          handleLessonChange={handleLessonChange}
          handleTabChange={(tabKey) => handleTabChange(tabKey as TTabKey)}
        />
        <UnitLicenseBanner
          isStandalonePreview={isStandalonePreview}
          attributionDisplayParts={attributionDisplayParts}
          copiedEntry={copiedEntry}
          copyErrorEntry={copyErrorEntry}
          handleCopyCitation={handleCopyCitation}
          attributionText={attributionText}
          vancouverCitation={vancouverCitation}
        />
        {officeUpsellFormat && (
          <div
            className={styles.officeUpsellModalBackdrop}
            role="presentation"
            onClick={handleCloseOfficeUpsell}
          >
            <div
              className={styles.officeUpsellModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="office-upsell-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 id="office-upsell-title">Editable {officeUpsellFormat} files are GP+ only</h3>
              <p>
                With a GP+ subscription, you can download editable Office files for
                teaching materials and unlock the full GP+ toolkit.
              </p>
              <div className={styles.officeUpsellActions}>
                <Link href="/plus" className={styles.officeUpsellPrimary}>
                  Explore GP+ Benefits
                </Link>
                <button
                  type="button"
                  className={styles.officeUpsellSecondary}
                  onClick={handleCloseOfficeUpsell}
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UnitPage;
