import React from 'react';
import { BookOpenText, Printer, SquareArrowOutUpRight } from 'lucide-react';
import RichText from '../../../RichText';
import styles from '../UnitMaterials.module.css';

type TBackgroundPreviewProps = {
  backgroundContent: string;
  onPrint: () => void;
  onOpenInNewTab: () => void;
  showLinkOutAction?: boolean;
  showPanelHeading?: boolean;
  panelClassName?: string;
};

const BackgroundPreview: React.FC<TBackgroundPreviewProps> = ({
  backgroundContent,
  onPrint,
  onOpenInNewTab,
  showLinkOutAction = true,
  showPanelHeading = true,
  panelClassName,
}) => {
  return (
    <div
      className={
        panelClassName
          ? `${styles.lessonProcedureInPreview} ${panelClassName}`
          : styles.lessonProcedureInPreview
      }
    >
      <div className={styles.lessonProcedureHeader}>
        {(showPanelHeading || showLinkOutAction) && (
          <div className={styles.lessonProcedureHeaderTop}>
            {showPanelHeading ? (
              <h3 className={styles.lessonCardHeading}>
                <BookOpenText size={16} aria-hidden="true" />
                <span>Background</span>
              </h3>
            ) : (
              <span />
            )}
            {showLinkOutAction && (
              <div className={styles.lessonPreviewHeaderActions}>
                <button
                  type="button"
                  className={styles.procedureLinkOutBtn}
                  onClick={onPrint}
                >
                  <span>Print</span>
                  <Printer size={13} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={styles.procedureLinkOutBtn}
                  onClick={onOpenInNewTab}
                >
                  <span>Open in New Tab</span>
                  <SquareArrowOutUpRight size={13} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
        {showPanelHeading && (
          <span>Context and real-world connections for this unit.</span>
        )}
      </div>
      <div
        id="unit-search-background-content"
        className={styles.lessonProcedureContent}
      >
        {backgroundContent ? (
          <div className={styles.richTextBlock}>
            <RichText content={backgroundContent} />
          </div>
        ) : (
          <p className={styles.unitMutedText}>Background content will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default BackgroundPreview;
