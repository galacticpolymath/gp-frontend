import * as React from "react";
import Image from "next/image";
import styles from "../../../styles/jobvizBurst.module.scss";
import {
  growthRange,
  totalLineItems,
  totalTopLevelCategories,
} from "../jobvizUtils";

interface IHeroForFreeUsersProps {
  className?: string;
  onStatAction?: (id: string) => void;
}

const numberFormatter = new Intl.NumberFormat("en-US");
const formatPercentRangeValue = (value: number) => {
  const formatted = Math.abs(value).toFixed(1).replace(/\.0$/, "");
  const arrow = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  const colorClass =
    value > 0
      ? styles.statValueHot
      : value < 0
        ? styles.statValueCool
        : styles.statValueNeutral;
  return { label: `${formatted}%`, arrow, colorClass };
};

const HeroForFreeUsers: React.FC<IHeroForFreeUsersProps> = ({
  className = "",
  onStatAction,
}) => {
  const heroStats = React.useMemo(
    () => [
      {
        id: "search",
        label: "Search details about",
        value: `${numberFormatter.format(totalLineItems)} jobs`,
      },
      {
        id: "browse",
        label: "Browse",
        value: `${numberFormatter.format(totalTopLevelCategories)} job categories`,
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

  return (
    <section
      className={`${styles.jobvizHero} ${className}`.trim()}
      data-tone="burst"
    >
      <div className={styles.jobvizHeroContent}>
        <div className={styles.jobvizHeroInner}>
          <div className={styles.jobvizHeroLogo}>
            <Image
              src="/imgs/jobViz/jobviz_rocket_logo_white.svg"
              alt="JobViz logo"
              width={240}
              height={80}
              priority
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <p className={styles.heroEyebrow}>JobViz Free Preview</p>
          <h1 className={styles.heroTitle}>JobViz Career Explorer (FREE)</h1>
          <p className={styles.heroSubtitle}>
            A simple tool for understanding the world of work. Discover paths
            you never knew you could take!
          </p>
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
  );
};

export default HeroForFreeUsers;
