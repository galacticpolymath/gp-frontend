import type { JobVizGridItem } from "./JobVizGrid";

export type JobVizSortMetric = "title" | "growthPercent" | "wage";
export type JobVizSortDirection = "asc" | "desc";

export interface JobVizSortOption {
  id: string;
  label: string;
  detail?: string;
  icon: "ArrowUp" | "ArrowDown";
  metric: JobVizSortMetric;
  direction: JobVizSortDirection;
}

const parseNumeric = (value: number | string | null | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const compareNumeric = (
  a: JobVizGridItem,
  b: JobVizGridItem,
  metric: Extract<JobVizSortMetric, "growthPercent" | "wage">,
  direction: JobVizSortDirection
) => {
  const aValue = parseNumeric(a[metric]);
  const bValue = parseNumeric(b[metric]);
  if (aValue === null && bValue === null) return 0;
  if (aValue === null) return 1;
  if (bValue === null) return -1;
  return direction === "asc" ? aValue - bValue : bValue - aValue;
};

const compareTitle = (
  a: JobVizGridItem,
  b: JobVizGridItem,
  direction: JobVizSortDirection
) => {
  const aTitle = a.title ?? "";
  const bTitle = b.title ?? "";
  const result = aTitle.localeCompare(bTitle, undefined, {
    sensitivity: "base",
  });
  return direction === "asc" ? result : -result;
};

const buildComparator =
  (option: JobVizSortOption) =>
  (a: JobVizGridItem, b: JobVizGridItem): number => {
    if (option.metric === "title") {
      return compareTitle(a, b, option.direction);
    }

    return compareNumeric(
      a,
      b,
      option.metric,
      option.direction
    );
  };

export const JOBVIZ_SORT_OPTIONS: JobVizSortOption[] = [
  {
    id: "title-asc",
    label: "Job Title",
    detail: "(A-Z)",
    icon: "ArrowUp",
    metric: "title",
    direction: "asc",
  },
  {
    id: "title-desc",
    label: "Job Title",
    detail: "(Z-A)",
    icon: "ArrowDown",
    metric: "title",
    direction: "desc",
  },
  {
    id: "growth-asc",
    label: "Growth",
    icon: "ArrowUp",
    metric: "growthPercent",
    direction: "asc",
  },
  {
    id: "growth-desc",
    label: "Growth",
    icon: "ArrowDown",
    metric: "growthPercent",
    direction: "desc",
  },
  {
    id: "wage-asc",
    label: "Median Wage",
    icon: "ArrowUp",
    metric: "wage",
    direction: "asc",
  },
  {
    id: "wage-desc",
    label: "Median Wage",
    icon: "ArrowDown",
    metric: "wage",
    direction: "desc",
  },
];

export const JOBVIZ_DEFAULT_SORT_OPTION =
  JOBVIZ_SORT_OPTIONS.find((option) => option.id === "title-desc") ??
  JOBVIZ_SORT_OPTIONS[0];

export const getSortOptionById = (id?: string | null) =>
  JOBVIZ_SORT_OPTIONS.find((option) => option.id === id) ??
  JOBVIZ_DEFAULT_SORT_OPTION;

export const sortJobVizItems = <T extends JobVizGridItem>(
  items: T[],
  sortOptionId?: string | null
): T[] => {
  const option = getSortOptionById(sortOptionId ?? undefined);
  const comparator = buildComparator(option);
  const categories: T[] = [];
  const jobItems: T[] = [];

  items.forEach((item) => {
    if (item.level === 1) {
      categories.push(item);
    } else {
      jobItems.push(item);
    }
  });

  categories.sort(comparator);
  jobItems.sort(comparator);

  return [...categories, ...jobItems];
};
