import React from 'react';
import Image from 'next/image';
import { Eye, FileStack, SquareArrowOutUpRight } from 'lucide-react';
import CopyLessonBtn from '../../LessonSection/TeachIt/CopyLessonBtn';
import styles from './UnitMaterials.module.css';

type TMaterialsGpPlusFunctionsSectionProps = {
  isJobVizPreviewOpen: boolean;
  hasJobVizConnections: boolean;
  setActiveLessonPreviewMode: (mode: any) => void;
  handleBrowseAllMaterialsClick: () => void;
  handleCopyAllMaterialsClick: () => void;
  isBrowseDisabledForGpPlus: boolean;
  isCopyAllDisabledForGpPlus: boolean;
  latestCopiedLessonFolderUrl: string | null;
  browseUnavailableReason: string;
  copyAllUnavailableReason: string;
  isGpPlusUser: boolean;
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

const MaterialsGpPlusFunctionsSection: React.FC<TMaterialsGpPlusFunctionsSectionProps> = ({
  isJobVizPreviewOpen,
  hasJobVizConnections,
  setActiveLessonPreviewMode,
  handleBrowseAllMaterialsClick,
  handleCopyAllMaterialsClick,
  isBrowseDisabledForGpPlus,
  isCopyAllDisabledForGpPlus,
  latestCopiedLessonFolderUrl,
  browseUnavailableReason,
  copyAllUnavailableReason,
  isGpPlusUser,
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
  return (
    <section className={`${styles.resourceSection} ${styles.gpPlusFunctionsSection}`}>
      <h3 className={styles.lessonCardHeading}>
        <Image alt="GP+ icon" width={18} height={18} src="/plus/plus.png" />
        <span>GP Plus Functions</span>
      </h3>
      <div className={styles.gpFunctionActions}>
        <button
          type="button"
          className={`${styles.lessonProcedureToggle} ${styles.gpFunctionActionBtn} ${
            isJobVizPreviewOpen ? styles.lessonProcedureToggleActive : ''
          }`}
          onClick={() => setActiveLessonPreviewMode('jobviz')}
          aria-pressed={isJobVizPreviewOpen}
          disabled={!hasJobVizConnections}
        >
          <span className={styles.lessonProcedureToggleText}>
            <Image
              alt="JobViz Career Connections icon"
              width={24}
              height={24}
              src="/imgs/jobViz/jobviz_rocket_logo_black.svg"
              className={styles.jobVizActionIcon}
            />
            <span>JobViz Career Connections</span>
          </span>
        </button>
        <button
          type="button"
          className={`${styles.lessonProcedureToggle} ${styles.gpFunctionActionBtn}`}
          onClick={handleBrowseAllMaterialsClick}
          disabled={isBrowseDisabledForGpPlus}
        >
          <span className={styles.lessonProcedureToggleText}>
            <Eye size={16} aria-hidden="true" />
            <span>Browse on Gdrive (View Only)</span>
          </span>
        </button>
        <button
          type="button"
          className={`${styles.lessonProcedureToggle} ${styles.gpFunctionActionBtn}`}
          onClick={handleCopyAllMaterialsClick}
          disabled={isCopyAllDisabledForGpPlus}
        >
          <span className={styles.lessonProcedureToggleText}>
            <FileStack size={16} aria-hidden="true" />
            <span>Copy All to my Google Drive</span>
          </span>
        </button>
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
        {isBrowseDisabledForGpPlus && (
          <p className={styles.copyAllHelperText}>{browseUnavailableReason}</p>
        )}
        {isCopyAllDisabledForGpPlus && (
          <p className={styles.copyAllHelperText}>{copyAllUnavailableReason}</p>
        )}
      </div>
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
    </section>
  );
};

export default MaterialsGpPlusFunctionsSection;
