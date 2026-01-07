import { UNITS_URL_PATH } from "./constants";

const PROD_SITE_URL = "https://teach.galacticpolymath.com";
const PREVIEW_SITE_URL = "https://dev.galacticpolymath.com";
const LOCAL_SITE_URL = "http://localhost:3000";
const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export const DEFAULT_LOCALE = "en-US";

const trimTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const normalizePath = (value: string) =>
  value.startsWith("/") ? value.slice(1) : value;

export const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  }

  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;

  if (env === "production") {
    return PROD_SITE_URL;
  }

  if (env === "preview") {
    return PREVIEW_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${trimTrailingSlash(process.env.NEXT_PUBLIC_VERCEL_URL)}`;
  }

  return LOCAL_SITE_URL;
};

export const ensureAbsoluteUrl = (input?: string | null) => {
  if (!input) {
    return getSiteUrl();
  }

  if (ABSOLUTE_URL_REGEX.test(input)) {
    return input;
  }

  const siteUrl = getSiteUrl();
  const cleanedPath = normalizePath(input);

  return `${siteUrl}/${cleanedPath}`;
};

export const summarizeDescription = (value?: string, maxLength = 160) => {
  if (!value) {
    return "";
  }

  const collapsed = value.replace(/\s+/g, " ").trim();

  if (collapsed.length <= maxLength) {
    return collapsed;
  }

  return `${collapsed.slice(0, maxLength - 3).trimEnd()}...`;
};

export const toOgLocale = (locale?: string | null) => {
  if (!locale) {
    return "en_US";
  }

  return locale.replace("-", "_");
};

export const buildUnitPath = (locale: string, unitId: number | string) => {
  const safeLocale = locale || DEFAULT_LOCALE;

  return `/${UNITS_URL_PATH}/${safeLocale}/${unitId}`;
};

export const buildUnitUrl = (locale: string, unitId: number | string) => {
  return ensureAbsoluteUrl(buildUnitPath(locale, unitId));
};
