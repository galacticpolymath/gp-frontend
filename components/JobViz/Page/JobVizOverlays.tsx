import * as React from "react";
import Link from "next/link";
import styles from "./JobVizOverlays.module.scss";

interface JobVizOverlaysProps {
  showSavedJobsUpsell: boolean;
  showJobvizWelcome: boolean;
  showTourWelcome: boolean;
  onOpenLogin: () => void;
  onCloseSavedJobsUpsell: () => void;
  onDismissWelcomeForever: () => void;
  onDismissWelcomeOnce: () => void;
  onDismissTourWelcomeForever: () => void;
  onDismissTourWelcomeOnce: () => void;
}

export const JobVizOverlays: React.FC<JobVizOverlaysProps> = ({
  showSavedJobsUpsell,
  showJobvizWelcome,
  showTourWelcome,
  onOpenLogin,
  onCloseSavedJobsUpsell,
  onDismissWelcomeForever,
  onDismissWelcomeOnce,
  onDismissTourWelcomeForever,
  onDismissTourWelcomeOnce,
}) => {
  return (
    <>
      {showSavedJobsUpsell && (
        <div className={styles.introOverlay} role="presentation">
          <div className={styles.introDialog} role="dialog" aria-modal="true">
            <h3>Save jobs for later</h3>
            <p>Create a free account to save jobs for later.</p>
            <div className={`${styles.introActions} ${styles.savedJobsActions}`}>
              <div className={styles.savedJobsPrimaryActions}>
                <button
                  type="button"
                  className={styles.introLogin}
                  onClick={onOpenLogin}
                >
                  Login
                </button>
                <Link
                  href="/plus"
                  className={styles.introContinue}
                  onClick={onCloseSavedJobsUpsell}
                >
                  Create free account
                </Link>
              </div>
              <button
                type="button"
                className={styles.introNotNow}
                onClick={onCloseSavedJobsUpsell}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {(showJobvizWelcome || showTourWelcome) && (
        <div className={styles.introOverlay} role="presentation">
          {showJobvizWelcome && (
            <div className={styles.introDialog} role="dialog" aria-modal="true">
              <h3>Welcome to JobViz</h3>
              <p>
                JobViz helps students explore real careers using wage, growth, and
                education data from the U.S. Bureau of Labor Statistics.
              </p>
              <div className={styles.introActions}>
                <button
                  type="button"
                  className={styles.introDismiss}
                  onClick={onDismissWelcomeForever}
                >
                  Don&apos;t show again
                </button>
                <button
                  type="button"
                  className={styles.introContinue}
                  onClick={onDismissWelcomeOnce}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          {showTourWelcome && (
            <div className={styles.introDialog} role="dialog" aria-modal="true">
              <h3>Tour preview</h3>
              <p>
                Explore this tour in student view. Teachers with GP+ can assign
                full tours and build their own versions.
              </p>
              <div className={styles.introActions}>
                <button
                  type="button"
                  className={styles.introDismiss}
                  onClick={onDismissTourWelcomeForever}
                >
                  Don&apos;t show again
                </button>
                <button
                  type="button"
                  className={styles.introContinue}
                  onClick={onDismissTourWelcomeOnce}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
