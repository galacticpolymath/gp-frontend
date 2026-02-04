import { connectToMongodb } from "../utils/connection";
import { getUsers } from "./userServices";
import usZipToState from "../../data/us_zip_to_state.json";
import countryNameToCode from "../../data/country_name_to_code.json";

export interface FrontEndUserStats {
  totalUsers: number;
  totalStudents: number;
  usStates: number;
  otherCountries: number;
  highlightedCountries: string[];
  debug?: {
    dbType: string;
    totalUsers: number;
    usersWithClassSize: number;
    usersWithClassroomSize: number;
    usersWithZip: number;
    usersWithCountry: number;
    unmappedCountries: string[];
    sampleUsers: Array<{
      country?: string | null;
      zipCode?: string | null;
      classSize?: number | null;
      classroomSize?: number | null;
      isNotTeaching?: boolean;
    }>;
  };
}

const DEFAULT_STATS: FrontEndUserStats = {
  totalUsers: 0,
  totalStudents: 0,
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
  canada: "CA",
  china: "CN",
  finland: "FI",
  india: "IN",
  "new zealand": "NZ",
  philippines: "PH",
  "south africa": "ZA",
  thailand: "TH",
  "united states virgin islands": "VI",
  "u.s. virgin islands": "VI",
  "us virgin islands": "VI",
  "virgin islands us": "VI",
  "virgin islands u s": "VI",
  "virgin islands u.s.": "VI",
  "virgin islands u.s": "VI",
};

const normalizeCountryName = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const resolveCountryCode = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const normalized = normalizeCountryName(value);
  if (!normalized) return null;
  if (COUNTRY_CODE_ALIASES[normalized]) {
    return COUNTRY_CODE_ALIASES[normalized];
  }
  return (countryNameToCode as Record<string, string>)[normalized] ?? null;
};

const normalizeZip = (value?: string | number | null) => {
  if (value === null || typeof value === "undefined") return null;
  const raw = String(value).trim();
  const match = raw.match(/\d{5}/);
  if (match?.[0]) {
    return match[0];
  }
  if (/^\d{1,4}$/.test(raw)) {
    return raw.padStart(5, "0");
  }
  return null;
};

export const getFrontEndUserStats =
  async (): Promise<FrontEndUserStats> => {
    try {
      const statsDbType = process.env.GP_STATS_DB_TYPE ?? "production";
      const { wasSuccessful } = await connectToMongodb(
        10_000,
        0,
        true,
        statsDbType
      );
      if (!wasSuccessful) {
        return DEFAULT_STATS;
      }

      const { users } = await getUsers(
        {},
        {
          country: 1,
          zipCode: 1,
          roles: 1,
          isNotTeaching: 1,
          classSize: 1,
          classroomSize: 1,
        }
      );

      if (!Array.isArray(users)) {
        return DEFAULT_STATS;
      }

      const activeUsers = users;

      const highlightedCountries = new Set<string>();
      const usStates = new Set<string>();
      let totalStudents = 0;
      const unmappedCountries = new Set<string>();
      let usersWithClassSize = 0;
      let usersWithClassroomSize = 0;
      let usersWithZip = 0;
      let usersWithCountry = 0;
      const sampleUsers: FrontEndUserStats["debug"]["sampleUsers"] = [];

      activeUsers.forEach((user) => {
        const classSize =
          typeof user.classSize === "number"
            ? user.classSize
            : typeof (user as { classSize?: string }).classSize === "string"
              ? Number((user as { classSize?: string }).classSize)
              : 0;
        const classroomSizeNum = (user as { classroomSize?: { num?: number } })
          .classroomSize?.num;
        const hasClassSize = Number.isFinite(classSize) && classSize > 0;
        const hasClassroomSize =
          Number.isFinite(classroomSizeNum ?? NaN) &&
          (classroomSizeNum ?? 0) > 0;

        if (hasClassSize) {
          usersWithClassSize += 1;
        }
        if (hasClassroomSize) {
          usersWithClassroomSize += 1;
        }

        if (hasClassSize) {
          totalStudents += classSize;
        } else if (hasClassroomSize) {
          totalStudents += classroomSizeNum ?? 0;
        }

        const rawCountry = user.country ?? null;
        const zip = normalizeZip(user.zipCode);
        if (zip) {
          usersWithZip += 1;
        }
        if (rawCountry) {
          usersWithCountry += 1;
        }
        const inferredCountry = rawCountry || (zip ? "United States" : null);
        const countryCode = resolveCountryCode(inferredCountry);

        if (countryCode) {
          highlightedCountries.add(countryCode);
        } else if (rawCountry) {
          unmappedCountries.add(String(rawCountry));
        }

        if (countryCode === "US" && zip) {
          const state = (usZipToState as Record<string, string>)[zip];
          if (state) {
            usStates.add(state);
          }
        }

        if (sampleUsers.length < 8) {
          sampleUsers.push({
            country: rawCountry,
            zipCode: zip,
            classSize: Number.isFinite(classSize) ? classSize : null,
            classroomSize: Number.isFinite(classroomSizeNum ?? NaN)
              ? classroomSizeNum ?? null
              : null,
            isNotTeaching: user.isNotTeaching,
          });
        }
      });

      const otherCountries = Array.from(highlightedCountries).filter(
        (code) => code !== "US"
      );

      if (process.env.NODE_ENV !== "production") {
        console.log("[gp-stats] users total", activeUsers.length);
        console.log("[gp-stats] users with classSize", usersWithClassSize);
        console.log("[gp-stats] total students", totalStudents);
        console.log("[gp-stats] users with zip", usersWithZip);
        console.log("[gp-stats] highlighted countries", Array.from(highlightedCountries));
        console.log("[gp-stats] unmapped countries", Array.from(unmappedCountries));
      }

      const response: FrontEndUserStats = {
        totalUsers: activeUsers.length,
        totalStudents,
        usStates: usStates.size,
        otherCountries: otherCountries.length,
        highlightedCountries: Array.from(highlightedCountries),
      };
      if (process.env.NODE_ENV !== "production") {
        response.debug = {
          dbType: statsDbType,
          totalUsers: activeUsers.length,
          usersWithClassSize,
          usersWithClassroomSize,
          usersWithZip,
          usersWithCountry,
          unmappedCountries: Array.from(unmappedCountries),
          sampleUsers,
        };
      }

      return response;
    } catch (error) {
      console.error("Failed to build front-end user stats.", error);
      return DEFAULT_STATS;
    }
};
