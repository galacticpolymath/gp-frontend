import * as React from "react";
import styles from "../../styles/jobvizGlass.module.css";

interface JobVizLayoutProps {
  heroTitle: string;
  heroSubtitle?: string;
  children: React.ReactNode;
}

export const JobVizLayout: React.FC<JobVizLayoutProps> = ({
  heroTitle,
  heroSubtitle,
  children,
}) => {
  return (
    <>
      <section className={styles.jobvizHero}>
        <div className={styles.jobvizHeroInner}>
          <h1 className={styles.jobvizHeroTitle}>{heroTitle}</h1>
          {heroSubtitle && (
            <p className={styles.jobvizHeroSubtitle}>{heroSubtitle}</p>
          )}
        </div>
      </section>

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
