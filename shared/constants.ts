import countryNames from "../data/User/countryNames.json";

export const COUNTRY_NAMES = new Set(countryNames)
export const UNITS_URL_PATH = "units";
export const LAST_LESSON_NUM_ID = 100;
export const IS_ON_PROD = process.env.NODE_ENV === 'production';
export const REFERRED_BY_OPTS = [
  "Friend/Colleague",
  "Internet search",
  "Bluesky",
  "Instagram",
  "LinkedIn",
] as const;
export const REFERRED_BY_OPTS_SET = new Set(REFERRED_BY_OPTS);
