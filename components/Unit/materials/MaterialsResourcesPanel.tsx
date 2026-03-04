import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import styles from '../UnitPage.module.css';
import MaterialsQuickStartSection from './MaterialsQuickStartSection';
import MaterialsGpPlusFunctionsSection from './MaterialsGpPlusFunctionsSection';
import MaterialsPreviewDownloadSection from './MaterialsPreviewDownloadSection';

type TMaterialsResourcesPanelProps = {
  isGpPlusUser: boolean;
  isGpPlusBannerDismissed: boolean;
  setIsGpPlusBannerDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGpPlusModalDisplayed: (isDisplayed: boolean) => void;
  quickStartProps: any;
  gpPlusFunctionsProps: any;
  previewDownloadProps: any;
};

const MaterialsResourcesPanel: React.FC<TMaterialsResourcesPanelProps> = ({
  isGpPlusUser,
  isGpPlusBannerDismissed,
  setIsGpPlusBannerDismissed,
  setIsGpPlusModalDisplayed,
  quickStartProps,
  gpPlusFunctionsProps,
  previewDownloadProps,
}) => {
  return (
    <>
      {!isGpPlusUser && !isGpPlusBannerDismissed && (
        <div className={styles.gpPlusBannerWrapInGrid}>
          <div className={styles.gpPlusBanner}>
            <button
              type="button"
              className={styles.gpPlusBannerClose}
              aria-label="Dismiss GP+ upgrade banner"
              onClick={() => setIsGpPlusBannerDismissed(true)}
            >
              <X size={16} aria-hidden="true" />
            </button>
            <div className={styles.gpPlusLogo}>
              <Image
                alt="GP+ logo"
                width={88}
                height={88}
                src="/imgs/gp-logos/gp_submark.png"
              />
            </div>
            <div className={styles.gpPlusCopy}>
              <div className={styles.gpPlusHeadline}>
                Download &amp; Edit lessons in one-click
              </div>
              <div className={styles.gpPlusSubhead}>Get 50% off GP+</div>
            </div>
            <button
              type="button"
              className={styles.gpPlusCta}
              onClick={() => setIsGpPlusModalDisplayed(true)}
            >
              <span className={styles.gpPlusCtaIcon}>
                <Image alt="GP+ icon" width={48} height={48} src="/plus/plus.png" />
              </span>
              <span>Upgrade to GP+</span>
            </button>
          </div>
        </div>
      )}
      <div className={styles.lessonResourcesCard}>
        <MaterialsQuickStartSection {...quickStartProps} />
        <MaterialsGpPlusFunctionsSection {...gpPlusFunctionsProps} />
        <MaterialsPreviewDownloadSection {...previewDownloadProps} />
      </div>
    </>
  );
};

export default MaterialsResourcesPanel;
