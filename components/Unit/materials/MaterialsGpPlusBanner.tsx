import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import styles from './UnitMaterials.module.css';

type TMaterialsGpPlusBannerProps = {
  headline: string;
  subhead: string;
  isGpPlusUser: boolean;
  isGpPlusBannerDismissed: boolean;
  setIsGpPlusBannerDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGpPlusModalDisplayed: (isDisplayed: boolean) => void;
  isMobile?: boolean;
};

const MaterialsGpPlusBanner: React.FC<TMaterialsGpPlusBannerProps> = ({
  headline,
  subhead,
  isGpPlusUser,
  isGpPlusBannerDismissed,
  setIsGpPlusBannerDismissed,
  setIsGpPlusModalDisplayed,
  isMobile = false,
}) => {
  if (isGpPlusUser || isGpPlusBannerDismissed) {
    return null;
  }

  return (
    <div className={styles.gpPlusBannerWrapInGrid}>
      <div className={`${styles.gpPlusBanner} ${isMobile ? styles.gpPlusBannerMobile : ''}`}>
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
            width={1081}
            height={736}
            style={{ width: '88px', height: 'auto' }}
            src="/imgs/gp-logos/gp_submark.png"
          />
        </div>
        <div className={styles.gpPlusCopy}>
          <div className={styles.gpPlusHeadline}>{headline}</div>
          <div className={styles.gpPlusSubhead}>{subhead}</div>
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
  );
};

export default MaterialsGpPlusBanner;
