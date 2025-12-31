import * as React from "react";

interface Options {
  rated: number;
  total: number;
  delayMs: number;
  animationDurationMs: number;
  onAnimationComplete?: () => void;
}

interface Result {
  displayedRated: number;
  isAnimating: boolean;
}

const clampProgress = (value: number, total: number) => {
  if (!Number.isFinite(total) || total <= 0) {
    return 0;
  }
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.min(value, total);
};

export const useDelayedProgressAnimation = ({
  rated,
  total,
  delayMs,
  animationDurationMs,
  onAnimationComplete,
}: Options): Result => {
  const clampedRated = clampProgress(rated, total);
  const [displayedRated, setDisplayedRated] = React.useState(clampedRated);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const delayTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationTimeoutRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedRef = React.useRef(false);

  const clearDelayTimeout = () => {
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  };

  const clearAnimationTimeout = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      clearDelayTimeout();
      clearAnimationTimeout();
    };
  }, []);

  React.useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setDisplayedRated(clampedRated);
      return;
    }
    clearDelayTimeout();
    clearAnimationTimeout();
    setIsAnimating(false);
    delayTimeoutRef.current = setTimeout(() => {
      setDisplayedRated(clampedRated);
      setIsAnimating(true);
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        animationTimeoutRef.current = null;
        onAnimationComplete?.();
      }, animationDurationMs);
      delayTimeoutRef.current = null;
    }, delayMs);
  }, [clampedRated, delayMs, animationDurationMs, onAnimationComplete]);

  return { displayedRated, isAnimating };
};
