import styles from "../../../styles/jobvizBurst.module.scss";
import {
  growthRange,
  totalLineItems,
  totalTopLevelCategories,
} from "../jobvizUtils";

interface IHeroForFreeUsersProps {
  className?: string;
}

const numberFormatter = new Intl.NumberFormat("en-US");
const formatPercent = (value: number) => {
  const formatted = Math.abs(value).toFixed(1).replace(/\.0$/, "");
  const arrow = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  return `${arrow} ${formatted}%`;
};

const HeroForFreeUsers: React.FC<IHeroForFreeUsersProps> = ({
  className = "",
}) => {
const heroStats = [
  {
    label: "Search details about",
    value: `${numberFormatter.format(totalLineItems)} jobs`,
  },
  {
    label: "Browse",
    value: `${numberFormatter.format(totalTopLevelCategories)} job categories`,
  },
  {
    label: "Learn which careers are heating up",
    value: `${formatPercent(growthRange.min)} · ${formatPercent(growthRange.max)}`,
  },
];

  return (
    <section
      className={`${styles.jobvizHero} ${className}`.trim()}
      data-tone="burst"
    >
      <div className={styles.jobvizHeroContent}>
        <div className={styles.jobvizHeroInner}>
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
              <div key={stat.label} className={styles.heroStat}>
                <span className={styles.heroStatLabel}>{stat.label}</span>
                <strong className={styles.heroStatValue}>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroForFreeUsers;
