import React from 'react';
import styles from '../UnitPage.module.css';

type TMaterialsPreviewPaneProps = {
  lessonPreviewsCardRef: React.RefObject<HTMLDivElement | null>;
  previewPaneStickyStyle?: React.CSSProperties;
  activeLessonPreviewMode: string;
  children: React.ReactNode;
};

const MaterialsPreviewPane: React.FC<TMaterialsPreviewPaneProps> = ({
  lessonPreviewsCardRef,
  previewPaneStickyStyle,
  activeLessonPreviewMode,
  children,
}) => {
  return (
    <div
      ref={lessonPreviewsCardRef}
      className={styles.lessonPreviewsCard}
      style={previewPaneStickyStyle}
    >
      <div
        key={`lesson-preview-${activeLessonPreviewMode}`}
        className={`${styles.unitTabFadeIn} ${styles.lessonPreviewPaneContent}`}
      >
        {children}
      </div>
    </div>
  );
};

export default MaterialsPreviewPane;
