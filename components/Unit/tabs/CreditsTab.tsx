import React from 'react';
import RichText from '../../RichText';
import styles from '../UnitPage.module.css';

type TCreditsTabProps = {
  hasCreditsTabContent: boolean;
  creditsContent: string;
  acknowledgmentsEntries: any[];
  versionNotesAnchorRef: React.RefObject<HTMLDivElement | null>;
  versionReleases: any[];
};

const CreditsTab: React.FC<TCreditsTabProps> = ({
  hasCreditsTabContent,
  creditsContent,
  acknowledgmentsEntries,
  versionNotesAnchorRef,
  versionReleases,
}) => {
  return (
    <section className={`${styles.unitSection} ${styles.unitTabFadeIn}`}>
      <h2 className={styles.sectionTitle}>Credits, Acknowledgments, and Versions</h2>
      <p className={styles.sectionIntro}>
        This unit was made possible by hundreds of hours of work by tons of
        people. Thank you!
      </p>
      <div
        id="unit-search-credits-content"
        className={styles.unitOverviewCardWide}
      >
        {hasCreditsTabContent ? (
          <div className={styles.creditsLayout}>
            {!!creditsContent && (
              <section className={styles.creditsPanel}>
                <h3>Credits</h3>
                <div className={styles.richTextBlock}>
                  <RichText content={creditsContent} />
                </div>
              </section>
            )}
            {!!acknowledgmentsEntries.length && (
              <section className={styles.creditsPanel}>
                <h3>Acknowledgments</h3>
                <div className={styles.acknowledgmentsList}>
                  {acknowledgmentsEntries.map((entry: any, index: number) => (
                    <article
                      key={`${entry.role}-${index}`}
                      className={styles.acknowledgmentEntry}
                    >
                      <h4>{entry.role}</h4>
                      {entry.def && (
                        <div className={styles.richTextBlock}>
                          <RichText content={entry.def} />
                        </div>
                      )}
                      {entry.records?.length ? (
                        <ul>
                          {entry.records
                            .map((record: any, idx: number) => {
                              const name = record?.name?.trim?.() ?? '';
                              const title = record?.title?.trim?.() ?? '';
                              const affiliation =
                                record?.affiliation?.trim?.() ?? '';
                              const location = record?.location?.trim?.() ?? '';

                              if (!name && !title && !affiliation && !location) {
                                return null;
                              }

                              const recordMarkdown = `${name}${
                                title ? `${name ? ' · ' : ''}${title}` : ''
                              }${
                                affiliation
                                  ? `${name || title ? ', ' : ''}${affiliation}`
                                  : ''
                              }${location ? ` (${location})` : ''}`;

                              return (
                                <li key={`${name || 'record'}-${idx}`}>
                                  <div className={styles.richTextBlock}>
                                    <RichText content={recordMarkdown} />
                                  </div>
                                </li>
                              );
                            })
                            .filter(Boolean)}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            )}
            <section
              ref={versionNotesAnchorRef}
              id="major-release-updates"
              className={styles.creditsPanel}
            >
              <h3>Versions</h3>
              {versionReleases.length ? (
                <div className={styles.versionNotes}>
                  {versionReleases.map((release: any, index: number) => (
                    <article
                      key={`${release.major_release}-${index}`}
                      className={styles.versionEntry}
                    >
                      <h4>{release.major_release}</h4>
                      {release.sub_releases?.length ? (
                        <ul>
                          {release.sub_releases.map((sub: any, idx: number) => (
                            <li key={`${sub.version}-${idx}`}>
                              <p className={styles.versionMeta}>
                                {sub.version ?? 'Unlabeled version'}
                                {sub.date ? ` · ${sub.date}` : ''}
                              </p>
                              {sub.summary ? (
                                <div className={styles.richTextBlock}>
                                  <RichText content={sub.summary} />
                                </div>
                              ) : null}
                              {sub.notes ? (
                                <div className={styles.richTextBlock}>
                                  <RichText content={sub.notes} />
                                </div>
                              ) : null}
                              {sub.acknowledgments ? (
                                <div className={styles.richTextBlock}>
                                  <RichText content={sub.acknowledgments} />
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.unitMutedText}>
                          Version details will appear here.
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className={styles.unitMutedText}>
                  Version notes will appear here.
                </p>
              )}
            </section>
          </div>
        ) : (
          <p className={styles.unitMutedText}>
            Credits, acknowledgments, and version notes will appear here.
          </p>
        )}
      </div>
    </section>
  );
};

export default CreditsTab;
