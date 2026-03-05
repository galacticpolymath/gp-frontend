import React from 'react';
import Image from 'next/image';
import { ChevronUp, FileSearch2, Menu, NotebookPen } from 'lucide-react';
import {
  IItemForUI,
  INewUnitLesson,
} from '../../../backend/models/Unit/types/teachingMaterials';
import LocDropdown from '../../LocDropdown';
import ProfileAvatarRing from '../../ProfileAvatarRing';
import styles from '../styles/UnitStickyHeader.module.css';

type TTabOption = {
  key: string;
  label: string;
};

type TSearchResultEntry = {
  id: string;
  tab: 'overview' | 'materials' | 'standards' | 'credits';
  title: string;
  excerpt: string;
  text: string;
  content: string;
  snippet: string;
  anchorId?: string;
  lessonId?: number | null;
};

type TUnitStickyHeaderProps = {
  headerRef: React.RefObject<HTMLDivElement | null>;
  unitTitle: string;
  unitSubtitle: string;
  isSearchExpanded: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setIsSearchExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  handleSearchToggle: () => void;
  availLocs: string[];
  numID?: number;
  locale: string;
  handlePortalNavToggle: () => void;
  isPortalNavCollapsed: boolean;
  effectiveAvatarUrl?: string | null;
  isGpPlusUser: boolean;
  avatarCandidates: string[];
  setAvatarCandidateIndex: React.Dispatch<React.SetStateAction<number>>;
  availableTabs: TTabOption[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  materialsTabKey: string;
  lessons: INewUnitLesson<IItemForUI>[];
  activeLessonId: number | null;
  getLessonIdentifier: (lesson: INewUnitLesson<IItemForUI>, index: number) => number;
  isAssessmentLesson: (
    lesson: INewUnitLesson<IItemForUI> | undefined,
    index: number
  ) => boolean;
  lessonTileFallbackSrc: string;
  handleLessonChange: (lessonId: number) => void;
  searchResults: TSearchResultEntry[];
  handleSearchSelect: (entry: TSearchResultEntry) => void;
  renderHighlightedText: (
    text: string,
    query: string,
    className: string
  ) => React.ReactNode;
};

const UnitStickyHeader: React.FC<TUnitStickyHeaderProps> = ({
  headerRef,
  unitTitle,
  unitSubtitle,
  isSearchExpanded,
  searchTerm,
  setSearchTerm,
  setIsSearchExpanded,
  searchInputRef,
  handleSearchToggle,
  availLocs,
  numID,
  locale,
  handlePortalNavToggle,
  isPortalNavCollapsed,
  effectiveAvatarUrl,
  isGpPlusUser,
  avatarCandidates,
  setAvatarCandidateIndex,
  availableTabs,
  activeTab,
  onTabChange,
  materialsTabKey,
  lessons,
  activeLessonId,
  getLessonIdentifier,
  isAssessmentLesson,
  lessonTileFallbackSrc,
  handleLessonChange,
  searchResults,
  handleSearchSelect,
  renderHighlightedText,
}) => (
  <div
    ref={headerRef}
    className={styles.unitStickyHeader}
    style={{
      position: 'fixed',
      top: 'var(--portal-nav-offset, 0px)',
      zIndex: 60,
    }}
  >
    <div className={styles.unitStickyInner}>
      <div className={styles.unitStickyTopRow}>
        <div className={styles.unitStickyTitle}>
          <span className={styles.unitStickyText}>
            {unitTitle}
            {unitSubtitle ? `: ${unitSubtitle}` : ''}
          </span>
        </div>
      </div>
      <div className={styles.unitSearch}>
        <div className={styles.unitSearchRow}>
          <div
            className={
              isSearchExpanded
                ? `${styles.unitSearchInputWrap} ${styles.unitSearchInputWrapExpanded}`
                : `${styles.unitSearchInputWrap} ${styles.unitSearchInputWrapCollapsed}`
            }
          >
            <button
              type="button"
              className={styles.unitSearchIcon}
              aria-label={isSearchExpanded ? 'Collapse unit search' : 'Expand unit search'}
              aria-controls="unit-search"
              aria-expanded={isSearchExpanded}
              onClick={handleSearchToggle}
            >
              <FileSearch2 size={16} aria-hidden="true" />
            </button>
            <input
              id="unit-search"
              ref={searchInputRef}
              className={
                isSearchExpanded
                  ? `${styles.unitSearchInput} ${styles.unitSearchInputExpanded}`
                  : `${styles.unitSearchInput} ${styles.unitSearchInputCollapsed}`
              }
              type="search"
              placeholder="Search within this unit"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setSearchTerm('');
                  setIsSearchExpanded(false);
                }
              }}
              tabIndex={isSearchExpanded ? 0 : -1}
            />
          </div>
          {availLocs.length > 0 && numID != null && (
            <div className={styles.unitLocaleSwitcher}>
              <LocDropdown availLocs={availLocs} loc={locale} id={numID} />
            </div>
          )}
          <button
            type="button"
            className={styles.unitNavVisibilityToggle}
            onClick={handlePortalNavToggle}
            aria-label={isPortalNavCollapsed ? 'Profile menu' : 'Collapse menu'}
          >
            <ChevronUp
              size={18}
              aria-hidden="true"
              className={
                isPortalNavCollapsed
                  ? styles.unitNavVisibilityToggleIconCollapsed
                  : styles.unitNavVisibilityToggleIconExpanded
              }
            />
            {isPortalNavCollapsed ? (
              <span className={styles.unitNavProfileSummary}>
                <Menu size={14} aria-hidden="true" className={styles.unitNavMenuHintIcon} />
                <ProfileAvatarRing
                  avatarUrl={effectiveAvatarUrl}
                  isPlusMember={isGpPlusUser}
                  size={22}
                  onError={() =>
                    setAvatarCandidateIndex((currentIndex) =>
                      currentIndex + 1 < avatarCandidates.length
                        ? currentIndex + 1
                        : avatarCandidates.length
                    )
                  }
                />
              </span>
            ) : (
              <span>Collapse</span>
            )}
          </button>
        </div>
      </div>
      <div className={styles.unitTabList}>
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={
              tab.key === activeTab
                ? `${styles.unitTabButton} ${styles.unitTabButtonActive}`
                : styles.unitTabButton
            }
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === materialsTabKey && lessons.length > 0 && (
        <div className={styles.lessonSubtabBar}>
          <span className={styles.lessonSubtabLabel}>Lessons:</span>
          <div className={styles.lessonSubtabList}>
            {lessons.map((lesson, index) => {
              const lessonId = getLessonIdentifier(lesson, index);
              const isActive = lessonId === activeLessonId;
              const isAssessment = isAssessmentLesson(lesson, index);
              return (
                <button
                  key={`sticky-lesson-tab-${lessonId}`}
                  type="button"
                  className={
                    isActive
                      ? `${styles.lessonSubtabButton} ${styles.lessonSubtabButtonActive}`
                      : styles.lessonSubtabButton
                  }
                  onClick={() => handleLessonChange(lessonId)}
                >
                  {isAssessment ? (
                    <span
                      className={`${styles.lessonSubtabThumb} ${styles.lessonSubtabThumbAssessment}`}
                      aria-hidden="true"
                    >
                      <NotebookPen size={13} />
                    </span>
                  ) : lesson.tile ? (
                    <span className={styles.lessonSubtabThumb} aria-hidden="true">
                      <Image src={lesson.tile} alt="" width={22} height={22} />
                    </span>
                  ) : (
                    <span className={styles.lessonSubtabThumb} aria-hidden="true">
                      <Image src={lessonTileFallbackSrc} alt="" width={22} height={22} />
                    </span>
                  )}
                  <span>{isAssessment ? 'Assess' : lessonId}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {isSearchExpanded && searchTerm.length > 1 && (
        <div className={styles.unitSearchResults}>
          {searchResults.length ? (
            searchResults.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={styles.unitSearchResult}
                onClick={() => handleSearchSelect(entry)}
              >
                <span className={styles.searchResultTitle}>
                  {renderHighlightedText(entry.title, searchTerm, styles.searchResultHighlight)}
                </span>
                <span className={styles.searchResultExcerpt}>
                  {renderHighlightedText(
                    entry.snippet,
                    searchTerm,
                    styles.searchResultHighlight
                  )}
                </span>
              </button>
            ))
          ) : (
            <p className={styles.searchResultEmpty}>No matches yet. Try a different keyword.</p>
          )}
        </div>
      )}
    </div>
  </div>
);

export default UnitStickyHeader;
