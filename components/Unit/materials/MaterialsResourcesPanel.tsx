import React from 'react';
import styles from './UnitMaterials.module.css';
import MaterialsQuickStartSection from './MaterialsQuickStartSection';
import MaterialsGpPlusFunctionsSection from './MaterialsGpPlusFunctionsSection';
import MaterialsPreviewDownloadSection from './MaterialsPreviewDownloadSection';
import MaterialsGpPlusBanner from './MaterialsGpPlusBanner';

type TMaterialsResourcesPanelProps = {
  lessonResourcesCardRef: React.RefObject<HTMLDivElement | null>;
  isGpPlusUser: boolean;
  isGpPlusBannerDismissed: boolean;
  setIsGpPlusBannerDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGpPlusModalDisplayed: (isDisplayed: boolean) => void;
  quickStartProps: any;
  gpPlusFunctionsProps: any;
  previewDownloadProps: any;
};

const MaterialsResourcesPanel: React.FC<TMaterialsResourcesPanelProps> = ({
  lessonResourcesCardRef,
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
      <MaterialsGpPlusBanner
        headline="Download & Edit lessons in one-click"
        subhead="Get 50% off GP+"
        isGpPlusUser={isGpPlusUser}
        isGpPlusBannerDismissed={isGpPlusBannerDismissed}
        setIsGpPlusBannerDismissed={setIsGpPlusBannerDismissed}
        setIsGpPlusModalDisplayed={setIsGpPlusModalDisplayed}
      />
      <div ref={lessonResourcesCardRef} className={styles.lessonResourcesCard}>
        <MaterialsQuickStartSection {...quickStartProps} />
        <MaterialsGpPlusFunctionsSection {...gpPlusFunctionsProps} />
        <MaterialsPreviewDownloadSection {...previewDownloadProps} />
      </div>
    </>
  );
};

export default MaterialsResourcesPanel;
