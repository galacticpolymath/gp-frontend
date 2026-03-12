import React, { useMemo } from 'react';
import Image from 'next/image';
import { Download, Eye, FileStack, SquareArrowOutUpRight, X } from 'lucide-react';
import CopyLessonBtn from '../../LessonSection/TeachIt/CopyLessonBtn';
import styles from './UnitMaterials.module.css';

type TAssessmentMaterialsPanelProps = {
  lessonResourcesCardRef: React.RefObject<HTMLDivElement | null>;
  isGpPlusUser: boolean;
  isGpPlusBannerDismissed: boolean;
  setIsGpPlusBannerDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGpPlusModalDisplayed: (isDisplayed: boolean) => void;
  assessmentItems: any[];
  activeLessonPreviewMode: string;
  activeMaterialIndex: number;
  isAuthenticated: boolean;
  isUserTeacher: boolean;
  isGpPlusMember: boolean | null | undefined;
  isGpPlusResolved: boolean;
  getMaterialTypeIcon: (itemType?: unknown, itemCat?: unknown) => React.ReactNode;
  getMaterialUrls: (item?: any) => {
    openUrl?: string | null;
    previewUrl?: string | null;
    embedUrl?: string | null;
    pdfDownloadUrl?: string | null;
    officeDownloadUrl?: string | null;
    officeFormat?: string | null;
  };
  toGooglePdfExportUrl: (value: string) => string | null;
  getNormalizedGDriveRoot: (value: string) => string;
  selectMaterialItem: (index: number, itemTitle: string | null | undefined) => void;
  handleOpenOfficeUpsell: (format: string) => void;
  handleBrowseAllMaterialsClick: () => void;
  handleCopyAllMaterialsClick: () => void;
  isBrowseDisabledForGpPlus: boolean;
  isCopyAllDisabledForGpPlus: boolean;
  browseUnavailableReason: string;
  copyAllUnavailableReason: string;
  latestCopiedLessonFolderUrl: string | null;
  canShowCopyAllToGoogleDriveBtn: boolean;
  copyLessonBtnRef: React.RefObject<HTMLButtonElement | null>;
  unitId: string;
  unit: any;
  activeLessonId: number | null;
  activeLesson: any;
  lessonsGradesForCopy: string;
  resolvedSharedFolderIdForCopy: string;
  resolvedSharedFolderNameForCopy: string;
  allUnitLessonsForCopy: any;
  effectiveLessonsFolderForCopy: any;
  isRetrievingLessonFolderIds: boolean;
  setLessons: React.Dispatch<React.SetStateAction<any[]>>;
};

type TItemWithIndex = {
  item: any;
  index: number;
};

const getFirstItemUrl = (item?: any): string | null => {
  if (!item) {
    return null;
  }

  if (typeof item.externalURL === 'string' && item.externalURL.trim()) {
    return item.externalURL;
  }

  const firstLink = item.links?.[0]?.url;
  if (Array.isArray(firstLink)) {
    const firstValue = firstLink.find((value) => typeof value === 'string' && value.trim());
    return firstValue ?? null;
  }

  if (typeof firstLink === 'string' && firstLink.trim()) {
    return firstLink;
  }

  if (typeof item.gdriveRoot === 'string' && item.gdriveRoot.trim()) {
    return item.gdriveRoot;
  }

  return null;
};

const toGoogleFormsViewModeUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const match = value.match(
    /https?:\/\/docs\.google\.com\/forms\/(?:u\/\d+\/)?d\/(e\/)?([^/?#]+)/i
  );

  if (!match?.[2]) {
    return null;
  }

  const kindPrefix = match[1] ? 'e/' : '';
  return `https://docs.google.com/forms/d/${kindPrefix}${match[2]}/viewform`;
};

const getAssessmentBuckets = (items: any[]): { digital: TItemWithIndex[]; printed: TItemWithIndex[] } => {
  const digital: TItemWithIndex[] = [];
  const printed: TItemWithIndex[] = [];

  items.forEach((item, index) => {
    const url = getFirstItemUrl(item) ?? '';
    const title = String(item?.itemTitle ?? '').toLowerCase();
    const itemType = String(item?.itemType ?? '').toLowerCase();
    const itemCat = String(item?.itemCat ?? '').toLowerCase();
    const fileType = String(item?.fileType ?? '').toLowerCase();

    const isGoogleForm = /docs\.google\.com\/forms\//i.test(url);
    const isDigitalLabel =
      /digital|form|google form|online/.test(title) ||
      /digital|web resource/.test(itemType) ||
      /digital|web resource/.test(itemCat) ||
      /web resource/.test(fileType);

    if (isGoogleForm || isDigitalLabel) {
      digital.push({ item, index });
      return;
    }

    printed.push({ item, index });
  });

  return { digital, printed };
};

const AssessmentMaterialsPanel: React.FC<TAssessmentMaterialsPanelProps> = ({
  lessonResourcesCardRef,
  isGpPlusUser,
  isGpPlusBannerDismissed,
  setIsGpPlusBannerDismissed,
  setIsGpPlusModalDisplayed,
  assessmentItems,
  activeLessonPreviewMode,
  activeMaterialIndex,
  isAuthenticated,
  isUserTeacher,
  isGpPlusMember,
  isGpPlusResolved,
  getMaterialTypeIcon,
  getMaterialUrls,
  toGooglePdfExportUrl,
  getNormalizedGDriveRoot,
  selectMaterialItem,
  handleOpenOfficeUpsell,
  handleBrowseAllMaterialsClick,
  handleCopyAllMaterialsClick,
  isBrowseDisabledForGpPlus,
  isCopyAllDisabledForGpPlus,
  browseUnavailableReason,
  copyAllUnavailableReason,
  latestCopiedLessonFolderUrl,
  canShowCopyAllToGoogleDriveBtn,
  copyLessonBtnRef,
  unitId,
  unit,
  activeLessonId,
  activeLesson,
  lessonsGradesForCopy,
  resolvedSharedFolderIdForCopy,
  resolvedSharedFolderNameForCopy,
  allUnitLessonsForCopy,
  effectiveLessonsFolderForCopy,
  isRetrievingLessonFolderIds,
  setLessons,
}) => {
  const { digital, printed } = useMemo(
    () => getAssessmentBuckets(assessmentItems),
    [assessmentItems]
  );

  const activeDigitalItem = useMemo(() => {
    if (!digital.length) {
      return null;
    }
    const selected = digital.find(
      (entry) => activeLessonPreviewMode === 'materials' && entry.index === activeMaterialIndex
    );
    return selected ?? digital[0];
  }, [activeLessonPreviewMode, activeMaterialIndex, digital]);

  const digitalSourceUrl = getFirstItemUrl(activeDigitalItem?.item);
  const digitalFormViewUrl = toGoogleFormsViewModeUrl(digitalSourceUrl);
  const digitalMaterialUrls = getMaterialUrls(activeDigitalItem?.item);
  const digitalViewUrl =
    digitalFormViewUrl ??
    digitalMaterialUrls.openUrl ??
    digitalMaterialUrls.previewUrl ??
    null;

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
              <div className={styles.gpPlusHeadline}>Unlock Digital Assessments with GP+</div>
              <div className={styles.gpPlusSubhead}>View online forms and copy to your Drive</div>
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

      <div ref={lessonResourcesCardRef} className={styles.lessonResourcesCard}>
        <section className={`${styles.resourceSection} ${styles.gpPlusFunctionsSection}`}>
          <h3 className={styles.lessonCardHeading}>
            <Image alt="GP+ icon" width={18} height={18} src="/plus/plus.png" />
            <span>Assessment Folder Actions</span>
          </h3>
          <div className={styles.gpFunctionActions}>
            <div className={styles.gpFunctionActionItem}>
              <button
                type="button"
                className={`${styles.lessonProcedureToggle} ${styles.gpFunctionActionBtn}`}
                onClick={handleBrowseAllMaterialsClick}
              >
                <span className={styles.lessonProcedureToggleText}>
                  <Eye size={16} aria-hidden="true" />
                  <span>Browse on Gdrive (View Only)</span>
                </span>
              </button>
              {isBrowseDisabledForGpPlus && (
                <p className={styles.copyAllHelperText}>{browseUnavailableReason}</p>
              )}
            </div>
            <div className={styles.gpFunctionActionItem}>
              <button
                type="button"
                className={`${styles.lessonProcedureToggle} ${styles.gpFunctionActionBtn}`}
                onClick={handleCopyAllMaterialsClick}
              >
                <span className={styles.lessonProcedureToggleText}>
                  <FileStack size={16} aria-hidden="true" />
                  <span>Copy All to my Google Drive</span>
                </span>
              </button>
              {isCopyAllDisabledForGpPlus && (
                <p className={styles.copyAllHelperText}>{copyAllUnavailableReason}</p>
              )}
            </div>
            {latestCopiedLessonFolderUrl ? (
              <a
                className={styles.gpPlusFileVersionsLink}
                href={latestCopiedLessonFolderUrl}
                target="_blank"
                rel="noreferrer"
              >
                <SquareArrowOutUpRight size={15} aria-hidden="true" />
                <span>My file versions</span>
              </a>
            ) : null}
          </div>
        </section>

        <section className={`${styles.resourceSection} ${styles.previewDownloadSection}`}>
          <h3 className={styles.lessonCardHeading}>
            <Image alt="GP+ icon" width={18} height={18} src="/plus/plus.png" />
            <span>Digital Assessment</span>
          </h3>
          {activeDigitalItem ? (
            <div className={styles.assessmentDigitalWrap}>
              <article
                className={styles.materialRow}
                onClick={() =>
                  selectMaterialItem(activeDigitalItem.index, activeDigitalItem.item?.itemTitle)
                }
              >
                <div className={styles.materialRowTop}>
                  <button
                    type="button"
                    className={styles.materialSelectButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectMaterialItem(activeDigitalItem.index, activeDigitalItem.item?.itemTitle);
                    }}
                    aria-pressed={
                      activeLessonPreviewMode === 'materials' &&
                      activeDigitalItem.index === activeMaterialIndex
                    }
                  >
                    <span className={styles.materialRowIcon} aria-hidden="true">
                      {getMaterialTypeIcon(
                        activeDigitalItem.item?.itemType,
                        activeDigitalItem.item?.itemCat
                      )}
                    </span>
                    <span className={styles.materialRowMain}>
                      <strong>{activeDigitalItem.item?.itemTitle ?? 'Digital assessment form'}</strong>
                      <span>Digital form</span>
                    </span>
                  </button>
                </div>
              </article>
              {!isGpPlusUser && (
                <p className={styles.copyAllHelperText}>
                  GP+ required to view the digital form preview in the preview pane.
                </p>
              )}
              {digitalViewUrl ? (
                <span className={styles.materialOpenLinkDisabled}>
                  Google Form version of Printed Assessment
                </span>
              ) : null}
            </div>
          ) : (
            <p className={styles.unitMutedText}>Digital assessments will appear here once added.</p>
          )}
        </section>

        <section className={`${styles.resourceSection} ${styles.previewDownloadSection}`}>
          <h3 className={styles.lessonCardHeading}>
            <Download size={16} aria-hidden="true" />
            <span>Printed Assessment</span>
          </h3>
          {!!printed.length ? (
            <div className={styles.lessonDownloadList}>
              {printed.map(({ item, index }) => {
                const { pdfDownloadUrl, officeDownloadUrl, officeFormat } = getMaterialUrls(item);
                const resolvedPdfDownloadUrl =
                  pdfDownloadUrl ??
                  (() => {
                    if (item?.gdriveRoot) {
                      return (
                        toGooglePdfExportUrl(getNormalizedGDriveRoot(item.gdriveRoot)) ?? null
                      );
                    }
                    const firstUrl = getFirstItemUrl(item);
                    return firstUrl ? toGooglePdfExportUrl(firstUrl) ?? null : null;
                  })();
                const isActive =
                  activeLessonPreviewMode === 'materials' && index === activeMaterialIndex;
                const resourceTitle = item.itemTitle ?? `Resource ${index + 1}`;
                const isTeacherOnlyItem =
                  typeof item.itemTitle === 'string' &&
                  item.itemTitle.toLowerCase().includes('teacher');
                const isTeacherLocked = isAuthenticated && !isUserTeacher && isTeacherOnlyItem;
                const canAccessPdf =
                  !!resolvedPdfDownloadUrl && !isTeacherLocked && isAuthenticated;
                const hasOfficeDownload = !!officeDownloadUrl && !!officeFormat;
                const canAccessOffice =
                  hasOfficeDownload && !isTeacherLocked && isAuthenticated && isGpPlusUser;
                const canUpsellOffice =
                  hasOfficeDownload &&
                  !isTeacherLocked &&
                  isAuthenticated &&
                  isGpPlusMember === false;

                return (
                  <article
                    key={`${item.itemTitle}-${index}`}
                    className={`${styles.materialRow} ${isActive ? styles.materialRowActive : ''}`}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest('a') || target.closest('button')) {
                        return;
                      }
                      selectMaterialItem(index, item.itemTitle);
                    }}
                  >
                    <div className={styles.materialRowTop}>
                      <button
                        type="button"
                        className={styles.materialSelectButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          selectMaterialItem(index, item.itemTitle);
                        }}
                        aria-pressed={isActive}
                      >
                        <span className={styles.materialRowIcon} aria-hidden="true">
                          {getMaterialTypeIcon(item.itemType, item.itemCat)}
                        </span>
                        <span className={styles.materialRowMain}>
                          <strong>{resourceTitle}</strong>
                          {(item.itemType || item.itemCat) && (
                            <span>{(item.itemType ?? item.itemCat ?? '').toString()}</span>
                          )}
                        </span>
                      </button>
                    </div>
                    {(resolvedPdfDownloadUrl || hasOfficeDownload) && (
                      <div className={styles.materialRowPdfWrap}>
                        <div className={styles.materialDownloadRow}>
                          <div className={styles.materialDownloadPair}>
                            <span
                              className={`${styles.materialDownloadLabel} ${styles.materialDownloadLabelLeading}`}
                            >
                              Download
                            </span>
                            <div className={styles.materialDownloadActions}>
                              {resolvedPdfDownloadUrl &&
                                (canAccessPdf ? (
                                  <a
                                    className={styles.materialPdfLink}
                                    href={resolvedPdfDownloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    PDF
                                  </a>
                                ) : (
                                  <span className={styles.materialPdfLinkDisabled}>PDF</span>
                                ))}
                              {hasOfficeDownload &&
                                (canAccessOffice ? (
                                  <a
                                    className={`${styles.materialPdfLink} ${styles.materialOfficeLink}`}
                                    href={officeDownloadUrl ?? undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <span className={styles.materialOfficeLinkContent}>
                                      <Image
                                        alt="GP+ icon"
                                        width={13}
                                        height={13}
                                        src="/plus/plus.png"
                                        className={styles.materialOfficeLinkPlusIcon}
                                      />
                                      <span>{officeFormat}</span>
                                    </span>
                                  </a>
                                ) : canUpsellOffice ? (
                                  <button
                                    type="button"
                                    className={`${styles.materialPdfLink} ${styles.materialOfficeLink} ${styles.materialOfficeLinkLocked}`}
                                    onClick={() =>
                                      handleOpenOfficeUpsell(officeFormat ?? 'Office')
                                    }
                                  >
                                    <span className={styles.materialOfficeLinkContent}>
                                      <Image
                                        alt="GP+ icon"
                                        width={13}
                                        height={13}
                                        src="/plus/plus.png"
                                        className={styles.materialOfficeLinkPlusIcon}
                                      />
                                      <span>{officeFormat}</span>
                                    </span>
                                  </button>
                                ) : (
                                  <span
                                    className={`${styles.materialPdfLinkDisabled} ${styles.materialOfficeLink} ${styles.materialOfficeLinkLocked}`}
                                  >
                                    <span className={styles.materialOfficeLinkContent}>
                                      <Image
                                        alt="GP+ icon"
                                        width={13}
                                        height={13}
                                        src="/plus/plus.png"
                                        className={styles.materialOfficeLinkPlusIcon}
                                      />
                                      <span>{officeFormat}</span>
                                    </span>
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                        {isGpPlusResolved &&
                          isGpPlusMember === false &&
                          hasOfficeDownload &&
                          isAuthenticated && (
                            <span className={styles.officeUpsellTag}>GP+ editable files</span>
                          )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className={styles.unitMutedText}>Printed assessments will appear here once added.</p>
          )}
        </section>

        {isGpPlusUser && canShowCopyAllToGoogleDriveBtn && (
          <CopyLessonBtn
            btnRef={copyLessonBtnRef}
            unitId={unitId}
            unitTitle={unit.Title}
            MediumTitle={unit.MediumTitle ?? unit.Title ?? 'Unit'}
            lessonId={activeLessonId ?? ''}
            lessonName={activeLesson?.title ?? 'Lesson'}
            lessonsGrades={lessonsGradesForCopy}
            sharedGDriveLessonFolderId={resolvedSharedFolderIdForCopy}
            lessonSharedDriveFolderName={resolvedSharedFolderNameForCopy}
            userGDriveLessonFolderId={activeLesson?.userGDriveLessonFolderId}
            allUnitLessons={allUnitLessonsForCopy}
            GdrivePublicID={unit.GdrivePublicID}
            lessonsFolder={effectiveLessonsFolderForCopy}
            isRetrievingLessonFolderIds={isRetrievingLessonFolderIds}
            setParts={setLessons as any}
            btnClassName={styles.hiddenCopyLessonBtn}
            childrenClassName={styles.hiddenCopyLessonBtn}
            btnWrapperClassName={styles.hiddenCopyLessonBtn}
          />
        )}
      </div>
    </>
  );
};

export default AssessmentMaterialsPanel;
