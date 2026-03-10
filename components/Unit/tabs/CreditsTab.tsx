import React from 'react';
import { IAuthor } from '../../../backend/models/Unit/Authors';
import RichText from '../../RichText';
import styles from './CreditsTab.module.css';

type TCreditsTabProps = {
  hasCreditsTabContent: boolean;
  authorsEntries: IAuthor[];
  creditsContent: string;
  acknowledgmentsEntries: any[];
  versionNotesAnchorRef: React.RefObject<HTMLDivElement | null>;
  versionReleases: any[];
};

const formatAuthorName = (author: IAuthor) =>
  [author.First, author.Middle, author.Last]
    .filter((part): part is string => typeof part === 'string' && !!part.trim())
    .join(' ')
    .trim();

const CreditsTab: React.FC<TCreditsTabProps> = ({
  hasCreditsTabContent,
  authorsEntries,
  creditsContent,
  acknowledgmentsEntries,
  versionNotesAnchorRef,
  versionReleases,
}) => {
  const hasStructuredAuthors = authorsEntries.length > 0;

  return (
    <section className={`${styles.unitSection} ${styles.unitTabFadeIn}`}>
      <div className={styles.unitOverviewCardWide}>
        {hasCreditsTabContent ? (
          <div className={styles.creditsLayout}>
            {(hasStructuredAuthors || !!creditsContent) && (
              <section className={styles.creditsPanel}>
                <h3>Authors</h3>
                {hasStructuredAuthors ? (
                  <div className={styles.authorsList}>
                    {authorsEntries.map((author, index) => {
                      const name = formatAuthorName(author);
                      const contribution = author.Contribution?.trim() ?? '';
                      const title = author.Title?.trim() ?? '';
                      const affiliation = author.Affiliation?.trim() ?? '';
                      const location = author.Location?.trim() ?? '';
                      const email = author.Email?.trim() ?? '';
                      const link = author.Link?.trim() ?? '';
                      const metaLine = [title, affiliation].filter(Boolean).join(' · ');

                      if (!name && !contribution && !metaLine && !location && !email && !link) {
                        return null;
                      }

                      return (
                        <article
                          key={`${name || author.GPID || 'author'}-${index}`}
                          className={styles.authorCard}
                        >
                          <div className={styles.authorHeader}>
                            <div>
                              <h4>{name || 'Unnamed contributor'}</h4>
                              {contribution ? (
                                <p className={styles.authorContribution}>{contribution}</p>
                              ) : null}
                            </div>
                            {link ? (
                              <a href={link} target="_blank" rel="noreferrer" className={styles.authorLink}>
                                View profile
                              </a>
                            ) : null}
                          </div>
                          {metaLine ? <p className={styles.authorMeta}>{metaLine}</p> : null}
                          {location ? <p className={styles.authorMeta}>{location}</p> : null}
                          {email ? (
                            <a href={`mailto:${email}`} className={styles.authorEmail}>
                              {email}
                            </a>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.richTextBlock}>
                    <RichText content={creditsContent} />
                  </div>
                )}
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
                              const url = record?.url?.trim?.() ?? '';
                              const title = record?.title?.trim?.() ?? '';
                              const affiliation =
                                record?.affiliation?.trim?.() ?? '';
                              const location = record?.location?.trim?.() ?? '';

                              if (!name && !url && !title && !affiliation && !location) {
                                return null;
                              }

                              const linkedName =
                                name && url ? `[${name}](${url})` : name;
                              const recordMarkdown = `${linkedName}${
                                title ? `${linkedName ? ' · ' : ''}${title}` : ''
                              }${
                                affiliation
                                  ? `${linkedName || title ? ', ' : ''}${affiliation}`
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
            Authors, acknowledgments, and version notes will appear here.
          </p>
        )}
      </div>
    </section>
  );
};

export default CreditsTab;
