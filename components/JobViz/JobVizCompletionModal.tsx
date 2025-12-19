import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import styles from "../../styles/jobvizBurst.module.scss";
import { useModalContext } from "../../providers/ModalProvider";
import { LucideIcon } from "./LucideIcon";
import confetti from "canvas-confetti";

const TYPEWRITER_MESSAGE = [
  "Thanks for taking the time to tour these careers.",
  "Even if you know what your dream job is, it's good to know what else is out there!",
  "We can always expand our understanding of how the world and the economy work.",
];
const TYPEWRITER_INTERVAL = 35;
const PROGRESS_DURATION = 1500;

const JobVizCompletionModal: React.FC = () => {
  const { _jobvizCompletionModal } = useModalContext();
  const [state, setState] = _jobvizCompletionModal;
  const [progressComplete, setProgressComplete] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);
  const [ctaVisible, setCtaVisible] = useState(false);
  const confettiInstanceRef = useRef<ReturnType<typeof confetti.create> | null>(null);
  const confettiTimeoutsRef = useRef<number[]>([]);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressAreaRef = useRef<HTMLDivElement | null>(null);
  const hasLaunchedConfettiRef = useRef(false);

  const isOpen = state.isDisplayed;
  const paragraphs = useMemo(() => TYPEWRITER_MESSAGE, []);
  const { meta: paragraphMeta, totalLength: fullMessageLength } = useMemo(() => {
    let offset = 0;
    const meta = paragraphs.map((text, index) => {
      const start = offset;
      const end = start + text.length;
      offset = end;
      if (index < paragraphs.length - 1) {
        offset += 2;
      }
      return { text, start, end };
    });
    return { meta, totalLength: offset };
  }, [paragraphs]);

  const clearConfettiAnimation = useCallback(() => {
    confettiTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    confettiTimeoutsRef.current = [];
    if (confettiCanvasRef.current) {
      confettiCanvasRef.current.remove();
      confettiCanvasRef.current = null;
    }
    confettiInstanceRef.current = null;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setProgressComplete(false);
      setVisibleChars(0);
      setCtaVisible(false);
      hasLaunchedConfettiRef.current = false;
      clearConfettiAnimation();
      return;
    }
    hasLaunchedConfettiRef.current = false;
    setVisibleChars(0);
    setCtaVisible(false);
    setProgressComplete(false);
    const progressTimer = setTimeout(() => {
      setProgressComplete(true);
    }, PROGRESS_DURATION);
    return () => {
      clearTimeout(progressTimer);
    };
  }, [clearConfettiAnimation, isOpen]);

  useEffect(() => {
    if (!progressComplete) return;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVisibleChars(current);
      if (current >= fullMessageLength) {
        clearInterval(interval);
        setTimeout(() => setCtaVisible(true), 300);
      }
    }, TYPEWRITER_INTERVAL);
    return () => clearInterval(interval);
  }, [progressComplete, fullMessageLength]);

  useEffect(() => {
    return () => {
      clearConfettiAnimation();
    };
  }, [clearConfettiAnimation]);

  const getConfettiInstance = useCallback(() => {
    if (typeof document === "undefined") return null;
    if (!confettiCanvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.position = "fixed";
      canvas.style.inset = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "12000150";
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      document.body.appendChild(canvas);
      confettiCanvasRef.current = canvas;
    }
    if (!confettiInstanceRef.current && confettiCanvasRef.current) {
      confettiInstanceRef.current = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: false,
      });
    }
    return confettiInstanceRef.current;
  }, []);

  const launchConfetti = useCallback(() => {
    if (typeof window === "undefined") return;
    clearConfettiAnimation();

    const instance = getConfettiInstance();
    if (!instance) return;

    const defaults = {
      startVelocity: 62,
      gravity: 0.9,
      ticks: 160,
      spread: 120,
      zIndex: 12000100,
      colors: ["#FFD369", "#FF5AB5", "#7B5BFF", "#6EC8FF", "#A3FFE9"],
      disableForReducedMotion: false,
    };

    const scheduleTimeout = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(callback, delay);
      confettiTimeoutsRef.current.push(timeoutId);
    };

    const progressRect = progressAreaRef.current?.getBoundingClientRect();
    const computeOrigin = (offsetRatio = 0) => {
      if (!progressRect || typeof window === "undefined") {
        return { x: 0.5, y: 0.3 };
      }
      const centerX = progressRect.left + progressRect.width / 2;
      const offsetX = progressRect.width * offsetRatio;
      return {
        x: Math.min(0.98, Math.max(0.02, (centerX + offsetX) / window.innerWidth)),
        y: Math.min(0.98, Math.max(0.02, (progressRect.top + progressRect.height / 2) / window.innerHeight)),
      };
    };

    const burst = (
      originOffset: number,
      options: Partial<Parameters<typeof instance>[0]> = {}
    ) => {
      instance({
        ...defaults,
        origin: computeOrigin(originOffset),
        particleCount: 200,
        spread: 110,
        scalar: 1,
        ...options,
      });
    };

    burst(-0.3, { particleCount: 180, spread: 100 });
    burst(0.3, { particleCount: 180, spread: 100 });
    scheduleTimeout(() => burst(0, { particleCount: 260, spread: 150, scalar: 1.1 }), 140);
    scheduleTimeout(() => {
      burst(-0.2, { particleCount: 120, spread: 130, scalar: 0.9 });
      burst(0.2, { particleCount: 120, spread: 130, scalar: 0.9 });
    }, 260);
    scheduleTimeout(
      () => burst(0, { particleCount: 90, spread: 160, scalar: 0.85, startVelocity: 38 }),
      520
    );
    scheduleTimeout(() => {
      clearConfettiAnimation();
    }, 2500);
  }, [clearConfettiAnimation, getConfettiInstance]);

  useEffect(() => {
    if (!progressComplete || hasLaunchedConfettiRef.current) return;
    hasLaunchedConfettiRef.current = true;
    launchConfetti();
  }, [progressComplete, launchConfetti]);

  const closeModal = () => {
    setState((prev) => ({ ...prev, isDisplayed: false }));
  };

  const handleShare = () => {
    const shareFn = state.onShare;
    closeModal();
    if (shareFn) {
      shareFn();
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      dialogClassName={styles.completionModalDialog}
      contentClassName={styles.completionModalContent}
      backdropClassName={styles.completionModalBackdrop}
      className={styles.completionModalRoot}
      fullscreen="md-down"
      style={{ zIndex: 15000000 }}
    >
      <Modal.Body className={styles.completionModalBody}>
        <div className={styles.completionHeader}>
          <div>
            <p className={styles.summaryModalKicker}>Galactic Polymath | JobViz+</p>
            <h3 className={styles.completionTitle}>Assignment Progress</h3>
          </div>
          <button
            type="button"
            className={styles.summaryModalCloseIcon}
            onClick={closeModal}
            aria-label="Dismiss celebration"
          >
            <LucideIcon name="X" />
          </button>
        </div>
        <div className={styles.completionProgressShell} ref={progressAreaRef}>
          <div
            className={styles.completionProgressBar}
            data-complete={progressComplete ? "true" : "false"}
          />
        </div>
        <p
          className={styles.completionStatus}
          data-complete={progressComplete ? "true" : "false"}
        >
          {progressComplete ? "RATINGS COMPLETE!" : "Finishing ratings..."}
        </p>
        <div className={styles.completionMessage} aria-live="polite">
          {paragraphMeta.map(({ text, start, end }, index) => {
            const visibleCount = Math.max(
              0,
              Math.min(visibleChars - start, text.length)
            );
            const slice = text.slice(0, visibleCount);
            const shouldShowCursor =
              visibleChars >= start &&
              visibleChars < end &&
              visibleChars < fullMessageLength;
            return (
              <p key={`${text}-${index}`} className={styles.completionParagraph}>
                {slice}
                {shouldShowCursor && (
                  <span className={styles.typeCursor} aria-hidden="true">
                    |
                  </span>
                )}
              </p>
            );
          })}
        </div>
        <div className={styles.completionCtaWrap}>
          <button
            type="button"
            className={styles.completionCtaButton}
            disabled={!ctaVisible}
            onClick={handleShare}
          >
            <LucideIcon name="Sparkles" /> Summarize &amp; Share Assignment
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default JobVizCompletionModal;
