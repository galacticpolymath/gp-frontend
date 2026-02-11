import { useEffect, useState } from 'react';
import styles from './CookieConsentBanner.module.css';

export const COOKIE_CONSENT_STORAGE_KEY = 'gp_cookie_consent_v1';

type TConsentStatus = 'granted' | 'denied' | null;

type TCookieConsentBannerProps = {
  consentStatus: TConsentStatus;
  onDecision: (next: Exclude<TConsentStatus, null>) => void;
};

const CookieConsentBanner: React.FC<TCookieConsentBannerProps> = ({
  consentStatus,
  onDecision,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (consentStatus) {
      setIsDismissed(true);
      return;
    }
    setIsDismissed(false);
  }, [consentStatus]);

  if (isDismissed || consentStatus) {
    return null;
  }

  return (
    <aside className={styles.banner} aria-live="polite">
      <p className={styles.copy}>
        We use essential cookies and optional privacy-safe analytics to improve
        lesson pages. No ad personalization or data selling.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={() => onDecision('granted')}
        >
          Allow analytics
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => onDecision('denied')}
        >
          Essential only
        </button>
      </div>
    </aside>
  );
};

export default CookieConsentBanner;
