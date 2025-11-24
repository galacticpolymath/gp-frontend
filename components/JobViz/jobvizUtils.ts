import jobVizDataObj from "../../data/Jobviz/jobVizDataObj.json";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../LessonSection/JobVizConnections";

export interface JobVizNode {
  id: number;
  title: string;
  soc_code: string;
  occupation_type: "Summary" | "Line item" | string;
  hierarchy: number;
  level1: string | null;
  level2: string | null;
  level3: string | null;
  level4: string | null;
  path: string;
  def?: string | null;
  soc_title?: string | null;
  median_annual_wage?: number | null;
  employment_change_percent?: number | string | null;
  typical_education_needed_for_entry?: string | null;
  work_experience_in_a_related_occupation?: string | null;
  ["typical_on-the-job_training_needed_to_attain_competency_in_the_occupation"]?: string | null;
  BLS_link?: string | null;
}

export interface ParsedJobvizPath {
  targetLevel: number;
  selectedLevel: string | null;
  idPath: number[];
}

export interface AssignmentParams {
  socCodes?: Set<string> | string[] | string | null;
  unitName?: string | null;
}

const clampLevel = (level: number) => Math.min(Math.max(level, 1), 4);

export const jobVizData: JobVizNode[] = jobVizDataObj.data as JobVizNode[];

export const jobVizNodeById = new Map<number, JobVizNode>(
  jobVizData.map((node) => [node.id, node])
);

const nodeByCodeAndHierarchy = new Map<string, JobVizNode>();
const nodeBySocCode = new Map<string, JobVizNode>();

jobVizData.forEach((node) => {
  nodeByCodeAndHierarchy.set(`${node.soc_code}:${node.hierarchy}`, node);
  if (node.soc_code) {
    nodeBySocCode.set(node.soc_code, node);
  }
});

export const parseJobvizPath = (
  segments?: string[] | string | string[][] | null
): ParsedJobvizPath => {
  const parts: string[] = Array.isArray(segments)
    ? segments.flatMap((segment) =>
        Array.isArray(segment) ? segment : [segment]
      )
    : typeof segments === "string"
      ? segments.split("/").filter(Boolean)
      : [];

  const targetLevel = clampLevel(parseInt(parts[0] ?? "1", 10) || 1);
  const selectedLevel = parts[1] ?? null;
  const idPath = parts
    .slice(2)
    .map((id) => parseInt(id, 10))
    .filter((num) => !Number.isNaN(num));

  return { targetLevel, selectedLevel, idPath };
};

const normalizeSocCodes = (
  socCodes?: AssignmentParams["socCodes"]
): string[] => {
  if (!socCodes) return [];
  if (typeof socCodes === "string") {
    return socCodes
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean);
  }
  if (Array.isArray(socCodes)) {
    return socCodes
      .map((code) => code.toString().trim())
      .filter(Boolean);
  }

  return Array.from(socCodes).map((code) => code.toString().trim());
};

export const filterJobsBySocCodes = (
  jobs: JobVizNode[],
  socCodes?: AssignmentParams["socCodes"]
) => {
  const normalized = normalizeSocCodes(socCodes);

  if (!normalized.length) return jobs;

  const targetCodes = new Set(normalized);

  return jobs.filter((job) => job.soc_code && targetCodes.has(job.soc_code));
};

export const getDisplayTitle = (node: JobVizNode) =>
  node.soc_title ?? node.title;

const iconByPrefix: Record<string, string> = {
  "11": "BriefcaseBusiness",
  "13": "LineChart",
  "15": "Cpu",
  "17": "Cog",
  "19": "Atom",
  "21": "GraduationCap",
  "23": "Gavel",
  "25": "BookOpenCheck",
  "27": "Palette",
  "29": "Stethoscope",
  "31": "HandHeart",
  "33": "ShieldAlert",
  "35": "CookingPot",
  "37": "Sparkles",
  "39": "HeartPulse",
  "41": "BadgeDollarSign",
  "43": "Files",
  "45": "Tractor",
  "47": "Hammer",
  "49": "Wrench",
  "51": "Factory",
  "53": "Truck",
  "55": "ShieldHalf",
};

export const getIconNameForNode = (node: JobVizNode) => {
  const prefix = node.soc_code?.slice(0, 2);
  return (prefix && iconByPrefix[prefix]) || "Sparkles";
};

export const getNodeBySocCode = (socCode?: string | null) => {
  if (!socCode) return undefined;
  return nodeBySocCode.get(socCode);
};

export const getTargetLevelForNode = (node: JobVizNode) => {
  if (node.occupation_type === "Line item") {
    return clampLevel(node.hierarchy);
  }

  return clampLevel(node.hierarchy + 1);
};

export const getSelectedSocCodeForLevel = (
  node: JobVizNode,
  targetLevel: number
) => {
  const levelKey = `level${Math.max(targetLevel - 1, 1)}` as keyof Pick<
    JobVizNode,
    "level1" | "level2" | "level3" | "level4"
  >;

  return (node[levelKey] as string | null) ?? node.soc_code;
};

export const buildIdPathForNode = (node: JobVizNode) => {
  const ids: number[] = [];
  const levels = [node.level1, node.level2, node.level3, node.level4];

  levels.forEach((code, index) => {
    if (!code) return;

    const hierarchy = index + 1;
    const parent = nodeByCodeAndHierarchy.get(`${code}:${hierarchy}`);

    if (parent && !ids.includes(parent.id)) {
      ids.push(parent.id);
    }
  });

  if (!ids.includes(node.id)) {
    ids.push(node.id);
  }

  return ids;
};

const appendAssignmentQuery = (
  url: string,
  assignmentParams?: AssignmentParams
) => {
  const params = new URLSearchParams();
  const normalized = normalizeSocCodes(assignmentParams?.socCodes);

  if (normalized.length) {
    params.set(SOC_CODES_PARAM_NAME, normalized.join(","));
  }

  if (assignmentParams?.unitName) {
    params.set(UNIT_NAME_PARAM_NAME, assignmentParams.unitName);
  }

  const query = params.toString();

  return query ? `${url}?${query}` : url;
};

export const buildJobvizUrl = (
  parsed: ParsedJobvizPath | { fromNode: JobVizNode },
  assignmentParams?: AssignmentParams
): string => {
  if ("fromNode" in parsed) {
    const node = parsed.fromNode;
    const targetLevel = getTargetLevelForNode(node);
    const selectedLevel = getSelectedSocCodeForLevel(node, targetLevel);
    const idPath = buildIdPathForNode(node);

    return buildJobvizUrl(
      { targetLevel, selectedLevel, idPath },
      assignmentParams
    );
  }

  const { targetLevel, selectedLevel, idPath } = parsed;
  const safeLevel = clampLevel(targetLevel);

  if (!selectedLevel) {
    return appendAssignmentQuery("/jobviz", assignmentParams);
  }

  const pathParts = [
    "/jobviz",
    safeLevel.toString(),
    selectedLevel,
    ...idPath.map(String),
  ];

  const url = pathParts.join("/").replace(/\/+/g, "/");

  return appendAssignmentQuery(url, assignmentParams);
};

export const getChainFromIds = (ids: number[]) =>
  ids
    .map((id) => jobVizNodeById.get(id))
    .filter(Boolean) as JobVizNode[];

export const getHierarchySlice = (
  targetLevel: number,
  selectedLevel: string | null
) => {
  const safeLevel = clampLevel(targetLevel);

  if (safeLevel <= 1) {
    return jobVizData.filter((node) => node.hierarchy === 1);
  }

  if (!selectedLevel) return [];

  if (safeLevel === 2) {
    return jobVizData.filter(
      (node) => node.hierarchy === 2 && node.level1 === selectedLevel
    );
  }

  if (safeLevel === 3) {
    return jobVizData.filter(
      (node) => node.hierarchy === 3 && node.level2 === selectedLevel
    );
  }

  return jobVizData.filter(
    (node) => node.hierarchy === 4 && node.level3 === selectedLevel
  );
};

export const collectAssignmentAncestorIds = (
  socCodes?: AssignmentParams["socCodes"]
) => {
  const normalized = normalizeSocCodes(socCodes);

  if (!normalized.length) return new Set<number>();

  const targetCodes = new Set(normalized.map((code) => code.trim()));
  const ids = new Set<number>();

  jobVizData.forEach((node) => {
    if (node.soc_code && targetCodes.has(node.soc_code)) {
      buildIdPathForNode(node).forEach((id) => ids.add(id));
    }
  });

  return ids;
};
