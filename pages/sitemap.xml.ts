import { GetServerSideProps } from "next";
import { retrieveUnits } from "../backend/services/unitServices";
import { createDbProjections } from "../shared/fns";
import { INewUnitSchema } from "../backend/models/Unit/types/unit";
import {
  buildUnitUrl,
  DEFAULT_LOCALE,
  ensureAbsoluteUrl,
} from "../shared/seo";
import { SHOWABLE_LESSONS_STATUSES } from "../globalVars";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  alternates?: { hrefLang: string; href: string }[];
};

const STATIC_ROUTES: SitemapEntry[] = [
  { loc: ensureAbsoluteUrl("/"), changefreq: "weekly", priority: "1.0" },
  {
    loc: ensureAbsoluteUrl("/lessons"),
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    loc: ensureAbsoluteUrl("/jobviz"),
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    loc: ensureAbsoluteUrl("/gp-plus"),
    changefreq: "monthly",
    priority: "0.7",
  },
];

const isoFromDate = (value?: string | Date | null) => {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};

const buildUnitEntries = (units: INewUnitSchema[]): SitemapEntry[] => {
  const grouped = new Map<number, INewUnitSchema[]>();
  const now = Date.now();

  units.forEach((unit) => {
    if (!unit?.numID || !unit?.locale) {
      return;
    }

    if (
      !unit.PublicationStatus ||
      !SHOWABLE_LESSONS_STATUSES.includes(unit.PublicationStatus)
    ) {
      return;
    }

    if (!unit.ReleaseDate || new Date(unit.ReleaseDate).getTime() > now) {
      return;
    }

    const existing = grouped.get(unit.numID) ?? [];
    existing.push(unit);
    grouped.set(unit.numID, existing);
  });

  const entries: SitemapEntry[] = [];

  grouped.forEach((variations) => {
    const alternates = variations.map((variant) => {
      const locale = variant.locale ?? DEFAULT_LOCALE;
      const href = buildUnitUrl(locale, (variant.numID ?? "").toString());

      return {
        hrefLang: locale,
        href,
      };
    });
    const defaultHref =
      alternates.find(
        (alt) =>
          alt.hrefLang ===
          (variations[0]?.DefaultLocale ?? DEFAULT_LOCALE)
      )?.href ?? alternates.at(0)?.href;

    variations.forEach((variant) => {
      const locale = variant.locale ?? DEFAULT_LOCALE;
      const loc = buildUnitUrl(locale, (variant.numID ?? "").toString());
      const lastmod =
        isoFromDate(variant.LastUpdated_web ?? null) ??
        isoFromDate(variant.LastUpdated ?? null) ??
        isoFromDate(variant.ReleaseDate ?? null);

      entries.push({
        loc,
        lastmod,
        changefreq: "monthly",
        priority: "0.8",
        alternates: [
          ...alternates,
          ...(defaultHref
            ? [{ hrefLang: "x-default", href: defaultHref }]
            : []),
        ],
      });
    });
  });

  return entries;
};

const buildSitemapXml = (entries: SitemapEntry[]) => {
  const body = entries
    .map((entry) => {
      const lines = [`  <url>`, `    <loc>${entry.loc}</loc>`];

      if (entry.lastmod) {
        lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      }

      if (entry.changefreq) {
        lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      }

      if (entry.priority) {
        lines.push(`    <priority>${entry.priority}</priority>`);
      }

      entry.alternates?.forEach(({ href, hrefLang }) => {
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="${href}" />`
        );
      });

      lines.push("  </url>");

      return lines.join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    body,
    "</urlset>",
  ]
    .join("\n")
    .trim();
};

const getUnitProjectionFields = () => [
  "numID",
  "locale",
  "DefaultLocale",
  "ReleaseDate",
  "LastUpdated",
  "LastUpdated_web",
  "PublicationStatus",
];

const collectEntries = async () => {
  const { data, wasSuccessful } = await retrieveUnits(
    {},
    createDbProjections(getUnitProjectionFields())
  );

  const liveUnits = wasSuccessful && data ? data : [];

  return [...STATIC_ROUTES, ...buildUnitEntries(liveUnits)];
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const entries = await collectEntries();
    const xml = buildSitemapXml(entries);

    res.setHeader("Content-Type", "text/xml");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.write(xml);
    res.end();
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    res.statusCode = 500;
    res.write("<!-- Failed to generate sitemap -->");
    res.end();
  }

  return {
    props: {},
  };
};

export default function SiteMap() {
  return null;
}
