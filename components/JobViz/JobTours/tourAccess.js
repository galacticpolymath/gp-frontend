export const JOBVIZ_PREVIEW_LIMIT = 2;

const TRUTHY_QUERY_VALUES = new Set(["1", "true", "yes", "on", "preview"]);

export const isTruthyQueryFlag = (value) => {
  if (Array.isArray(value)) {
    return value.some((entry) => isTruthyQueryFlag(entry));
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value !== "string") {
    return false;
  }
  return TRUTHY_QUERY_VALUES.has(value.trim().toLowerCase());
};

export const getStudentHost = (host) => {
  const configuredHost = process.env.NEXT_PUBLIC_STUDENT_HOST?.trim();
  if (configuredHost) {
    return configuredHost;
  }
  if (!host) {
    return null;
  }
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return host;
  }
  if (host.startsWith("student.")) {
    return host;
  }
  if (host.startsWith("teacher.")) {
    return host.replace(/^teacher\./, "student.");
  }
  return `student.${host}`;
};

/**
 * @param {string} tourId
 * @param {{ preview?: boolean }} [options]
 */
export const buildStudentTourPath = (tourId, { preview = false } = {}) => {
  const params = new URLSearchParams();
  if (tourId) {
    params.set("tourId", tourId);
  }
  params.set("student", "1");
  if (preview) {
    params.set("preview", "1");
  }
  return `/jobviz?${params.toString()}`;
};

/**
 * @param {string} tourId
 * @param {{ preview?: boolean, protocol?: string, host?: string | null }} [options]
 */
export const buildStudentTourUrl = (
  tourId,
  {
    preview = false,
    protocol = "https:",
    host = null,
  } = {}
) => {
  const path = buildStudentTourPath(tourId, { preview });
  if (!host) {
    return path;
  }
  const studentHost = getStudentHost(host);
  if (!studentHost) {
    return path;
  }
  return `${protocol}//${studentHost}${path}`;
};
