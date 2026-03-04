import React from 'react';
import Image from 'next/image';
import { Download } from 'lucide-react';
import styles from '../UnitPage.module.css';

type TMaterialsPreviewDownloadSectionProps = {
  activeLessonItems: any[];
  activeLessonPreviewMode: string;
  activeMaterialIndex: number;
  isAuthenticated: boolean;
  isUserTeacher: boolean;
  isGpPlusUser: boolean;
  isGpPlusMember: boolean | null;
  isGpPlusResolved: boolean;
  getMaterialTypeIcon: (itemType?: unknown, itemCat?: unknown) => React.ReactNode;
  getMaterialUrls: (item?: any) => {
    pdfDownloadUrl?: string | null;
    officeDownloadUrl?: string | null;
    officeFormat?: string | null;
  };
  selectMaterialItem: (index: number, itemTitle: string | null | undefined) => void;
  handleOpenOfficeUpsell: (format: string) => void;
};

const MaterialsPreviewDownloadSection: React.FC<TMaterialsPreviewDownloadSectionProps> = ({
  activeLessonItems,
  activeLessonPreviewMode,
  activeMaterialIndex,
  isAuthenticated,
  isUserTeacher,
  isGpPlusUser,
  isGpPlusMember,
  isGpPlusResolved,
  getMaterialTypeIcon,
  getMaterialUrls,
  selectMaterialItem,
  handleOpenOfficeUpsell,
}) => {
  return (
    <section className={`${styles.resourceSection} ${styles.previewDownloadSection}`}>
      <h3 className={styles.lessonCardHeading}>
        <Download size={16} aria-hidden="true" />
        <span>Preview and Download</span>
      </h3>
      {!!activeLessonItems.length ? (
        <div className={styles.lessonDownloadList}>
          {activeLessonItems.map((item, idx) => {
            const previewItem = item as any;
            const { pdfDownloadUrl, officeDownloadUrl, officeFormat } =
              getMaterialUrls(previewItem);
            const isActive =
              activeLessonPreviewMode === 'materials' && idx === activeMaterialIndex;
            const resourceTitle = item.itemTitle ?? `Resource ${idx + 1}`;
            const isTeacherOnlyItem =
              typeof item.itemTitle === 'string' &&
              item.itemTitle.toLowerCase().includes('teacher');
            const isTeacherLocked =
              isAuthenticated && !isUserTeacher && isTeacherOnlyItem;
            const canAccessPdf = !!pdfDownloadUrl && !isTeacherLocked && isAuthenticated;
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
                key={`${item.itemTitle}-${idx}`}
                className={`${styles.materialRow} ${isActive ? styles.materialRowActive : ''}`}
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest('a') || target.closest('button')) {
                    return;
                  }
                  selectMaterialItem(idx, item.itemTitle);
                }}
              >
                <div className={styles.materialRowTop}>
                  <button
                    type="button"
                    className={styles.materialSelectButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectMaterialItem(idx, item.itemTitle);
                    }}
                    aria-pressed={isActive}
                  >
                    <span className={styles.materialRowIcon} aria-hidden="true">
                      {getMaterialTypeIcon(previewItem.itemType, previewItem.itemCat)}
                    </span>
                    <span className={styles.materialRowMain}>
                      <strong>{resourceTitle}</strong>
                      {(previewItem.itemType || previewItem.itemCat) && (
                        <span>
                          {(previewItem.itemType ?? previewItem.itemCat ?? '').toString()}
                        </span>
                      )}
                    </span>
                  </button>
                </div>
                {(pdfDownloadUrl || hasOfficeDownload) && (
                  <div className={styles.materialRowPdfWrap}>
                    <div className={styles.materialDownloadRow}>
                      <span
                        className={`${styles.materialDownloadLabel} ${styles.materialDownloadLabelLeading}`}
                      >
                        Download
                      </span>
                      <div className={styles.materialDownloadActions}>
                        {pdfDownloadUrl &&
                          (canAccessPdf ? (
                            <a
                              className={styles.materialPdfLink}
                              href={pdfDownloadUrl}
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
                              onClick={() => handleOpenOfficeUpsell(officeFormat ?? 'Office')}
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
        <p className={styles.unitMutedText}>Materials will appear here once added.</p>
      )}
    </section>
  );
};

export default MaterialsPreviewDownloadSection;
