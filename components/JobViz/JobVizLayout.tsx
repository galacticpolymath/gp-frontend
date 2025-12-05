import * as React from "react";
import styles from "../../styles/jobvizBurst.module.scss";
import {
  averageLineItemGrowth,
  totalLineItems,
  totalTopLevelCategories,
} from "./jobvizUtils";

interface JobVizLayoutProps {
  heroTitle: string;
  heroSubtitle?: string;
  children: React.ReactNode;
  heroSlot?: React.ReactNode;
}

export const JobVizLayout: React.FC<JobVizLayoutProps> = ({
  heroTitle,
  heroSubtitle,
  children,
  heroSlot,
}) => {
  const growthLabel = `${averageLineItemGrowth > 0 ? "+" : ""}${averageLineItemGrowth.toFixed(1)}%`;
  const effectiveSubtitle =
    heroSubtitle ??
    "A tool for grades 6 to adult to explore career possibilities!";
  const heroStats = [
    {
      label: "Search details about",
      value: `${totalLineItems.toLocaleString("en-US")} jobs`,
    },
    {
      label: "Browse",
      value: `${totalTopLevelCategories.toLocaleString("en-US")} categories of jobs`,
    },
    {
      label: "Learn which careers are heating up",
      value: growthLabel,
    },
  ];

  return (
    <>
      {heroSlot ?? (
        <section className={styles.jobvizHero} data-tone="burst">
          <div className={styles.jobvizHeroContent}>
            <div className={styles.jobvizHeroInner}>
              <p className={styles.heroEyebrow}>JobViz Burst Edition</p>
              <h1 className={styles.heroTitle}>{heroTitle}</h1>
              <p className={styles.heroSubtitle}>{effectiveSubtitle}</p>
            </div>
            <div className={styles.heroStatsColumn}>
              <div className={styles.heroStats}>
                {heroStats.map((stat) => (
                  <div key={stat.label} className={styles.heroStat}>
                    <span className={styles.heroStatLabel}>{stat.label}</span>
                    <strong className={styles.heroStatValue}>
                      {stat.value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={styles.jobvizSection}>
        <div className={styles.jobvizSectionBg} />
        <div className={styles.jobvizSectionPattern} />
        <div className={`${styles.jobvizSectionInner} container`}>
          {children}
        </div>
      </section>
    </>
  );
};
