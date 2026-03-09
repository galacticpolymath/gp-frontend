import { CircleHelp, Hand, X } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./SiteLaunchNoticeBanner.module.css";

const SITE_LAUNCH_NOTICE_DISMISSED_KEY = "siteLaunchNoticeDismissed";

export default function SiteLaunchNoticeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed =
      window.localStorage.getItem(SITE_LAUNCH_NOTICE_DISMISSED_KEY) === "true";
    setIsVisible(!dismissed);
  }, []);

  const dismissBanner = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SITE_LAUNCH_NOTICE_DISMISSED_KEY, "true");
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside className={styles.banner} role="status" aria-live="polite">
      <div className={styles.content}>
        <Hand className={styles.icon} aria-hidden="true" />
        <p className={styles.message}>
          Hey, welcome to the brand new GP Teacher Portal! We&apos;re still
          working on it. If you find something broken, please report it with
          the <CircleHelp className={styles.inlineIcon} aria-hidden="true" />
          button in the bottom right.
        </p>
        <button
          type="button"
          className={styles.closeButton}
          onClick={dismissBanner}
          aria-label="Dismiss site notice"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
