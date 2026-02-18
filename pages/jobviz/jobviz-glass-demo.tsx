/* eslint-disable @next/next/no-page-custom-font */
import Head from "next/head";
import { useState } from "react";
import styles from "../../styles/jobvizBurst.module.scss";
import { JobVizGrid, JobVizGridItem } from "../../components/JobViz/JobVizGrid";
import {
  JobVizBreadcrumb,
  BreadcrumbSegment,
} from "../../components/JobViz/JobVizBreadcrumb";

const level1Items: JobVizGridItem[] = [
  {
    id: "17",
    title: "Architecture and engineering jobs",
    iconName: "Cog",
    level: 1,
  },
  {
    id: "27",
    title: "Arts, design, etc",
    iconName: "Palette",
    level: 1,
  },
  {
    id: "37",
    title: "Building & grounds cleaning",
    iconName: "SprayCan",
    level: 1,
  },
  {
    id: "19",
    title: "Life, physical, etc",
    iconName: "Atom",
    level: 1,
  },
  {
    id: "11",
    title: "Management jobs",
    iconName: "BriefcaseBusiness",
    level: 1,
  },
  {
    id: "15",
    title: "Computer & mathematical jobs",
    iconName: "Cpu",
    level: 1,
  },
];

const level2ByParent: Record<string, JobVizGridItem[]> = {
  "17": [
    { id: "17-1000", title: "Architects, surveyors, etc", iconName: "Ruler", level: 2 },
    { id: "17-2000", title: "Engineers", iconName: "Construction", level: 2 },
  ],
  "27": [
    { id: "27-1000", title: "Art and design workers", iconName: "PaintbrushVertical", level: 2 },
    { id: "27-3000", title: "Media & communication workers", iconName: "Camera", level: 2 },
  ],
  "37": [
    { id: "37-2000", title: "Cleaning & pest control", iconName: "Sparkles", level: 2 },
    { id: "37-3000", title: "Grounds maintenance", iconName: "TreeDeciduous", level: 2 },
  ],
  "19": [
    { id: "19-1000", title: "Life scientists", iconName: "Leaf", level: 2 },
    { id: "19-2000", title: "Physical scientists", iconName: "Beaker", level: 2 },
  ],
  "11": [
    { id: "11-1000", title: "Top executives", iconName: "Crown", level: 2 },
    { id: "11-3000", title: "Operations managers", iconName: "Settings", level: 2 },
  ],
  "15": [
    { id: "15-1200", title: "Computer jobs", iconName: "Monitor", level: 2 },
    { id: "15-2000", title: "Math jobs", iconName: "Sigma", level: 2 },
  ],
};

export default function JobVizGlassDemo() {
  const [activeParent, setActiveParent] = useState<JobVizGridItem | null>(null);

  const isRoot = !activeParent;
  const items = isRoot
    ? level1Items
    : level2ByParent[activeParent.id] ?? [];

  const segments: BreadcrumbSegment[] = isRoot
    ? [
        {
          label: "job-categories",
          iconName: "Grid2x2",
          isActive: true,
        },
      ]
    : [
        {
          label: "job-categories",
          iconName: "Grid2x2",
          onClick: () => setActiveParent(null),
        },
        {
          label: activeParent.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          iconName: activeParent.iconName,
          isActive: true,
        },
      ];

  return (
    <>
      <Head>
        <title>JobViz Glass Demo</title>
        <meta
          name="description"
          content="Internal JobViz UI demo for visual testing."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600&family=Noto+Sans+Mono:wght@300;400&display=swap"
        />
      </Head>

      <section className={styles.jobvizHero}>
        <div className={styles.jobvizHeroInner}>
          <h1 className={styles.jobvizHeroTitle}>JobViz Career Explorer+</h1>
          <p className={styles.jobvizHeroSubtitle}>
            Prototype of the updated JobViz aesthetic: glassmorphic cards, bash-style breadcrumbs, and Lucide icons.
          </p>
        </div>
      </section>

      <section className={styles.jobvizSection}>
        <div className={styles.jobvizSectionBg} />
        <div className={styles.jobvizSectionPattern} />
        <div className={`${styles.jobvizSectionInner} container`}>
          <JobVizBreadcrumb segments={segments} />
          <h2 className={styles.jobvizSectionHeading}>
            {isRoot ? "Explore job families" : activeParent?.title}
          </h2>

          <JobVizGrid
            items={items}
            onItemClick={(item) => {
              if (isRoot) {
                setActiveParent(item);
              }
            }}
          />
        </div>
      </section>
    </>
  );
}
