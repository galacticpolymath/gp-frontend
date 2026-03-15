import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  BowArrow,
  ChevronDown,
  Eye,
  MonitorPlay,
  SquareArrowOutUpRight,
  X,
} from 'lucide-react';
import AssessmentMobileSections from './mobile/AssessmentMobileSections';
import MaterialsPreviewDownloadSection from './MaterialsPreviewDownloadSection';
import MaterialsGpPlusFunctionsSection from './MaterialsGpPlusFunctionsSection';
import MaterialsGpPlusBanner from './MaterialsGpPlusBanner';
import styles from './UnitMaterials.module.css';

type TMaterialsMobileStackProps = {
  activeLessonId: number | null;
  isAssessmentLesson: boolean;
  isGpPlusUser: boolean;
  isGpPlusBannerDismissed: boolean;
  setIsGpPlusBannerDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGpPlusModalDisplayed: (isDisplayed: boolean) => void;
  activeLessonPreviewMode: string;
  setActiveLessonPreviewMode: (mode: string) => void;
  hasFeaturedMedia: boolean;
  hasDetailedFlow: boolean;
  hasBackgroundContent: boolean;
  hasGoingFurther: boolean;
  hasJobVizConnections: boolean;
  previewDownloadProps: any;
  gpPlusFunctionsProps: any;
  assessmentProps: any;
  onCopyAllFromModal: () => void;
  renderPreviewContent: (options?: {
    onCopyAll?: () => void;
    preferPresentationPreview?: boolean;
    hideMaterialHeader?: boolean;
  }) => React.ReactNode;
};

type TAccordionState = Record<string, boolean>;

const NON_ASSESSMENT_DEFAULT_OPEN: TAccordionState = {
  featured: true,
  downloads: true,
  gpplus: true,
  deep: false,
};

const ASSESSMENT_DEFAULT_OPEN: TAccordionState = {
  digital: true,
  printed: true,
  gpplus: true,
};

const MaterialsMobileStack: React.FC<TMaterialsMobileStackProps> = ({
  activeLessonId,
  isAssessmentLesson,
  isGpPlusUser,
  isGpPlusBannerDismissed,
  setIsGpPlusBannerDismissed,
  setIsGpPlusModalDisplayed,
  activeLessonPreviewMode,
  setActiveLessonPreviewMode,
  hasFeaturedMedia,
  hasDetailedFlow,
  hasBackgroundContent,
  hasGoingFurther,
  hasJobVizConnections,
  previewDownloadProps,
  gpPlusFunctionsProps,
  assessmentProps,
  onCopyAllFromModal,
  renderPreviewContent,
}) => {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [mobileMaterialSurfaceHeight, setMobileMaterialSurfaceHeight] = useState<number | null>(
    null
  );
  const [openSections, setOpenSections] = useState<TAccordionState>(
    isAssessmentLesson ? ASSESSMENT_DEFAULT_OPEN : NON_ASSESSMENT_DEFAULT_OPEN
  );
  const mobilePreviewBodyInnerRef = useRef<HTMLDivElement | null>(null);
  const modalPreviewItems = useMemo(
    () =>
      isAssessmentLesson
        ? assessmentProps?.assessmentItems ?? []
        : previewDownloadProps?.activeLessonItems ?? [],
    [
      assessmentProps?.assessmentItems,
      isAssessmentLesson,
      previewDownloadProps?.activeLessonItems,
    ]
  );
  const modalPreviewIndex = isAssessmentLesson
    ? assessmentProps?.activeMaterialIndex ?? 0
    : previewDownloadProps?.activeMaterialIndex ?? 0;
  const safeModalPreviewIndex = Math.max(
    0,
    Math.min(modalPreviewItems.length - 1, modalPreviewIndex)
  );
  const modalActiveItem = modalPreviewItems[safeModalPreviewIndex] ?? null;
  const modalMaterialUrls =
    activeLessonPreviewMode === 'materials' && modalActiveItem
      ? (isAssessmentLesson
          ? assessmentProps?.getMaterialUrls?.(modalActiveItem)
          : previewDownloadProps?.getMaterialUrls?.(modalActiveItem)) ?? null
      : null;
  const modalItemType = String(modalActiveItem?.itemType ?? '').toLowerCase();
  const modalHasExplicitExternalUrl =
    typeof modalActiveItem?.externalURL === 'string' &&
    modalActiveItem.externalURL.trim().length > 0;
  const modalHasExternalOpenUrl =
    typeof modalMaterialUrls?.openUrl === 'string' &&
    /^https?:\/\//i.test(modalMaterialUrls.openUrl);
  const modalOpenUrl =
    typeof modalMaterialUrls?.openUrl === 'string' && modalMaterialUrls.openUrl.trim()
      ? modalMaterialUrls.openUrl
      : null;
  const showModalOpenLink =
    activeLessonPreviewMode === 'materials' &&
    modalItemType === 'presentation' &&
    modalHasExplicitExternalUrl &&
    modalHasExternalOpenUrl &&
    Boolean(modalOpenUrl);
  const modalHeaderLabel =
    activeLessonPreviewMode === 'materials'
      ? 'Item preview'
      : activeLessonPreviewMode === 'featured-media'
        ? 'Featured media'
        : activeLessonPreviewMode === 'procedure'
          ? 'Procedure'
          : activeLessonPreviewMode === 'background'
            ? 'Background'
            : activeLessonPreviewMode === 'going-further'
              ? 'Going further'
              : activeLessonPreviewMode === 'jobviz'
                ? 'GP+ preview'
                : 'Preview';

  useEffect(() => {
    setOpenSections(
      isAssessmentLesson ? ASSESSMENT_DEFAULT_OPEN : NON_ASSESSMENT_DEFAULT_OPEN
    );
    setIsPreviewModalOpen(false);
  }, [activeLessonId, isAssessmentLesson]);

  useEffect(() => {
    if (!isPreviewModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreviewModalOpen]);

  useEffect(() => {
    if (
      !isPreviewModalOpen ||
      activeLessonPreviewMode !== 'materials' ||
      typeof window === 'undefined'
    ) {
      setMobileMaterialSurfaceHeight(null);
      return;
    }

    let rafId = 0;
    const container = mobilePreviewBodyInnerRef.current;
    if (!container) {
      setMobileMaterialSurfaceHeight(null);
      return;
    }

    const previewItem = container.querySelector<HTMLElement>(`.${styles.lessonPreviewItem}`);
    const previewMeta = container.querySelector<HTMLElement>(`.${styles.lessonPreviewMeta}`);

    if (!previewItem || !previewMeta) {
      setMobileMaterialSurfaceHeight(null);
      return;
    }

    const measure = () => {
      const itemStyles = window.getComputedStyle(previewItem);
      const rowGap = Number.parseFloat(itemStyles.rowGap || '0');
      const previewMetaHeight = Math.ceil(previewMeta.getBoundingClientRect().height);
      const availableHeight = Math.floor(container.clientHeight - previewMetaHeight - rowGap);

      setMobileMaterialSurfaceHeight((current) => {
        if (!Number.isFinite(availableHeight) || availableHeight <= 0) {
          return null;
        }
        if (current != null && Math.abs(current - availableHeight) < 2) {
          return current;
        }
        return availableHeight;
      });
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(measure);
    };

    scheduleMeasure();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleMeasure) : null;
    resizeObserver?.observe(container);
    resizeObserver?.observe(previewItem);
    resizeObserver?.observe(previewMeta);
    window.addEventListener('resize', scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [activeLessonPreviewMode, isPreviewModalOpen, modalActiveItem]);

  const openPreviewMode = (mode: string) => {
    setActiveLessonPreviewMode(mode);
    setIsPreviewModalOpen(true);
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const handleCopyAllFromModal = () => {
    setIsPreviewModalOpen(false);
    window.requestAnimationFrame(() => {
      onCopyAllFromModal();
    });
  };

  const navigateModalPreview = (direction: 'prev' | 'next') => {
    if (activeLessonPreviewMode !== 'materials' || modalPreviewItems.length < 2) {
      return;
    }

    const currentIndex = Math.max(0, modalPreviewIndex);
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % modalPreviewItems.length
        : (currentIndex - 1 + modalPreviewItems.length) % modalPreviewItems.length;

    const targetItem = modalPreviewItems[nextIndex];
    const targetTitle =
      targetItem?.itemTitle != null ? String(targetItem.itemTitle) : `Resource ${nextIndex + 1}`;
    selectMaterialItemAndPreview(nextIndex, targetTitle);
  };

  const selectMaterialItemAndPreview = (index: number, itemTitle: string | null | undefined) => {
    if (typeof previewDownloadProps?.selectMaterialItem === 'function') {
      previewDownloadProps.selectMaterialItem(index, itemTitle);
    } else if (typeof assessmentProps?.selectMaterialItem === 'function') {
      assessmentProps.selectMaterialItem(index, itemTitle);
    }
    setIsPreviewModalOpen(true);
  };

  const renderAccordion = (
    sectionId: string,
    title: React.ReactNode,
    content: React.ReactNode
  ) => (
    <section className={styles.mobileAccordionSection} key={sectionId}>
      <button
        type="button"
        className={styles.mobileAccordionButton}
        onClick={() => toggleSection(sectionId)}
        aria-expanded={Boolean(openSections[sectionId])}
      >
        <span className={styles.mobileAccordionTitle}>{title}</span>
        <ChevronDown
          size={18}
          className={`${styles.mobileAccordionChevron} ${
            openSections[sectionId] ? styles.mobileAccordionChevronOpen : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`${styles.mobileAccordionPanel} ${
          openSections[sectionId] ? '' : styles.mobileAccordionPanelHidden
        }`}
      >
        {content}
      </div>
    </section>
  );

  const featuredSection = renderAccordion(
    'featured',
    'Featured Media',
    <div className={styles.mobileActionList}>
      <button
        type="button"
        className={`${styles.lessonProcedureToggle} ${
          activeLessonPreviewMode === 'featured-media'
            ? styles.lessonProcedureToggleActive
            : ''
        } ${!hasFeaturedMedia ? styles.lessonProcedureToggleUnavailable : ''}`}
        onClick={() => openPreviewMode('featured-media')}
        aria-disabled={!hasFeaturedMedia}
      >
        <span className={styles.lessonProcedureToggleText}>
          <MonitorPlay size={16} aria-hidden="true" />
          <span>Open Featured Media Preview</span>
        </span>
      </button>
    </div>
  );

  const downloadsSection = renderAccordion(
    'downloads',
    'Preview and Download',
    <MaterialsPreviewDownloadSection
      {...previewDownloadProps}
      selectMaterialItem={selectMaterialItemAndPreview}
    />
  );

  const gpPlusSection = renderAccordion(
    'gpplus',
    <span className={styles.mobileAccordionTitleWithIcon}>
      <Image alt="GP+ icon" width={18} height={18} src="/plus/plus.png" />
      <span>GP Plus Functions</span>
    </span>,
    <MaterialsGpPlusFunctionsSection
      {...gpPlusFunctionsProps}
      hasJobVizConnections={hasJobVizConnections}
      setActiveLessonPreviewMode={(mode: string) => openPreviewMode(mode)}
      renderAsSection={false}
    />
  );

  const deepPreviewSection = renderAccordion(
    'deep',
    'Procedure, Background, Going Further',
    <div className={styles.mobileActionList}>
      <button
        type="button"
        className={`${styles.lessonProcedureToggle} ${
          activeLessonPreviewMode === 'procedure' ? styles.lessonProcedureToggleActive : ''
        } ${!hasDetailedFlow ? styles.lessonProcedureToggleUnavailable : ''}`}
        onClick={() => openPreviewMode('procedure')}
        aria-disabled={!hasDetailedFlow}
      >
        <span className={styles.lessonProcedureToggleText}>
          <MonitorPlay size={16} aria-hidden="true" />
          <span>Open Procedure Preview</span>
        </span>
      </button>
      <button
        type="button"
        className={`${styles.lessonProcedureToggle} ${
          activeLessonPreviewMode === 'background' ? styles.lessonProcedureToggleActive : ''
        } ${!hasBackgroundContent ? styles.lessonProcedureToggleUnavailable : ''}`}
        onClick={() => openPreviewMode('background')}
        aria-disabled={!hasBackgroundContent}
      >
        <span className={styles.lessonProcedureToggleText}>
          <BookOpenText size={16} aria-hidden="true" />
          <span>Open Background Preview</span>
        </span>
      </button>
      <button
        type="button"
        className={`${styles.lessonProcedureToggle} ${
          activeLessonPreviewMode === 'going-further'
            ? styles.lessonProcedureToggleActive
            : ''
        } ${!hasGoingFurther ? styles.lessonProcedureToggleUnavailable : ''}`}
        onClick={() => openPreviewMode('going-further')}
        aria-disabled={!hasGoingFurther}
      >
        <span className={styles.lessonProcedureToggleText}>
          <BowArrow size={16} aria-hidden="true" />
          <span>Open Going Further Preview</span>
        </span>
      </button>
    </div>
  );

  const assessmentSections = (
    <AssessmentMobileSections
      activeLessonPreviewMode={activeLessonPreviewMode}
      openSections={openSections}
      toggleSection={toggleSection}
      selectMaterialItemAndPreview={selectMaterialItemAndPreview}
      assessmentProps={assessmentProps}
    />
  );

  return (
    <div className={styles.mobileMaterialsStack}>
      <MaterialsGpPlusBanner
        headline={
          isAssessmentLesson
            ? 'Unlock Digital Assessments with GP+'
            : 'Download & Edit lessons in one-click'
        }
        subhead={
          isAssessmentLesson ? 'View online forms and copy to your Drive' : 'Get 50% off GP+'
        }
        isGpPlusUser={isGpPlusUser}
        isGpPlusBannerDismissed={isGpPlusBannerDismissed}
        setIsGpPlusBannerDismissed={setIsGpPlusBannerDismissed}
        setIsGpPlusModalDisplayed={setIsGpPlusModalDisplayed}
        isMobile
      />
      {isAssessmentLesson
        ? assessmentSections
        : [featuredSection, downloadsSection, gpPlusSection, deepPreviewSection]}

      {isPreviewModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={styles.mobilePreviewModalBackdrop}
              role="presentation"
              onClick={() => setIsPreviewModalOpen(false)}
            >
              <div
                className={styles.mobilePreviewModal}
                role="dialog"
                aria-modal="true"
                aria-label="Teaching material preview"
                onClick={(event) => event.stopPropagation()}
              >
                <div className={styles.mobilePreviewModalHeader}>
                  <h3 className={styles.mobilePreviewModalHeaderLabel}>
                    <Eye size={16} aria-hidden="true" />
                    <span>{modalHeaderLabel}</span>
                  </h3>
                  <div className={styles.mobilePreviewModalHeaderActions}>
                    {showModalOpenLink ? (
                      <a
                        className={styles.mobilePreviewModalOpenLink}
                        href={modalOpenUrl ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>Open in new tab</span>
                        <SquareArrowOutUpRight size={13} aria-hidden="true" />
                      </a>
                    ) : null}
                    <button
                      type="button"
                      className={styles.mobilePreviewModalClose}
                      onClick={() => setIsPreviewModalOpen(false)}
                      aria-label="Close preview"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className={styles.mobilePreviewModalBody}>
                  <div
                    ref={
                      activeLessonPreviewMode === 'materials'
                        ? mobilePreviewBodyInnerRef
                        : null
                    }
                    key={`mobile-preview-${activeLessonPreviewMode}`}
                    className={`${styles.mobilePreviewModalBodyInner} ${
                      activeLessonPreviewMode === 'materials'
                        ? styles.mobilePreviewModalBodyInnerMaterial
                        : ''
                    }`}
                    style={
                      activeLessonPreviewMode === 'materials' &&
                      mobileMaterialSurfaceHeight != null
                        ? ({
                            ['--mobile-material-surface-height' as string]: `${mobileMaterialSurfaceHeight}px`,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    {renderPreviewContent({
                      onCopyAll: handleCopyAllFromModal,
                      preferPresentationPreview: true,
                      hideMaterialHeader: activeLessonPreviewMode === 'materials',
                    })}
                  </div>
                </div>
                {activeLessonPreviewMode === 'materials' && modalPreviewItems.length > 1 ? (
                  <div className={styles.mobilePreviewModalFooter}>
                    <div className={styles.mobileModalCarouselControls}>
                      <button
                        type="button"
                        className={styles.mobileModalCarouselButton}
                        onClick={() => navigateModalPreview('prev')}
                        aria-label="Previous material"
                      >
                        <ChevronLeft size={16} aria-hidden="true" />
                        <span>Previous</span>
                      </button>
                      <span className={styles.mobileModalCarouselCount}>
                        {Math.min(modalPreviewItems.length, modalPreviewIndex + 1)} /{' '}
                        {modalPreviewItems.length}
                      </span>
                      <button
                        type="button"
                        className={styles.mobileModalCarouselButton}
                        onClick={() => navigateModalPreview('next')}
                        aria-label="Next material"
                      >
                        <span>Next</span>
                        <ChevronRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default MaterialsMobileStack;
