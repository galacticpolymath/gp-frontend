import { ISubject } from '../../backend/models/Unit/types/standards';

export type TGradeBand = 'all' | 'k-2' | '3-5' | '6-8' | '9-12';

export type TStandardsSubjectFilter = 'all' | string;

export type TFlatStandard = {
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

export type TMergedStandardByDimension = {
  id: string;
  dimensionName: string;
  grades: string[];
  lines: TMergedStandardLine[];
};

export const STANDARDS_GRADE_BANDS: { key: TGradeBand; label: string }[] = [
  { key: 'all', label: 'All grade bands' },
  { key: '3-5', label: 'advanced 5' },
  { key: '6-8', label: '6-8' },
  { key: '9-12', label: '9-12' },
];

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

export const isStandardInBand = (grades: string[], gradeBand: TGradeBand) => {
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

export const formatGradeValue = (grades: string[]) => {
  const parsed = parseGrades(grades);
  if (!parsed.length) {
    return 'Grade band not specified';
  }

  const labels = parsed.map((grade) => (grade === 0 ? 'K' : `${grade}`));
  return labels.length === 1
    ? `Grade ${labels[0]}`
    : `Grades ${labels[0]}-${labels[labels.length - 1]}`;
};

export const flattenStandards = (standardsData?: ISubject[] | null): TFlatStandard[] => {
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
        toList(dimension?.standardsGroup).forEach((groupOrStandard: any, groupIndex) => {
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
        });
      });
    });
  });

  return flat;
};

export const groupStandardsBySubject = (standards: TFlatStandard[]) => {
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

export const mergeStandardsByDimension = (
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
      const code = standard.codes[idx] ?? standard.codes[0] ?? 'Code not specified';
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

  const isNgssAligned = setNames.some((setName) => setName.trim().toLowerCase() === 'ngss');

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
