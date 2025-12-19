import { Buffer } from "buffer";
import type { JobRatingValue } from "./jobRatingsStore";

export const JOBVIZ_REPORT_PARAM_NAME = "jobvizReport";
const SHARE_PAYLOAD_VERSION = 1;

export interface JobvizShareJob {
  soc: string;
  title: string;
  rating?: JobRatingValue | null;
}

export interface JobvizSharePayload {
  version: number;
  unitName?: string | null;
  jobs: JobvizShareJob[];
  reflection?: string;
  sharedAt?: number;
}

const encodeBase64 = (value: string) => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(value)));
  }
  return Buffer.from(value, "utf8").toString("base64");
};

const decodeBase64 = (value: string) => {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return decodeURIComponent(escape(window.atob(value)));
  }
  return Buffer.from(value, "base64").toString("utf8");
};

export const encodeJobvizSharePayload = (
  payload: Omit<JobvizSharePayload, "version" | "sharedAt"> & { sharedAt?: number }
) => {
  const normalized: JobvizSharePayload = {
    version: SHARE_PAYLOAD_VERSION,
    sharedAt: payload.sharedAt ?? Date.now(),
    unitName: payload.unitName,
    jobs: payload.jobs,
    reflection: payload.reflection ?? "",
  };
  return encodeBase64(JSON.stringify(normalized));
};

export const decodeJobvizSharePayload = (
  encoded?: string | null
): JobvizSharePayload | null => {
  if (!encoded) return null;
  try {
    const raw = decodeBase64(encoded);
    const parsed = JSON.parse(raw) as JobvizSharePayload;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.version !== SHARE_PAYLOAD_VERSION || !Array.isArray(parsed.jobs)) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Failed to decode JobViz share payload", error);
    return null;
  }
};
