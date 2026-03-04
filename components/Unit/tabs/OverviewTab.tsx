import React from 'react';
import Image from 'next/image';
import { Clock3, GraduationCap, MonitorPlay, NotebookPen, Target } from 'lucide-react';
import RichText from '../../RichText';
import LessonsCarousel from '../../LessonSection/Preview/LessonsCarousel';
import styles from '../UnitPage.module.css';

type TOverviewTabProps = {
  unit: any;
  overview: any;
  onGoToStandards: () => void;
  additionalAlignedSubjects: string[];
  targetStandardsSummary: { set: string; details: string } | null;
};

const OverviewTab: React.FC<TOverviewTabProps> = ({
  unit,
  overview,
  onGoToStandards,
  additionalAlignedSubjects,
  targetStandardsSummary,
}) => (
  <section className={`${styles.unitSection} ${styles.unitTabFadeIn}`}>
    <div className={styles.unitOverviewGrid}>
      <div
        id="unit-search-overview-gist"
        className={`${styles.unitOverviewCard} ${styles.unitOverviewCardPrimary}`}
      >
        <h3 className={styles.unitOverviewSectionTitle}>
          <span className={styles.unitOverviewSectionTitleIcon} aria-hidden="true">
            <NotebookPen size={16} />
          </span>
          The Gist
        </h3>
        {overview?.TheGist && (
          <div className={`${styles.richTextBlock} ${styles.unitLeadMarkdown}`}>
            <RichText content={overview.TheGist} />
          </div>
        )}
        {(overview as { Description?: string })?.Description && (
          <div className={`${styles.richTextBlock} ${styles.unitSummaryMarkdown}`}>
            <RichText content={(overview as { Description?: string }).Description ?? ''} />
          </div>
        )}
        {overview?.Text && (
          <div className={styles.richTextBlock}>
            <RichText content={overview.Text} />
          </div>
        )}
      </div>
      <div className={`${styles.unitOverviewCard} ${styles.unitOverviewCardCompact}`}>
        <div className={styles.atGlanceGrid}>
          {overview?.EstUnitTime && (
            <div className={styles.atGlanceItem}>
              <span className={styles.atGlanceIcon} aria-hidden="true">
                <Clock3 size={18} />
              </span>
              <div className={styles.atGlanceContent}>
                <span className={styles.atGlanceLabel}>Estimated time</span>
                <strong className={styles.atGlanceValue}>{overview.EstUnitTime}</strong>
              </div>
            </div>
          )}
          {unit.ForGrades && (
            <div className={styles.atGlanceItem}>
              <span className={styles.atGlanceIcon} aria-hidden="true">
                <GraduationCap size={18} />
              </span>
              <div className={styles.atGlanceContent}>
                <span className={styles.atGlanceLabel}>Grades</span>
                <strong className={styles.atGlanceValue}>{unit.ForGrades}</strong>
              </div>
            </div>
          )}
          {overview?.TargetSubject && (
            <button
              type="button"
              className={`${styles.atGlanceItem} ${styles.atGlanceItemAction}`}
              onClick={onGoToStandards}
            >
              <span className={styles.atGlanceIcon} aria-hidden="true">
                <NotebookPen size={18} />
              </span>
              <div className={styles.atGlanceContent}>
                <span className={styles.atGlanceLabel}>Subject focus</span>
                <strong className={styles.atGlanceValue}>{overview.TargetSubject}</strong>
              </div>
              {overview?.SteamEpaulette && (
                <div className={styles.learningEpaulette}>
                  <Image
                    src={overview.SteamEpaulette}
                    alt="GP learning epaulette"
                    width={240}
                    height={240}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              )}
              {!!additionalAlignedSubjects.length && (
                <span className={styles.alignedSubjectsText}>
                  Also aligned to {additionalAlignedSubjects.join(', ')}
                </span>
              )}
            </button>
          )}
          {targetStandardsSummary && (
            <button
              type="button"
              className={`${styles.atGlanceItem} ${styles.atGlanceItemAction}`}
              onClick={onGoToStandards}
            >
              <span className={styles.atGlanceIcon} aria-hidden="true">
                <Target size={18} />
              </span>
              <div className={styles.atGlanceContent}>
                <span className={styles.atGlanceLabel}>Target standards</span>
                <span className={`${styles.atGlanceValue} ${styles.atGlanceValueCompact}`}>
                  <strong>{targetStandardsSummary.set} |</strong>{' '}
                  {targetStandardsSummary.details}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
      <div id="unit-search-overview-media" className={styles.unitOverviewCardWide}>
        <h3 className={styles.unitOverviewSectionTitle}>
          <span className={styles.unitOverviewSectionTitleIcon} aria-hidden="true">
            <MonitorPlay size={16} />
          </span>
          Supporting Multimedia
        </h3>
        {unit.FeaturedMultimedia?.length ? (
          <div className={styles.previewCarousel}>
            <LessonsCarousel mediaItems={unit.FeaturedMultimedia} />
          </div>
        ) : (
          <p className={styles.unitMutedText}>
            Featured media will appear here once curated.
          </p>
        )}
      </div>
    </div>
  </section>
);

export default OverviewTab;
