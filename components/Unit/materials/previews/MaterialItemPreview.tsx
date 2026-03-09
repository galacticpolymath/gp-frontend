import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CircleAlert, Eye, SquareArrowOutUpRight } from 'lucide-react';
import styles from '../UnitMaterials.module.css';

type TMaterialItemPreviewProps = {
  activeLessonItems: any[];
  activeMaterialIndex: number;
  getMaterialUrls: (...args: any[]) => any;
  toGooglePdfExportUrl: (...args: any[]) => string | null;
  getNormalizedGDriveRoot: (...args: any[]) => string;
  getFirstItemUrl: (...args: any[]) => string | null;
  isImageUrl: (...args: any[]) => boolean;
  isAuthenticated: boolean;
  isUserTeacher: boolean;
  isGpPlusUser: boolean;
  isGpPlusMember: boolean | null | undefined;
  handleGateNavigateToGpPlus: (...args: any[]) => void;
  handleGateNavigateToAccount: (...args: any[]) => void;
  handleCopyAllMaterialsClick: () => void;
  handleOpenOfficeUpsell: (format: string) => void;
  isCopyAllDisabledForGpPlus: boolean;
  latestCopiedLessonFolderUrl: string | null;
};

const MaterialItemPreview: React.FC<TMaterialItemPreviewProps> = ({
  activeLessonItems,
  activeMaterialIndex,
  getMaterialUrls,
  toGooglePdfExportUrl,
  getNormalizedGDriveRoot,
  getFirstItemUrl,
  isImageUrl,
  isAuthenticated,
  isUserTeacher,
  isGpPlusUser,
  isGpPlusMember,
  handleGateNavigateToGpPlus,
  handleGateNavigateToAccount,
  handleCopyAllMaterialsClick,
  handleOpenOfficeUpsell,
  isCopyAllDisabledForGpPlus,
  latestCopiedLessonFolderUrl,
}) => {
  if (!activeLessonItems.length) {
    return <p className={styles.unitMutedText}>Item previews will appear here.</p>;
  }

  const safeIndex = activeMaterialIndex > activeLessonItems.length - 1 ? 0 : activeMaterialIndex;
  const selectedItem = activeLessonItems[safeIndex];
  const selectedPreviewItem = selectedItem as any;
  const { openUrl, previewUrl, embedUrl, pdfDownloadUrl, officeDownloadUrl, officeFormat } =
    getMaterialUrls(selectedPreviewItem);

  const previewPdfDownloadUrl =
    pdfDownloadUrl ??
    (() => {
      if (selectedPreviewItem?.gdriveRoot) {
        return toGooglePdfExportUrl(getNormalizedGDriveRoot(selectedPreviewItem.gdriveRoot)) ?? null;
      }
      const firstUrl = getFirstItemUrl(selectedPreviewItem);
      return firstUrl ? toGooglePdfExportUrl(firstUrl) ?? null : null;
    })();

  const previewImg = (selectedItem as { filePreviewImg?: string })?.filePreviewImg ?? null;
  const previewTitle = selectedItem?.itemTitle ?? `Resource ${safeIndex + 1}`;
  const previewDescription =
    selectedItem?.itemDescription ?? 'Preview details will appear for this material.';
  const itemTypeLabel = selectedPreviewItem?.itemType?.toLowerCase() ?? '';
  const selectedIsTeacherOnly =
    typeof selectedItem?.itemTitle === 'string' && selectedItem.itemTitle.toLowerCase().includes('teacher');
  const isPresentation = itemTypeLabel === 'presentation';
  const itemCatLabel = selectedPreviewItem?.itemCat?.toLowerCase() ?? '';
  const fileTypeLabel = selectedPreviewItem?.fileType?.toLowerCase() ?? '';
  const isWebResource = itemCatLabel === 'web resource' || fileTypeLabel === 'web resource';
  const hasExternalOpenUrl = Boolean(openUrl && /^https?:\/\//i.test(openUrl));
  const allowOpenInNewTab = isPresentation || (isWebResource && hasExternalOpenUrl);
  const frameSrc = isPresentation ? embedUrl ?? previewUrl ?? openUrl : embedUrl ?? previewUrl;
  const isGoogleDrivePreviewFrame = Boolean(
    frameSrc && /(?:docs\.google\.com|drive\.google\.com)/i.test(frameSrc)
  );
  const isPreviewLockedLoggedOut = !isAuthenticated;
  const isPreviewLockedTeacher = isAuthenticated && !isUserTeacher && selectedIsTeacherOnly;
  const isPreviewLocked = isPreviewLockedLoggedOut || isPreviewLockedTeacher;
  const canOpenSelected = allowOpenInNewTab && !!openUrl && !isPreviewLocked;
  const hasOfficeDownload = !!officeDownloadUrl && !!officeFormat;
  const canAccessOffice =
    hasOfficeDownload && !isPreviewLockedTeacher && isAuthenticated && isGpPlusUser;
  const canUpsellOffice =
    hasOfficeDownload && !isPreviewLockedTeacher && isAuthenticated && isGpPlusMember === false;
  const hasGoogleDriveSource = Boolean(
    selectedPreviewItem.gdriveRoot ||
      selectedPreviewItem.links?.some((linkObj: any) => {
        const urlValue = linkObj?.url;
        if (Array.isArray(urlValue)) {
          return urlValue.some((url: string) =>
            /(docs\.google\.com|drive\.google\.com)/i.test(String(url))
          );
        }
        return typeof urlValue === 'string'
          ? /(docs\.google\.com|drive\.google\.com)/i.test(urlValue)
          : false;
      })
  );

  return (
    <article className={styles.lessonPreviewItem}>
      <header className={styles.lessonPreviewHeader}>
        <h3 className={styles.lessonCardHeading}>
          <Eye size={16} aria-hidden="true" />
          <span>Item preview</span>
        </h3>
        {canOpenSelected ? (
          <a className={styles.materialOpenLink} href={openUrl ?? undefined} target="_blank" rel="noreferrer">
            <span>Open in new tab</span>
            <SquareArrowOutUpRight size={13} aria-hidden="true" />
          </a>
        ) : isPreviewLocked || !allowOpenInNewTab ? null : (
          <span className={styles.materialOpenLinkDisabled}>No file link</span>
        )}
      </header>
      <div
        className={`${styles.lessonPreviewSurface} ${
          isPreviewLocked ? styles.lessonPreviewSurfaceLocked : ''
        }`}
      >
        <div
          className={`${styles.lessonPreviewMedia} ${
            isPreviewLocked ? styles.lessonPreviewMediaBlurred : ''
          }`}
        >
          {frameSrc ? (
            <iframe
              title={`${previewTitle} preview`}
              src={frameSrc}
              className={isGoogleDrivePreviewFrame ? styles.lessonPreviewIFrameGoogle : undefined}
            />
          ) : previewImg ? (
            <img src={previewImg} alt={`${previewTitle} preview`} loading="lazy" />
          ) : previewUrl && isImageUrl(previewUrl) ? (
            <img src={previewUrl} alt={`${previewTitle} preview`} loading="lazy" />
          ) : (
            <p className={styles.unitMutedText}>Preview unavailable for this file type.</p>
          )}
        </div>
        {isPreviewLocked && (
          <div className={styles.lessonPreviewGate}>
            <p>
              {isPreviewLockedLoggedOut ? (
                <span className={styles.lessonPreviewGateWarning}>
                  <CircleAlert size={18} aria-hidden="true" />
                  <span>Must Be Logged in to View Teaching Materials</span>
                </span>
              ) : (
                'Only viewable by teachers. If you are a teacher, please update your account.'
              )}
            </p>
            {isPreviewLockedLoggedOut ? (
              <div className={styles.lessonPreviewGateActions}>
                <Link
                  href="/gp-plus"
                  className={styles.lessonPreviewGateButton}
                  onClick={handleGateNavigateToGpPlus}
                >
                  Create a Free Account
                </Link>
                <Link
                  href="/account"
                  className={styles.lessonPreviewGateButton}
                  onClick={handleGateNavigateToAccount}
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <Link
                href="/account?show_about_user_form=true"
                className={styles.lessonPreviewGateButton}
              >
                Update your account
              </Link>
            )}
          </div>
        )}
      </div>
      <div className={styles.lessonPreviewMeta}>
        <strong>{previewTitle}</strong>
        <p>{previewDescription}</p>
        {(selectedPreviewItem.itemType || selectedPreviewItem.itemCat) && (
          <span className={styles.lessonPreviewType}>
            {(selectedPreviewItem.itemType ?? selectedPreviewItem.itemCat ?? '').toString()}
          </span>
        )}
        {(previewPdfDownloadUrl || hasOfficeDownload) && (
          <div className={styles.materialDownloadRow}>
            {hasGoogleDriveSource && (
              <button
                type="button"
                className={styles.materialCopyAllBtn}
                onClick={handleCopyAllMaterialsClick}
                disabled={isCopyAllDisabledForGpPlus}
              >
                <Image alt="GP+ icon" width={14} height={14} src="/plus/plus.png" />
                <span>Copy All to my Google Drive</span>
              </button>
            )}
            <span className={styles.materialDownloadLabel}>Download</span>
            <div className={styles.materialDownloadActions}>
              {previewPdfDownloadUrl && isAuthenticated && !isPreviewLockedTeacher ? (
                <a
                  className={styles.materialPdfLink}
                  href={previewPdfDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  PDF
                </a>
              ) : previewPdfDownloadUrl ? (
                <span className={styles.materialPdfLinkDisabled}>PDF</span>
              ) : null}
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
        )}
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
    </article>
  );
};

export default MaterialItemPreview;
