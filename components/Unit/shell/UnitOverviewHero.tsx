import React from 'react';
import Image from 'next/image';
import styles from '../styles/UnitHero.module.css';

type TUnitOverviewHeroProps = {
  unitTitle: string;
  unitSubtitle: string;
  unitBanner: string;
  unitVersionText: string | null;
  handleVersionInfoClick: () => void;
  heroUnitTags: string[];
  tagsToDisplay: string[];
  hiddenTagCount: number;
  isTagListExpanded: boolean;
  setIsTagListExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  handleTagSearchClick: (tag: string, source: 'unit_hero' | 'lesson_tile') => void;
  unitTagListRef: React.RefObject<HTMLDivElement | null>;
  unitTagMeasureRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  handleShare: () => void;
};

const UnitOverviewHero: React.FC<TUnitOverviewHeroProps> = ({
  unitTitle,
  unitSubtitle,
  unitBanner,
  unitVersionText,
  handleVersionInfoClick,
  heroUnitTags,
  tagsToDisplay,
  hiddenTagCount,
  isTagListExpanded,
  setIsTagListExpanded,
  handleTagSearchClick,
  unitTagListRef,
  unitTagMeasureRefs,
  handleShare,
}) => (
  <section id="unit-search-overview-hero" className={styles.unitHero}>
    <div className={styles.unitHeroIntro}>
      <div className={styles.unitEyebrowRow}>
        <p className={styles.unitEyebrow}>Galactic Polymath · Unit</p>
        {unitVersionText && (
          <button
            type="button"
            className={styles.unitVersionInfo}
            onClick={handleVersionInfoClick}
          >
            {unitVersionText}
          </button>
        )}
      </div>
    </div>
    <div className={styles.unitHeroGrid}>
      <div className={styles.unitHeroMedia}>
        {unitBanner ? (
          <div className={styles.unitBanner}>
            <Image
              src={unitBanner}
              alt={unitTitle ? `${unitTitle} banner` : 'Unit banner'}
              width={1400}
              height={720}
              priority
            />
          </div>
        ) : (
          <div className={styles.unitBannerFallback}>
            <p>Unit banner coming soon</p>
          </div>
        )}
      </div>
      <div className={styles.unitHeroHeader}>
        <h1 className={styles.unitTitle}>{unitTitle}</h1>
        {unitSubtitle && <p className={styles.unitSubtitle}>{unitSubtitle}</p>}
        {!!heroUnitTags.length && (
          <>
            <div id="unit-search-overview-tags" ref={unitTagListRef} className={styles.unitTagList}>
              {tagsToDisplay.map((tag, index) => (
                <button
                  key={`${tag}-${index}`}
                  type="button"
                  className={`${styles.unitTag} ${styles.unitTagButton}`}
                  title="Search for related resources"
                  aria-label={`Search for related resources: ${tag}`}
                  onClick={() => handleTagSearchClick(tag, 'unit_hero')}
                >
                  {tag}
                </button>
              ))}
              {hiddenTagCount > 0 && (
                <button
                  type="button"
                  className={`${styles.unitTag} ${styles.unitTagToggle}`}
                  aria-expanded={isTagListExpanded}
                  onClick={() => setIsTagListExpanded((current) => !current)}
                >
                  {isTagListExpanded ? 'Show fewer' : `+${hiddenTagCount} more`}
                </button>
              )}
            </div>
            <div className={styles.unitTagMeasureList} aria-hidden="true">
              {heroUnitTags.map((tag, index) => (
                <span
                  key={`measure-${tag}-${index}`}
                  className={styles.unitTag}
                  ref={(element) => {
                    unitTagMeasureRefs.current[index] = element;
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    <div className={styles.unitHeroShareRow}>
      <button className={styles.unitMainShareAction} type="button" onClick={handleShare}>
        <i className="bi bi-share" aria-hidden="true" />
        Share
      </button>
    </div>
  </section>
);

export default UnitOverviewHero;
