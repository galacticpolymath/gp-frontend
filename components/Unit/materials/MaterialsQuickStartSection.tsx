import React from 'react';
import { Apple, BookOpenText, BowArrow, MonitorPlay } from 'lucide-react';
import styles from './UnitMaterials.module.css';

type TMaterialsQuickStartSectionProps = {
  isFeaturedMediaOpen: boolean;
  isDetailedFlowOpen: boolean;
  isBackgroundOpen: boolean;
  isGoingFurtherOpen: boolean;
  hasFeaturedMedia: boolean;
  hasDetailedFlow: boolean;
  hasBackgroundContent: boolean;
  hasGoingFurther: boolean;
  setActiveLessonPreviewMode: (mode: any) => void;
};

const MaterialsQuickStartSection: React.FC<TMaterialsQuickStartSectionProps> = ({
  isFeaturedMediaOpen,
  isDetailedFlowOpen,
  isBackgroundOpen,
  isGoingFurtherOpen,
  hasFeaturedMedia,
  hasDetailedFlow,
  hasBackgroundContent,
  hasGoingFurther,
  setActiveLessonPreviewMode,
}) => {
  const getToggleClassName = (isActive: boolean, isAvailable: boolean) =>
    `${styles.lessonProcedureToggle} ${
      isActive ? styles.lessonProcedureToggleActive : ''
    } ${!isAvailable ? styles.lessonProcedureToggleUnavailable : ''}`;

  return (
    <section className={`${styles.resourceSection} ${styles.quickStartSection}`}>
      <h3 className={styles.lessonCardHeading}>
        <span>Quick Start</span>
      </h3>
      <div className={styles.quickStartActions}>
        <button
          type="button"
          className={getToggleClassName(isFeaturedMediaOpen, hasFeaturedMedia)}
          onClick={() => setActiveLessonPreviewMode('featured-media')}
          aria-pressed={isFeaturedMediaOpen}
          aria-disabled={!hasFeaturedMedia}
        >
          <span className={styles.lessonProcedureToggleText}>
            <MonitorPlay size={16} aria-hidden="true" />
            <span>Featured Media</span>
          </span>
        </button>
        <button
          type="button"
          className={getToggleClassName(isDetailedFlowOpen, hasDetailedFlow)}
          onClick={() => setActiveLessonPreviewMode('procedure')}
          aria-pressed={isDetailedFlowOpen}
          aria-disabled={!hasDetailedFlow}
        >
          <span className={styles.lessonProcedureToggleText}>
            <Apple size={16} aria-hidden="true" />
            <span>Procedure</span>
          </span>
        </button>
        <button
          type="button"
          className={getToggleClassName(isBackgroundOpen, hasBackgroundContent)}
          onClick={() => setActiveLessonPreviewMode('background')}
          aria-pressed={isBackgroundOpen}
          aria-disabled={!hasBackgroundContent}
        >
          <span className={styles.lessonProcedureToggleText}>
            <BookOpenText size={16} aria-hidden="true" />
            <span>Background</span>
          </span>
        </button>
        <button
          type="button"
          className={getToggleClassName(isGoingFurtherOpen, hasGoingFurther)}
          onClick={() => setActiveLessonPreviewMode('going-further')}
          aria-pressed={isGoingFurtherOpen}
          aria-disabled={!hasGoingFurther}
        >
          <span className={styles.lessonProcedureToggleText}>
            <BowArrow size={16} aria-hidden="true" />
            <span>Going Further</span>
          </span>
        </button>
      </div>
    </section>
  );
};

export default MaterialsQuickStartSection;
