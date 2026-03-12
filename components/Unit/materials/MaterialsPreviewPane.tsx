import React from 'react';
import styles from './UnitMaterials.module.css';
import desktopStyles from './MaterialsDesktopPreview.module.css';

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
      className={desktopStyles.desktopPreviewPane}
      style={previewPaneStickyStyle}
    >
      <div
        key={`lesson-preview-${activeLessonPreviewMode}`}
        className={`${styles.unitTabFadeIn} ${desktopStyles.desktopPreviewPaneContent}`}
      >
        {children}
      </div>
    </div>
  );
};

export default MaterialsPreviewPane;
