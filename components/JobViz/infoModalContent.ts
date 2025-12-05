const numberFormatter = new Intl.NumberFormat("en-US");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatNumber = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value)
    ? numberFormatter.format(value)
    : "–";

export const formatCurrency = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value)
    ? currencyFormatter.format(value)
    : "–";

export const formatPercent = (raw?: number | string | null) => {
  if (raw === null || raw === undefined) return "–";
  const numeric =
    typeof raw === "number" ? raw : Number.parseFloat(String(raw));
  if (!Number.isFinite(numeric)) return "–";
  if (numeric === 0) return "0%";
  const formatted = Math.abs(numeric).toFixed(1).replace(/\.0$/, "");
  const prefix = numeric > 0 ? "+" : "-";
  return `${prefix}${formatted}%`;
};

export const formatCurrencyRange = (min: number, max: number) =>
  max === Infinity
    ? `${formatCurrency(min)}+`
    : `${formatCurrency(min)} – ${formatCurrency(max)}`;

const formatPercentValue = (value: number) =>
  `${value > 0 ? "+" : ""}${value}%`;

export const formatPercentRange = (min: number, max: number) => {
  if (!Number.isFinite(min)) {
    return `< ${formatPercentValue(max)}`;
  }
  if (!Number.isFinite(max)) {
    const magnitude = Math.abs(min);
    return `> ${magnitude}%`;
  }
  return `${formatPercentValue(min)} to ${formatPercentValue(max)}`;
};

export const formatEmploymentRange = (min: number, max: number) => {
  if (!Number.isFinite(min)) {
    return `< ${formatNumber(max)}`;
  }
  if (!Number.isFinite(max)) {
    return `${formatNumber(min)}+`;
  }
  return `${formatNumber(min)} – ${formatNumber(max)}`;
};

export type InfoTier = {
  label: string;
  min: number;
  max: number;
  descriptor: string;
};

export type InfoModalType = "wage" | "growth" | "jobs";

export const wageTiers: InfoTier[] = [
  {
    label: "Poverty Line or Below",
    min: 0,
    max: 35000,
    descriptor:
      "Around or under the federal poverty line (~$30k for a family). Most money goes to rent, food, and staying safe.",
  },
  {
    label: "Covering Basics",
    min: 35000,
    max: 60000,
    descriptor: "Bills are covered, but building savings is tough.",
  },
  {
    label: "Comfortable",
    min: 60000,
    max: 100000,
    descriptor: "Stable lifestyle with some room to save and plan ahead.",
  },
  {
    label: "Flourishing",
    min: 100000,
    max: 180000,
    descriptor:
      "Plenty for saving, helping others, and planning big goals.",
  },
  {
    label: "Wealth Building",
    min: 180000,
    max: Infinity,
    descriptor: "Money can start working for you; wealth grows quickly.",
  },
];

export const growthTiers: InfoTier[] = [
  {
    label: "Crashing",
    min: -Infinity,
    max: -8,
    descriptor: "Jobs are disappearing fast; expect cutbacks.",
  },
  {
    label: "Shrinking",
    min: -8,
    max: -2,
    descriptor: "Opportunities are limited and trending down.",
  },
  {
    label: "Steady",
    min: -2,
    max: 2,
    descriptor: "Holding steady—new hires mostly replace retirees.",
  },
  {
    label: "Growing",
    min: 2,
    max: 6,
    descriptor: "Expanding steadily with solid demand.",
  },
  {
    label: "Hot",
    min: 6,
    max: Infinity,
    descriptor: "Fast growth; new programs and startups need talent.",
  },
];

export const employmentTiers: InfoTier[] = [
  {
    label: "Rare",
    min: 0,
    max: 25000,
    descriptor:
      "Small, specialized teams—you might not meet someone with this job in your town.",
  },
  {
    label: "Uncommon",
    min: 25000,
    max: 100000,
    descriptor:
      "Shows up in certain industries or regions; you may only know a few adults who do it.",
  },
  {
    label: "Common",
    min: 100000,
    max: 500000,
    descriptor:
      "Found across many regions and industries—you probably see people doing this work.",
  },
  {
    label: "Very Common",
    min: 500000,
    max: 1500000,
    descriptor:
      "Part of everyday life in most communities; you interact with these workers often.",
  },
  {
    label: "Everywhere",
    min: 1500000,
    max: Infinity,
    descriptor:
      "Essential nationwide—you'll notice these workers in every region you visit.",
  },
];

export type InfoModalContent = {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  tiers: InfoTier[];
  rangeFormatter: (tier: InfoTier) => string;
  footnote: string;
};

export const infoModalContent: Record<InfoModalType, InfoModalContent> = {
  wage: {
    eyebrow: "Wage context",
    heading: "How to read median wage",
    paragraphs: [
      "Median wage is the pay right in the middle when all U.S. workers in this job are lined up from lowest to highest. Half earn less and half earn more.",
    ],
    tiers: wageTiers,
    rangeFormatter: (tier) => formatCurrencyRange(tier.min, tier.max),
    footnote:
      "Data: U.S. Bureau of Labor Statistics (2024). The ranges center on a typical U.S. full-time wage (~$62,000). Where you live and how many people your paycheck supports will change how any salary feels, so treat these categories as conversation starters—not labels for classmates.",
  },
  growth: {
    eyebrow: "Growth context",
    heading: "How to read 10-year change",
    paragraphs: [
      "Ten-year change shows the projected percent difference in total jobs between 2024 and 2034.",
      "Positive numbers mean more demand; negative numbers mean fewer openings. Even shrinking fields still need replacements for retirements.",
    ],
    tiers: growthTiers,
    rangeFormatter: (tier) => formatPercentRange(tier.min, tier.max),
    footnote:
      "Projections are from the U.S. Bureau of Labor Statistics (2024 release). Actual change can differ with technology and policy shifts.",
  },
  jobs: {
    eyebrow: "Job count context",
    heading: "How many people do this work?",
    paragraphs: [
      "“Jobs by 2034” estimates how many people will work in this occupation nationwide.",
      "Use it to compare how common a job might feel for you and your community—it doesn’t say how important the work is.",
    ],
    tiers: employmentTiers,
    rangeFormatter: (tier) => formatEmploymentRange(tier.min, tier.max),
    footnote:
      "Data: U.S. Bureau of Labor Statistics (2024 release). Different regions or industries might make the job feel more or less visible where you live.",
  },
};
