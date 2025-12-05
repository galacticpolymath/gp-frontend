import styles from "../../../styles/jobvizBurst.module.scss";
import {
  averageLineItemGrowth,
  totalLineItems,
  totalTopLevelCategories,
} from "../jobvizUtils";

interface IHeroForFreeUsersProps {
  className?: string;
}

const numberFormatter = new Intl.NumberFormat("en-US");
const growthLabel = `${averageLineItemGrowth > 0 ? "+" : ""}${averageLineItemGrowth.toFixed(1)}%`;

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
  { label: "Learn which careers are heating up", value: growthLabel },
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
            Explore the calmer Burst palette, animated cards, and stacked icons.
            GP+ members unlock share links, assignments, and live classroom
            prompts.
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
