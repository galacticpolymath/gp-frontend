import React from 'react';
import Image from 'next/image';
import { Blocks, Filter, Network, Target, X } from 'lucide-react';
import RichText from '../../RichText';
import styles from './StandardsTab.module.css';

type TStandardsTabProps = {
  flatStandards: any[];
  overview?: { SteamEpaulette?: string | null } | null;
  onShare: () => void;
  isStandardsFilterDockOpen: boolean;
  setIsStandardsFilterDockOpen: (isOpen: boolean) => void;
  activeFilterCount: number;
  handleResetStandardsFilters: () => void;
  standardsGradeBands: { key: string; label: string }[];
  selectedGradeBands: string[];
  availableGradeBands: Set<string>;
  handleGradeBandFilter: (gradeBand: any) => void;
  selectedSubjects: string[];
  handleSubjectToggle: (subject: string) => void;
  standardSubjects: string[];
  availableSubjects: Set<string>;
  getSubjectColor: (subject: string) => string;
  targetStandards: any[];
  targetStandardsBySubject: any[];
  connectedStandards: any[];
  connectedStandardsBySubject: any[];
  mergeStandardsByDimension: (standards: any[], setNames: string[]) => any[];
  formatGradeValue: (grades: string[]) => string;
};

const StandardsTab: React.FC<TStandardsTabProps> = ({
  flatStandards,
  overview,
  onShare,
  isStandardsFilterDockOpen,
  setIsStandardsFilterDockOpen,
  activeFilterCount,
  handleResetStandardsFilters,
  standardsGradeBands,
  selectedGradeBands,
  availableGradeBands,
  handleGradeBandFilter,
  selectedSubjects,
  handleSubjectToggle,
  standardSubjects,
  availableSubjects,
  getSubjectColor,
  targetStandards,
  targetStandardsBySubject,
  connectedStandards,
  connectedStandardsBySubject,
  mergeStandardsByDimension,
  formatGradeValue,
}) => {
  return (
    <section className={`${styles.unitSection} ${styles.unitTabFadeIn}`}>
      <div className={styles.unitOverviewCardWide}>
        {!!flatStandards.length ? (
          <div
            id="unit-search-standards-content"
            className={styles.standardsLayout}
          >
            <div className={styles.standardsIntroPanel}>
              <div className={styles.standardsIntroHeading}>
                <h2 className={styles.standardsIntroTitle}>
                  Interdisciplinary by Design
                </h2>
                <p className={styles.standardsIntroLead}>
                  We align to standards across subjects. Our units are ready for
                  STEAM or team teaching, and project based learning (PBLs)
                  with no modification!
                </p>
              </div>
              {overview?.SteamEpaulette && (
                <div className={styles.standardsEpaulette}>
                  <Image
                    src={overview.SteamEpaulette}
                    alt="STEAM standards alignment epaulette"
                    width={280}
                    height={120}
                    unoptimized
                  />
                </div>
              )}
              <p className={styles.standardsIntroCopy}>
                This figure visualizes the percentages of standards aligned to
                each subject.
              </p>
              <div className={styles.standardsShareRow}>
                <button
                  type="button"
                  className={styles.standardsShareAction}
                  onClick={onShare}
                >
                  <i className="bi bi-share" aria-hidden="true" />
                  Share
                </button>
              </div>
            </div>
            <button
              type="button"
              className={styles.mobileFilterDockTrigger}
              onClick={() => setIsStandardsFilterDockOpen(true)}
            >
              <Filter size={15} aria-hidden="true" />
              <span>Filter standards</span>
              {!isStandardsFilterDockOpen && activeFilterCount > 0 && (
                <span className={styles.mobileFilterCount}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            {isStandardsFilterDockOpen && (
              <button
                type="button"
                className={styles.mobileFilterDockBackdrop}
                aria-label="Close standards filters"
                onClick={() => setIsStandardsFilterDockOpen(false)}
              />
            )}
            <div
              className={`${styles.standardsFilters} ${
                isStandardsFilterDockOpen ? styles.standardsFiltersOpen : ''
              }`}
            >
              <div className={styles.standardsFiltersHeader}>
                <div className={styles.standardsFiltersTitle}>
                  <Filter size={15} aria-hidden="true" />
                  <span>Filter standards</span>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className={styles.standardsFiltersReset}
                    onClick={handleResetStandardsFilters}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  className={styles.standardsFiltersClose}
                  aria-label="Close standards filters"
                  onClick={() => setIsStandardsFilterDockOpen(false)}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
              <div className={styles.standardsFiltersBody}>
                <div className={styles.standardsGradeFilters}>
                  {standardsGradeBands.map((band) => {
                    const isSelected = selectedGradeBands.includes(band.key);
                    const isUnavailable =
                      band.key !== 'all' && !availableGradeBands.has(band.key);
                    return (
                      <button
                        key={band.key}
                        type="button"
                        className={
                          isSelected
                            ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonActive}`
                            : isUnavailable
                            ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonDisabled}`
                            : styles.standardsFilterButton
                        }
                        disabled={isUnavailable}
                        onClick={() => handleGradeBandFilter(band.key)}
                      >
                        {band.label}
                      </button>
                    );
                  })}
                </div>
                <div className={styles.standardsSubjectFilters}>
                  <button
                    type="button"
                    className={
                      selectedSubjects.includes('all')
                        ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonActive}`
                        : styles.standardsFilterButton
                    }
                    onClick={() => handleSubjectToggle('all')}
                  >
                    All subjects
                  </button>
                  {standardSubjects.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject);
                    const isUnavailable = !availableSubjects.has(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        className={
                          isSelected
                            ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonActive}`
                            : isUnavailable
                            ? `${styles.standardsFilterButton} ${styles.standardsFilterButtonDisabled}`
                            : styles.standardsFilterButton
                        }
                        disabled={isUnavailable}
                        onClick={() => handleSubjectToggle(subject)}
                      >
                        <span
                          className={styles.subjectColorChip}
                          style={{ backgroundColor: getSubjectColor(subject) }}
                          aria-hidden="true"
                        />
                        <span>{subject}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={styles.standardsSection}>
              <h3>
                <Target size={16} aria-hidden="true" />
                Target standards
                <span>{targetStandards.length}</span>
              </h3>
              <p className={styles.sectionIntro}>
                Skills and concepts directly taught or reinforced by this
                lesson.
              </p>
              {targetStandardsBySubject.length ? (
                <div className={styles.standardsList}>
                  {targetStandardsBySubject.map((subjectGroup) => {
                    const mergedByDimension = mergeStandardsByDimension(
                      subjectGroup.standards,
                      subjectGroup.sets
                    );

                    return (
                      <section
                        key={`target-${subjectGroup.subject}`}
                        className={styles.standardSubjectGroup}
                        style={
                          {
                            '--subject-color': getSubjectColor(
                              subjectGroup.subject
                            ),
                          } as React.CSSProperties
                        }
                      >
                        <header className={styles.standardSubjectHeader}>
                          <div className={styles.subjectHeadingWrap}>
                            <span
                              className={styles.subjectColorChip}
                              style={{
                                backgroundColor: getSubjectColor(
                                  subjectGroup.subject
                                ),
                              }}
                              aria-hidden="true"
                            />
                            <h4>{subjectGroup.subject}</h4>
                            {subjectGroup.sets.map((setName: string) => (
                              <span key={setName} className={styles.standardSetPill}>
                                {setName}
                              </span>
                            ))}
                          </div>
                        </header>
                        <div className={styles.standardRows}>
                          {mergedByDimension.map((standard) => (
                            <article key={standard.id} className={styles.standardRow}>
                              <div className={styles.standardMetaRow}>
                                <p className={styles.standardDimensionText}>
                                  <Blocks size={14} aria-hidden="true" />
                                  <span>{standard.dimensionName}</span>
                                </p>
                                <p className={styles.standardGradeText}>
                                  <i
                                    className="bi bi-mortarboard-fill"
                                    aria-hidden="true"
                                  />
                                  <span>{formatGradeValue(standard.grades)}</span>
                                </p>
                              </div>
                              <div className={styles.standardStatementWrap}>
                                {standard.lines.map((line: any, idx: number) => (
                                  <div
                                    key={`${standard.id}-line-${idx}`}
                                    className={styles.standardStatementBlock}
                                  >
                                    <p className={styles.standardStatementLine}>
                                      <span className={styles.standardCode}>
                                        {line.code}:
                                      </span>{' '}
                                      <span>{line.statement}</span>
                                    </p>
                                    {!!line.alignmentNote && (
                                      <div className={styles.standardAlignmentNotes}>
                                        <RichText content={line.alignmentNote} />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.unitMutedText}>
                  No target standards match these filters.
                </p>
              )}
            </div>
            <div className={styles.standardsSection}>
              <h3>
                <Network size={16} aria-hidden="true" />
                Connected standards
                <span>{connectedStandards.length}</span>
              </h3>
              <p className={styles.sectionIntro}>
                Skills and concepts reviewed or hinted at in this lesson (for
                building upon).
              </p>
              {connectedStandardsBySubject.length ? (
                <div className={styles.standardsList}>
                  {connectedStandardsBySubject.map((subjectGroup) => {
                    const mergedByDimension = mergeStandardsByDimension(
                      subjectGroup.standards,
                      subjectGroup.sets
                    );

                    return (
                      <section
                        key={`connected-${subjectGroup.subject}`}
                        className={styles.standardSubjectGroup}
                        style={
                          {
                            '--subject-color': getSubjectColor(
                              subjectGroup.subject
                            ),
                          } as React.CSSProperties
                        }
                      >
                        <header className={styles.standardSubjectHeader}>
                          <div className={styles.subjectHeadingWrap}>
                            <span
                              className={styles.subjectColorChip}
                              style={{
                                backgroundColor: getSubjectColor(
                                  subjectGroup.subject
                                ),
                              }}
                              aria-hidden="true"
                            />
                            <h4>{subjectGroup.subject}</h4>
                            {subjectGroup.sets.map((setName: string) => (
                              <span key={setName} className={styles.standardSetPill}>
                                {setName}
                              </span>
                            ))}
                          </div>
                        </header>
                        <div className={styles.standardRows}>
                          {mergedByDimension.map((standard) => (
                            <article key={standard.id} className={styles.standardRow}>
                              <div className={styles.standardMetaRow}>
                                <p className={styles.standardDimensionText}>
                                  <Blocks size={14} aria-hidden="true" />
                                  <span>{standard.dimensionName}</span>
                                </p>
                                <p className={styles.standardGradeText}>
                                  <i
                                    className="bi bi-mortarboard-fill"
                                    aria-hidden="true"
                                  />
                                  <span>{formatGradeValue(standard.grades)}</span>
                                </p>
                              </div>
                              <div className={styles.standardStatementWrap}>
                                {standard.lines.map((line: any, idx: number) => (
                                  <div
                                    key={`${standard.id}-line-${idx}`}
                                    className={styles.standardStatementBlock}
                                  >
                                    <p className={styles.standardStatementLine}>
                                      <span className={styles.standardCode}>
                                        {line.code}:
                                      </span>{' '}
                                      <span>{line.statement}</span>
                                    </p>
                                    {!!line.alignmentNote && (
                                      <div className={styles.standardAlignmentNotes}>
                                        <RichText content={line.alignmentNote} />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.unitMutedText}>
                  No connected standards match these filters.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.standardsIntroPanel}>
            <div className={styles.standardsIntroHeading}>
              <h2 className={styles.standardsIntroTitle}>
                Interdisciplinary by Design
              </h2>
              <p className={styles.standardsIntroLead}>
                We align to standards across subjects. Our units are ready for
                STEAM or team teaching, and project based learning (PBLs) with
                no modification!
              </p>
            </div>
            <p className={styles.unitMutedText}>
              Standards will appear here once aligned.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StandardsTab;
