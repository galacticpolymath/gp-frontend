import * as React from "react";
import styles from "../../styles/jobvizBurst.module.scss";
import {
  averageLineItemGrowth,
  growthRange,
  totalLineItems,
  totalTopLevelCategories,
} from "./jobvizUtils";
import { JOBVIZ_MAIN_ANCHOR_ID } from "./jobvizDomIds";

interface JobVizLayoutProps {
  heroTitle: string;
  heroSubtitle?: string;
  children: React.ReactNode;
  heroSlot?: React.ReactNode;
  suppressHero?: boolean;
  heroEyebrow?: string;
  onStatAction?: (id: string) => void;
}

type HeroStatRange = {
  label: string;
  arrow: string;
  colorClass: string;
};

type HeroStat = {
  id: string;
  label: string;
  value?: string;
  range?: HeroStatRange[];
};

export const JobVizLayout: React.FC<JobVizLayoutProps> = ({
  heroTitle,
  heroSubtitle,
  children,
  heroSlot,
  suppressHero = false,
  heroEyebrow = "JobViz Burst Edition",
  onStatAction,
}) => {
  const effectiveSubtitle =
    heroSubtitle ??
    "A tool for grades 6 to adult to explore career possibilities!";
  const formatPercentRangeValue = (value: number) => {
    const formatted = Math.abs(value).toFixed(1).replace(/\.0$/, "");
    const arrow = value > 0 ? "↑" : value < 0 ? "↓" : "→";
    const colorClass = value > 0 ? styles.statValueHot : value < 0 ? styles.statValueCool : styles.statValueNeutral;
    return { label: `${formatted}%`, arrow, colorClass };
  };
  const heroStats = React.useMemo<HeroStat[]>(
    () => [
      {
        id: "search",
        label: "Search details about",
        value: `${totalLineItems.toLocaleString("en-US")} jobs`,
      },
      {
        id: "browse",
        label: "Browse",
        value: `${totalTopLevelCategories.toLocaleString("en-US")} categories of jobs`,
      },
      {
        id: "growth",
        label: "Learn which careers are heating up",
        range: [
          formatPercentRangeValue(growthRange.min),
          formatPercentRangeValue(growthRange.max),
        ],
      },
    ],
    []
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let rafId: number | null = null;
    const updateParallax = () => {
      rafId = null;
      const scrollY = window.scrollY || 0;
      const heroOffset = Math.max(scrollY * -0.12, -160);
      document.documentElement.style.setProperty(
        "--jobviz-hero-offset",
        `${heroOffset}px`
      );
    };
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.style.setProperty("--jobviz-hero-offset", "0px");
      document.documentElement.style.setProperty("--jobviz-bg-offset", "0px");
    };
  }, []);

  return (
    <>
      {!suppressHero &&
        (heroSlot ?? (
          <section className={styles.jobvizHero} data-tone="burst">
            <div className={styles.jobvizHeroContent}>
              <div className={styles.jobvizHeroInner}>
                <p className={styles.heroEyebrow}>{heroEyebrow}</p>
                <h1 className={styles.heroTitle}>{heroTitle}</h1>
                <p className={styles.heroSubtitle}>{effectiveSubtitle}</p>
              </div>
              <div className={styles.heroStatsColumn}>
                <div className={styles.heroStats}>
                  {heroStats.map((stat) => (
                    <button
                      key={stat.id}
                      type="button"
                      className={styles.heroStat}
                      onClick={() => onStatAction?.(stat.id)}
                    >
                      <span className={styles.heroStatLabel}>{stat.label}</span>
                      <strong className={styles.heroStatValue}>
                        {stat.range ? (
                          <>
                            <span
                              className={`${styles.heroRangeValue} ${stat.range[0].colorClass}`}
                            >
                              {stat.range[0].arrow} {stat.range[0].label}
                            </span>
                            <span className={styles.heroRangeDivider}>·</span>
                            <span
                              className={`${styles.heroRangeValue} ${stat.range[1].colorClass}`}
                            >
                              {stat.range[1].arrow} {stat.range[1].label}
                            </span>
                          </>
                        ) : (
                          stat.value
                        )}
                      </strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

      <div id={JOBVIZ_MAIN_ANCHOR_ID} aria-hidden="true" />
      <section className={styles.jobvizSection}>
        <div className={styles.jobvizSectionBg} />
        <div className={styles.jobvizSectionPattern} />
        <div className={styles.jobvizSectionInner}>
          {children}
        </div>
      </section>
    </>
  );
};
