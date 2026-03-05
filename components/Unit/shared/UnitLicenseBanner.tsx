import React from 'react';
import Image from 'next/image';
import { ChevronUp, Copy } from 'lucide-react';
import styles from './UnitLicenseBanner.module.css';

type TAttributionDisplay = {
  titleByAuthors: string;
  sourceLabel: string;
  sourceHref: string;
  licenseLabel: string;
  licenseHref: string;
};

type TUnitLicenseBannerProps = {
  isStandalonePreview: boolean;
  attributionDisplayParts: TAttributionDisplay;
  copiedEntry: 'attribution' | 'citation' | null;
  copyErrorEntry: 'attribution' | 'citation' | null;
  handleCopyCitation: (
    text: string,
    entryType: 'attribution' | 'citation'
  ) => void;
  attributionText: string;
  vancouverCitation: string;
};

const UnitLicenseBanner: React.FC<TUnitLicenseBannerProps> = ({
  isStandalonePreview,
  attributionDisplayParts,
  copiedEntry,
  copyErrorEntry,
  handleCopyCitation,
  attributionText,
  vancouverCitation,
}) => {
  return (
    <aside className={styles.licenseBanner} aria-label="Creative Commons license notice">
      <div className={styles.licenseBannerInner}>
        <div className={styles.licenseTopRow}>
          <Image
            src="/imgs/creative-commons_by-nc-sa.svg"
            alt=""
            aria-hidden="true"
            width={126}
            height={44}
          />
          <div className={styles.licenseMeta}>
            <p className={styles.licenseBannerText}>
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noreferrer"
                className={styles.licenseBannerLink}
              >
                CC BY-NC-SA 4.0
              </a>
              . Share + Remix, with attribution. Don&apos;t sell.
            </p>
            {isStandalonePreview ? (
              <p className={styles.citationText}>
                {attributionDisplayParts.titleByAuthors} Source:{' '}
                <a
                  href={attributionDisplayParts.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.citationInlineLink}
                >
                  {attributionDisplayParts.sourceLabel}
                </a>
                . License:{' '}
                <a
                  href={attributionDisplayParts.licenseHref}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.citationInlineLink}
                >
                  Creative Commons Attribution-NonCommercial-ShareAlike 4.0
                  International (CC BY-NC-SA 4.0)
                </a>
                .
              </p>
            ) : (
              <details className={styles.citationAccordion}>
                <summary className={styles.citationAccordionSummary}>
                  <span>How to cite and attribute</span>
                  <ChevronUp
                    size={14}
                    aria-hidden="true"
                    className={styles.citationAccordionChevron}
                  />
                </summary>
                <div className={styles.citationBlock}>
                  <div className={styles.citationEntry}>
                    <p className={styles.citationLabel}>Give Attribution</p>
                    <p className={styles.citationText}>
                      {attributionDisplayParts.titleByAuthors} Source:{' '}
                      <a
                        href={attributionDisplayParts.sourceHref}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.citationInlineLink}
                      >
                        {attributionDisplayParts.sourceLabel}
                      </a>
                      . License:{' '}
                      <a
                        href={attributionDisplayParts.licenseHref}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.citationInlineLink}
                      >
                        {attributionDisplayParts.licenseLabel}
                      </a>
                      .
                    </p>
                    <div className={styles.citationEntryFooter}>
                      {copiedEntry === 'attribution' && (
                        <span className={styles.citationStatus}>Copied</span>
                      )}
                      {copyErrorEntry === 'attribution' && (
                        <span className={styles.citationStatusError}>Unable to copy</span>
                      )}
                      <button
                        type="button"
                        className={styles.copyCitationButton}
                        onClick={() => handleCopyCitation(attributionText, 'attribution')}
                        aria-label="Copy attribution"
                        title="Copy attribution"
                      >
                        <Copy size={13} aria-hidden="true" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  <div className={styles.citationEntry}>
                    <p className={styles.citationLabel}>Cite this Work</p>
                    <p className={styles.citationText}>{vancouverCitation}</p>
                    <div className={styles.citationEntryFooter}>
                      {copiedEntry === 'citation' && (
                        <span className={styles.citationStatus}>Copied</span>
                      )}
                      {copyErrorEntry === 'citation' && (
                        <span className={styles.citationStatusError}>Unable to copy</span>
                      )}
                      <button
                        type="button"
                        className={styles.copyCitationButton}
                        onClick={() => handleCopyCitation(vancouverCitation, 'citation')}
                        aria-label="Copy citation"
                        title="Copy citation"
                      >
                        <Copy size={13} aria-hidden="true" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default UnitLicenseBanner;
