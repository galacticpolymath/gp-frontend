import React from 'react';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import { Printer } from 'lucide-react';
import styles from '../UnitPage.module.css';

type TMaterialsStandalonePreviewProps = {
  isBackgroundStandaloneView: boolean;
  handlePrintPreview: () => void;
  procedureReturnHref: string;
  handleProcedureReturnClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  unitBanner: string;
  unitTitle: string;
  currentLessonLabel: string;
  activeLesson: { title?: string | null; tile?: string | null };
  lessonTileFallbackSrc: string;
  procedureReturnQrUrl: string;
  backgroundPanel: React.ReactNode;
  procedurePanel: React.ReactNode;
};

const MaterialsStandalonePreview: React.FC<TMaterialsStandalonePreviewProps> = ({
  isBackgroundStandaloneView,
  handlePrintPreview,
  procedureReturnHref,
  handleProcedureReturnClick,
  unitBanner,
  unitTitle,
  currentLessonLabel,
  activeLesson,
  lessonTileFallbackSrc,
  procedureReturnQrUrl,
  backgroundPanel,
  procedurePanel,
}) => {
  return (
    <div className={styles.procedureStandaloneLayout}>
      <div className={styles.procedureStandaloneHeader}>
        <div className={styles.procedureStandaloneTopRow}>
          <p className={styles.procedureStandaloneLabel}>
            {isBackgroundStandaloneView ? 'Background from:' : 'Procedure from:'}
          </p>
          <button
            type="button"
            className={styles.procedurePrintButton}
            onClick={handlePrintPreview}
            aria-label={
              isBackgroundStandaloneView ? 'Print background' : 'Print procedure'
            }
          >
            <Printer size={15} aria-hidden="true" />
            <span>Print</span>
          </button>
        </div>
        <div className={styles.procedureStandaloneHeaderRow}>
          <a
            href={procedureReturnHref}
            className={styles.procedureReturnLink}
            onClick={handleProcedureReturnClick}
          >
            {unitBanner && (
              <span className={styles.procedureReturnBanner} aria-hidden="true">
                <Image
                  src={unitBanner}
                  alt=""
                  fill
                  sizes="140px"
                  style={{ objectFit: 'cover' }}
                />
              </span>
            )}
            <span className={styles.procedureReturnText}>
              <span>{unitTitle}</span>
              <span>
                {currentLessonLabel}
                {activeLesson.title ? `: ${activeLesson.title}` : ''}
              </span>
            </span>
            <span className={styles.procedureReturnTile} aria-hidden="true">
              <Image
                src={activeLesson.tile || lessonTileFallbackSrc}
                alt=""
                fill
                sizes="74px"
                style={{ objectFit: 'cover' }}
              />
            </span>
          </a>
          <div className={styles.procedureReturnQr}>
            <QRCode
              value={procedureReturnQrUrl}
              size={86}
              bgColor="#ffffff"
              fgColor="#111111"
            />
          </div>
        </div>
      </div>
      {isBackgroundStandaloneView ? backgroundPanel : procedurePanel}
    </div>
  );
};

export default MaterialsStandalonePreview;
