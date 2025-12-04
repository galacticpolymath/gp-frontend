import Head from "next/head";
import React, { useState } from "react";
import { LucideIcon } from "../../components/JobViz/LucideIcon";
import {
  jobVizData,
  getIconNameForNode,
  JobVizNode,
} from "../../components/JobViz/jobvizUtils";
import styles from "../../styles/jobvizDesignPreview.module.scss";

type Tone = "calm" | "burst";
type InfoModalType = "wage" | "growth" | "jobs";

interface AssignmentJob {
  node: JobVizNode;
  rating: string;
}

const palette = [
  { name: "Nebula Deep", hex: "#061b2d", role: "Canvas / page base" },
  { name: "Hydro Mist", hex: "#0f3158", role: "Hero gradient anchor" },
  { name: "Ionosphere", hex: "#13406f", role: "Card fill" },
  { name: "Halo Smoke", hex: "#7aa6dc", role: "Borders + dividers" },
  { name: "Free Tier Blue", hex: "#00aceb", role: "CTA / focus" },
  { name: "Pulse Accent", hex: "#ff5ab5", role: "Rare highlight" },
];

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatNumber = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value)
    ? numberFormatter.format(value)
    : "–";

const formatCurrency = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value)
    ? currencyFormatter.format(value)
    : "–";

const formatPercent = (raw?: number | string | null) => {
  if (raw === null || raw === undefined) return "–";
  const numeric =
    typeof raw === "number" ? raw : Number.parseFloat(raw as string);
  if (!Number.isFinite(numeric)) return "–";
  if (numeric === 0) return "0%";
  const abs = Math.abs(numeric);
  const formatted = abs.toFixed(1).replace(/\.0$/, "");
  const prefix = numeric > 0 ? "+" : "-";
  return `${prefix}${formatted}%`;
};

const humanize = (value?: string | null) => {
  if (!value || value.trim().toLowerCase() === "data unavailable") {
    return "Data unavailable";
  }
  return value;
};

const summarizeDefinition = (def?: string | null, max = 160) => {
  if (!def) return "Definition unavailable from the BLS feed.";
  return def.length > max ? `${def.slice(0, max).trim()}…` : def;
};

const isNode = (node: JobVizNode | undefined): node is JobVizNode => Boolean(node);

const lineItemNodes = jobVizData.filter(
  (node) => node.occupation_type === "Line item"
);
const topLevelNodes = jobVizData.filter((node) => node.hierarchy === 1);

const averageLineItemGrowth = (() => {
  const values = lineItemNodes
    .map((node) => node.employment_change_percent)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value)
    );

  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
})();

const heroStats = [
  { label: "Line item jobs", value: formatNumber(lineItemNodes.length) },
  { label: "Top-level clusters", value: formatNumber(topLevelNodes.length) },
  { label: "Avg. 10-yr change", value: formatPercent(averageLineItemGrowth) },
];

const getDescendantLineItems = (node: JobVizNode) =>
  lineItemNodes.filter((lineItem) => lineItem.path.startsWith(node.path))
    .length;

const featuredCategories = ["15-0000", "17-0000", "19-0000"]
  .map((code) => jobVizData.find((node) => node.soc_code === code))
  .filter(isNode);

const featuredJobs = ["15-1252", "17-2141", "19-2041"]
  .map((code) => jobVizData.find((node) => node.soc_code === code))
  .filter(isNode);

const ratingScale = ["🤩", "😀", "❓", "😐"];

const assignmentJobs: AssignmentJob[] = ["19-2041", "19-2042", "17-3025", "45-4011"]
  .map((code, index) => {
    const node = jobVizData.find((candidate) => candidate.soc_code === code);
    if (!node) return null;
    return { node, rating: ratingScale[index] ?? "❓" };
  })
  .filter((entry): entry is AssignmentJob => Boolean(entry));

const assignmentMeta = {
  title: "Assignment: New Water Futures",
  prompt:
    "Skim each BLS occupation, grab the wage or growth stat, and justify your emoji reaction for our water systems discussion.",
};

const emojiScale = [
  { label: "Love", icon: "🤩" },
  { label: "Like", icon: "😀" },
  { label: "Meh", icon: "😐" },
  { label: "Pass", icon: "🙁" },
  { label: "Nope", icon: "😱" },
];

const modalNode =
  assignmentJobs.find((job) => job.node.soc_code === "19-2041")?.node ??
  assignmentJobs[0]?.node ??
  featuredJobs[0];

const wageTiers = [
  {
    label: "Poverty Line or Below",
    min: 0,
    max: 35000,
    descriptor: "Around or under the federal poverty line (~$30k for a family). Most money goes to rent, food, and staying safe.",
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
    descriptor: "Plenty for saving, helping others, and planning big goals.",
  },
  {
    label: "Wealth Building",
    min: 180000,
    max: Infinity,
    descriptor: "Money can start working for you; wealth grows quickly.",
  },
];

const getWageTier = (value?: number | null) => {
  if (value === null || value === undefined) return null;
  return (
    wageTiers.find((tier) => value >= tier.min && value < tier.max) ??
    wageTiers[wageTiers.length - 1]
  );
};

const formatCurrencyRange = (min: number, max: number) =>
  max === Infinity
    ? `${formatCurrency(min)}+`
    : `${formatCurrency(min)} – ${formatCurrency(max)}`;

const formatPercentValue = (value: number) =>
  `${value > 0 ? "+" : ""}${value}%`;

const formatPercentRange = (min: number, max: number) => {
  if (!Number.isFinite(min)) {
    return `< ${formatPercentValue(max)}`;
  }
  if (!Number.isFinite(max)) {
    const magnitude = Math.abs(min);
    return `> ${magnitude}%`;
  }
  return `${formatPercentValue(min)} to ${formatPercentValue(max)}`;
};

const formatEmploymentRange = (min: number, max: number) => {
  if (!Number.isFinite(min)) {
    return `< ${formatNumber(max)}`;
  }
  if (!Number.isFinite(max)) {
    return `${formatNumber(min)}+`;
  }
  return `${formatNumber(min)} – ${formatNumber(max)}`;
};

const growthTiers = [
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

const employmentTiers = [
  {
    label: "Rare",
    min: 0,
    max: 25000,
    descriptor: "Small, specialized teams—you might not meet someone with this job in your town.",
  },
  {
    label: "Uncommon",
    min: 25000,
    max: 100000,
    descriptor: "Shows up in certain industries or regions; you may only know a few adults who do it.",
  },
  {
    label: "Common",
    min: 100000,
    max: 500000,
    descriptor: "Found across many regions and industries—you probably see people doing this work.",
  },
  {
    label: "Very Common",
    min: 500000,
    max: 1500000,
    descriptor: "Part of everyday life in most communities; you interact with these workers often.",
  },
  {
    label: "Everywhere",
    min: 1500000,
    max: Infinity,
    descriptor: "Essential nationwide—you'll notice these workers in every region you visit.",
  },
];

const infoModalContent: Record<
  InfoModalType,
  {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    tiers: { label: string; min: number; max: number; descriptor: string }[];
    rangeFormatter: (tier: { min: number; max: number }) => string;
    footnote: string;
  }
> = {
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

export default function JobVizDesignPreview() {
  const [tone, setTone] = useState<Tone>("calm");
  const [assignmentCollapsed, setAssignmentCollapsed] = useState(false);
  const [showWageInfo, setShowWageInfo] = useState(false);
  const [infoModal, setInfoModal] = useState<InfoModalType | null>(null);
  const activeInfoModal = infoModal ? infoModalContent[infoModal] : null;

  return (
    <>
      <Head>
        <title>JobViz Design Preview Lab</title>
      </Head>
      <main className={styles.previewPage} data-tone={tone}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>JobViz 2.0 · Aesthetic Lab</p>
            <h1 className={styles.heroTitle}>
              Cooler blues, calmer glass, sharper storytelling.
            </h1>
            <p className={styles.heroSubtitle}>
              Use these abstract components to stress-test spacing, iconography,
              and gamified classroom moments before touching the production
              hierarchy.
            </p>
            <div className={styles.heroToggles}>
              {(["calm", "burst"] as Tone[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.toneButton} ${
                    tone === option ? styles.toneButtonActive : ""
                  }`}
                  onClick={() => setTone(option)}
                >
                  {option === "calm" ? "Calm blues" : "Burst accents"}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.heroStats}>
            {heroStats.map((stat) => (
              <div key={stat.label} className={styles.heroStat}>
                <span className={styles.heroStatLabel}>{stat.label}</span>
                <strong className={styles.heroStatValue}>{stat.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.previewSection}>
          <header>
            <h2 className={styles.sectionHeading}>Palette + roles</h2>
            <p className={styles.sectionDescription}>
              Blues carry almost everything; Pulse/Fuchsia only appears for
              celebratory flashes and micro-highlights.
            </p>
          </header>
          <div className={styles.paletteBoard}>
            {palette.map((swatch) => (
              <article key={swatch.name} className={styles.swatch}>
                <div
                  className={styles.swatchColor}
                  style={{ backgroundColor: swatch.hex }}
                />
                <div className={styles.swatchMeta}>
                  <span className={styles.swatchName}>{swatch.name}</span>
                  <span className={styles.swatchHex}>{swatch.hex}</span>
                  <span className={styles.swatchRole}>{swatch.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.previewSection}>
          <header className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionHeading}>Hierarchy anatomy</h2>
              <p className={styles.sectionDescription}>
                Category cards stay translucent; job cards receive a gentle fill +
                stacked icon to separate depth. Stats chips give rapid context.
              </p>
            </div>
            <button
              type="button"
              className={styles.infoButton}
              aria-expanded={showWageInfo}
              aria-controls="wage-tier-explainer"
              onClick={() => setShowWageInfo((prev) => !prev)}
            >
              <LucideIcon name="Info" />
              Wage tag explainer
            </button>
          </header>
          {showWageInfo && (
            <div className={styles.tierInfoCard} id="wage-tier-explainer">
              <div className={styles.tierInfoHeader}>
                <h3>What does median wage mean?</h3>
                <button
                  type="button"
                  className={styles.closeInfoButton}
                  onClick={() => setShowWageInfo(false)}
                  aria-label="Close wage tag explainer"
                >
                  <LucideIcon name="X" />
                </button>
              </div>
              <p>
                Median wage is the pay right in the middle when all salaries are
                lined up from lowest to highest. It tells us more than an average,
                because a few super-high earners can’t skew it.
              </p>
              <ul className={styles.tierList}>
                {wageTiers.map((tier) => (
                  <li key={tier.label} className={styles.tierItem}>
                    <div className={styles.tierListHeading}>
                      <span className={styles.tierLabel}>{tier.label}</span>
                      <span className={styles.tierRange}>
                        {tier.max === Infinity
                          ? `${formatCurrency(tier.min)}+`
                          : `${formatCurrency(tier.min)} – ${formatCurrency(
                              tier.max
                            )}`}
                      </span>
                    </div>
                    <p>{tier.descriptor}</p>
                  </li>
                ))}
              </ul>
              <p className={styles.tierFootnote}>
                Ranges are based on recent U.S. full-time worker medians (about{" "}
                {formatCurrency(62000)}). Every family’s situation is different.
              </p>
            </div>
          )}
          <div className={styles.cardWall}>
            <div className={styles.cardCluster}>
              {featuredCategories.map((cat) => (
                <article key={cat.soc_code} className={styles.categoryCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.iconBadge}>
                      <LucideIcon name={getIconNameForNode(cat)} />
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>
                        {cat.soc_title ?? cat.title}
                      </h3>
                      <p className={styles.cardDescriptor}>
                        {summarizeDefinition(cat.def)}
                      </p>
                    </div>
                  </div>
                  <footer className={styles.cardFooter}>
                    <span>
                      {formatNumber(getDescendantLineItems(cat))} line-item roles
                    </span>
                    <span className={styles.cardAction}>
                      {formatCurrency(cat.median_annual_wage)}
                    </span>
                  </footer>
                </article>
              ))}
            </div>

            <div className={styles.cardCluster}>
              {featuredJobs.map((job) => {
                return (
                  <article key={job.soc_code} className={styles.jobCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.iconBadge}>
                        <LucideIcon name={getIconNameForNode(job)} />
                        <span className={styles.nestedIcon}>
                          <LucideIcon name="Sparkles" />
                        </span>
                      </div>
                      <div>
                        <h3 className={styles.cardTitle}>
                          {job.soc_title ?? job.title}
                        </h3>
                        <p className={styles.cardDescriptor}>
                          {summarizeDefinition(job.def)}
                        </p>
                      </div>
                    </div>
                    <div className={styles.statRow}>
                      <div className={styles.statChip}>
                        <span className={styles.statLabel}>Median wage</span>
                        <strong className={styles.statValue}>
                          {formatCurrency(job.median_annual_wage)}
                        </strong>
                      </div>
                      <div className={styles.statChip}>
                        <span className={styles.statLabel}>Growth</span>
                        <strong className={styles.statValue}>
                          {formatPercent(job.employment_change_percent)}
                        </strong>
                      </div>
                      <div className={styles.statChip}>
                        <span className={styles.statLabel}>Entry edu.</span>
                        <strong className={styles.statValue}>
                          {humanize(job.typical_education_needed_for_entry)}
                        </strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className={`${styles.previewSection} ${styles.assignmentSection}`}
        >
          <header>
            <h2 className={styles.sectionHeading}>Assignment dock</h2>
            <p className={styles.sectionDescription}>
              Collapsible on small screens, lightweight on desktop—emoji metadata
              feeds both cards and the dock.
            </p>
          </header>
          <article
            className={styles.assignmentDock}
            data-collapsed={assignmentCollapsed}
          >
            <div className={styles.assignmentHeader}>
              <div>
                <p className={styles.assignmentLabel}>GP+ Share Link</p>
                <h3 className={styles.assignmentTitle}>{assignmentMeta.title}</h3>
              </div>
              <button
                type="button"
                className={styles.assignmentToggle}
                onClick={() => setAssignmentCollapsed((prev) => !prev)}
              >
                {assignmentCollapsed ? "Expand brief" : "Collapse brief"}
              </button>
            </div>
            <p className={styles.assignmentPrompt}>{assignmentMeta.prompt}</p>
            <div className={styles.assignmentCarousel}>
              {assignmentJobs.map(({ node, rating }) => (
                <div key={node.soc_code} className={styles.assignmentJob}>
                  <span className={styles.assignmentJobTitle}>
                    <LucideIcon name={getIconNameForNode(node)} />
                    {node.soc_title ?? node.title}
                  </span>
                  <span className={styles.assignmentEmoji}>{rating}</span>
                </div>
              ))}
            </div>
            <div className={styles.emojiScale}>
              {emojiScale.map((emoji) => (
                <button
                  key={emoji.label}
                  type="button"
                  className={styles.emojiButton}
                >
                  <span role="img" aria-label={emoji.label}>
                    {emoji.icon}
                  </span>
                  <small>{emoji.label}</small>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.previewSection}>
          <header>
            <h2 className={styles.sectionHeading}>Job modal slice</h2>
            <p className={styles.sectionDescription}>
              Drawer-ready layout with compact stats, bullets for teacher value,
              and CTA pairings.
            </p>
          </header>
          {modalNode && (
            <article className={styles.modalCard}>
              <header className={styles.modalHeader}>
                <div className={styles.modalIdentity}>
                  <div className={`${styles.iconBadge} ${styles.modalIcon}`}>
                    <LucideIcon name={getIconNameForNode(modalNode)} />
                  </div>
                  <div>
                    <p className={styles.modalEyebrow}>Job detail modal</p>
                    <h3 className={styles.modalTitle}>
                      {modalNode.soc_title ?? modalNode.title}
                    </h3>
                  </div>
                </div>
                <span className={styles.modalBadge}>{modalNode.soc_code}</span>
              </header>
              <p className={styles.modalSummary}>{modalNode.def}</p>
              <dl className={styles.modalStats}>
                <div className={styles.modalStat}>
                  <div className={styles.modalStatHeader}>
                    <dt>Median wage</dt>
                    <button
                      type="button"
                      className={styles.inlineInfoButton}
                      aria-haspopup="dialog"
                      aria-controls="jobviz-info-modal"
                      onClick={() => setInfoModal("wage")}
                      aria-label="Open wage explainer"
                    >
                      <LucideIcon name="Info" />
                    </button>
                  </div>
                  <dd>{formatCurrency(modalNode.median_annual_wage)}</dd>
                </div>
                <div className={styles.modalStat}>
                  <div className={styles.modalStatHeader}>
                    <dt>10-year change</dt>
                    <button
                      type="button"
                      className={styles.inlineInfoButton}
                      aria-haspopup="dialog"
                      aria-controls="jobviz-info-modal"
                      onClick={() => setInfoModal("growth")}
                      aria-label="Open growth explainer"
                    >
                      <LucideIcon name="Info" />
                    </button>
                  </div>
                  <dd>{formatPercent(modalNode.employment_change_percent)}</dd>
                </div>
                <div className={styles.modalStat}>
                  <div className={styles.modalStatHeader}>
                    <dt>Jobs by 2034</dt>
                    <button
                      type="button"
                      className={styles.inlineInfoButton}
                      aria-haspopup="dialog"
                      aria-controls="jobviz-info-modal"
                      onClick={() => setInfoModal("jobs")}
                      aria-label="Open job count explainer"
                    >
                      <LucideIcon name="Info" />
                    </button>
                  </div>
                  <dd>{formatNumber(modalNode.employment_end_yr)}</dd>
                </div>
              </dl>
              <ul className={styles.modalList}>
                <li>
                  Typical education:{" "}
                  {humanize(modalNode.typical_education_needed_for_entry)}
                </li>
                <li>
                  Work experience:{" "}
                  {humanize(modalNode.work_experience_in_a_related_occupation)}
                </li>
                <li>
                  On-the-job training:{" "}
                  {humanize(
                    modalNode[
                      "typical_on-the-job_training_needed_to_attain_competency_in_the_occupation"
                    ]
                  )}
                </li>
              </ul>
              <footer className={styles.modalActions}>
                {modalNode.BLS_link && (
                  <a
                    className={styles.ghostButton}
                    href={modalNode.BLS_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View BLS profile
                  </a>
                )}
                <button type="button" className={styles.primaryButton}>
                  Copy share link
                </button>
              </footer>
            </article>
          )}
        </section>
        {activeInfoModal && (
          <div
            className={styles.infoModalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="jobviz-info-modal-title"
            id="jobviz-info-modal"
            onClick={() => setInfoModal(null)}
          >
            <div
              className={styles.infoModal}
              onClick={(event) => event.stopPropagation()}
            >
              <header className={styles.infoModalHeader}>
                <div className={styles.infoModalTitle}>
                  <span className={styles.infoModalIcon}>
                    <LucideIcon name="Info" />
                  </span>
                  <div>
                    <p className={styles.infoModalEyebrow}>
                      {activeInfoModal.eyebrow}
                    </p>
                    <h3
                      className={styles.infoModalHeading}
                      id="jobviz-info-modal-title"
                    >
                      {activeInfoModal.heading}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.closeInfoButton}
                  aria-label="Close info explainer"
                  onClick={() => setInfoModal(null)}
                >
                  <LucideIcon name="X" />
                </button>
              </header>
              <div className={styles.infoModalBody}>
                {activeInfoModal.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <ul className={styles.tierList}>
                  {activeInfoModal.tiers.map((tier) => (
                    <li key={tier.label} className={styles.tierItem}>
                      <div className={styles.tierListHeading}>
                        <span className={styles.tierLabel}>{tier.label}</span>
                        <span className={styles.tierRange}>
                          {activeInfoModal.rangeFormatter(tier)}
                        </span>
                      </div>
                      <p>{tier.descriptor}</p>
                    </li>
                  ))}
                </ul>
                <p className={styles.tierFootnote}>
                  {activeInfoModal.footnote}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
