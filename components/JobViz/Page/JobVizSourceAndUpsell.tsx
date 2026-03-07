import * as React from "react";
import styles from "./JobVizSourceAndUpsell.module.scss";

interface JobVizSourceAndUpsellProps {
  dataSourceUrl: string;
  activeNodeBlsLink?: string | null;
  showGpPlusUpsell: boolean;
}

export const JobVizSourceAndUpsell: React.FC<JobVizSourceAndUpsellProps> = ({
  dataSourceUrl,
  activeNodeBlsLink,
  showGpPlusUpsell,
}) => {
  return (
    <>
      <p className={styles.source}>
        Data source:{" "}
        <a href={dataSourceUrl} target="_blank" rel="noreferrer">
          US Bureau of Labor Statistics
        </a>
        {activeNodeBlsLink && (
          <>
            {"  "}•{" "}
            <a href={activeNodeBlsLink} target="_blank" rel="noreferrer">
              View on BLS
            </a>
          </>
        )}
      </p>
      {showGpPlusUpsell && (
        <div className={styles.upsellCard}>
          <div>
            <p className={styles.upsellEyebrow}>For Teachers</p>
            <h3>Want to connect this resource to your classroom?</h3>
            <p>
              Unlock curated JobViz+ career tours, assignment tools, and
              ready-to-use lesson integrations with a GP+ subscription.
            </p>
          </div>
          <a
            href="https://www.galacticpolymath.com/plus"
            target="_blank"
            rel="noreferrer"
            className={styles.upsellButton}
          >
            Explore GP+
          </a>
        </div>
      )}
    </>
  );
};
