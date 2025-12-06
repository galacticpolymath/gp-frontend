import * as React from "react";
import styles from "../../styles/jobvizBurst.module.scss";
import {
  averageLineItemGrowth,
  growthRange,
  totalLineItems,
  totalTopLevelCategories,
} from "./jobvizUtils";

interface JobVizLayoutProps {
  heroTitle: string;
  heroSubtitle?: string;
  children: React.ReactNode;
  heroSlot?: React.ReactNode;
  suppressHero?: boolean;
}

export const JobVizLayout: React.FC<JobVizLayoutProps> = ({
  heroTitle,
  heroSubtitle,
  children,
  heroSlot,
  suppressHero = false,
}) => {
  const growthLabel = `${averageLineItemGrowth > 0 ? "+" : ""}${averageLineItemGrowth.toFixed(1)}%`;
  const effectiveSubtitle =
    heroSubtitle ??
    "A tool for grades 6 to adult to explore career possibilities!";
  const formatPercentRangeValue = (value: number) => {
    const formatted = Math.abs(value).toFixed(1).replace(/\.0$/, "");
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    return `${sign}${formatted}%`;
  };
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
      value: `Range: ${formatPercentRangeValue(growthRange.min)} to ${formatPercentRangeValue(growthRange.max)}`,
    },
  ];

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let rafId: number | null = null;
    const updateParallax = () => {
      rafId = null;
      const scrollY = window.scrollY || 0;
      const heroOffset = Math.min(scrollY * 0.12, 160);
      const bgOffset = Math.min(scrollY * 0.2, 220);
      const sectionOffset = Math.min(scrollY * 0.2, 220);
      document.documentElement.style.setProperty(
        "--jobviz-hero-offset",
        `${heroOffset}px`
      );
      document.documentElement.style.setProperty(
        "--jobviz-bg-offset",
        `${bgOffset}px`
      );
      document.documentElement.style.setProperty(
        "--jobviz-section-offset",
        `${sectionOffset}px`
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
      document.documentElement.style.setProperty("--jobviz-section-offset", "0px");
    };
  }, []);

  return (
    <>
      {!suppressHero &&
        (heroSlot ?? (
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
        ))}

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
