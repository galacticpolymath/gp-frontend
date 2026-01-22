import { connectToMongodb } from "../utils/connection";
import { getUsers } from "./userServices";
import usZipToState from "../../data/us_zip_to_state.json";
import countryNameToCode from "../../data/country_name_to_code.json";

export interface FrontEndUserStats {
  totalTeachers: number;
  usStates: number;
  otherCountries: number;
  highlightedCountries: string[];
}

const DEFAULT_STATS: FrontEndUserStats = {
  totalTeachers: 0,
  usStates: 0,
  otherCountries: 0,
  highlightedCountries: [],
};

const COUNTRY_CODE_ALIASES: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  us: "US",
  "u.s.": "US",
  "u.s.a.": "US",
  uk: "GB",
  "u.k.": "GB",
  "united kingdom": "GB",
  "great britain": "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "northern ireland": "GB",
  russia: "RU",
  "south korea": "KR",
  "north korea": "KP",
  iran: "IR",
  syria: "SY",
  "czech republic": "CZ",
  czechia: "CZ",
  vietnam: "VN",
  laos: "LA",
  bolivia: "BO",
  tanzania: "TZ",
  moldova: "MD",
  venezuela: "VE",
  palestine: "PS",
  "ivory coast": "CI",
  "cape verde": "CV",
  "cabo verde": "CV",
  swaziland: "SZ",
  burma: "MM",
};

const normalizeCountryName = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, "")
    .trim();

const resolveCountryCode = (value?: string | null) => {
  const normalized = normalizeCountryName(value);
  if (!normalized) return null;
  if (COUNTRY_CODE_ALIASES[normalized]) {
    return COUNTRY_CODE_ALIASES[normalized];
  }
  return (countryNameToCode as Record<string, string>)[normalized] ?? null;
};

const normalizeZip = (value?: string | number | null) => {
  if (value === null || typeof value === "undefined") return null;
  const match = String(value).match(/\d{5}/);
  return match?.[0] ?? null;
};

export const getFrontEndUserStats =
  async (): Promise<FrontEndUserStats> => {
    try {
      const { wasSuccessful } = await connectToMongodb(10_000, 0, true);
      if (!wasSuccessful) {
        return DEFAULT_STATS;
      }

      const { users } = await getUsers(
        {},
        { country: 1, zipCode: 1, roles: 1, isNotTeaching: 1 }
      );

      if (!Array.isArray(users)) {
        return DEFAULT_STATS;
      }

      const teacherUsers = users.filter(
        (user) =>
          Array.isArray(user.roles) &&
          user.roles.includes("user") &&
          !user.isNotTeaching
      );

      const highlightedCountries = new Set<string>();
      const usStates = new Set<string>();

      teacherUsers.forEach((user) => {
        const rawCountry = user.country ?? null;
        const zip = normalizeZip(user.zipCode);
        const inferredCountry = rawCountry || (zip ? "United States" : null);
        const countryCode = resolveCountryCode(inferredCountry);

        if (countryCode) {
          highlightedCountries.add(countryCode);
        }

        if (countryCode === "US" && zip) {
          const state = (usZipToState as Record<string, string>)[zip];
          if (state) {
            usStates.add(state);
          }
        }
      });

      const otherCountries = Array.from(highlightedCountries).filter(
        (code) => code !== "US"
      );

      return {
        totalTeachers: teacherUsers.length,
        usStates: usStates.size,
        otherCountries: otherCountries.length,
        highlightedCountries: Array.from(highlightedCountries),
      };
    } catch (error) {
      console.error("Failed to build front-end user stats.", error);
      return DEFAULT_STATS;
    }
  };
