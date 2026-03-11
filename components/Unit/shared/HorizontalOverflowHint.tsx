import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HorizontalOverflowHint.module.css';

type THorizontalOverflowHintProps = {
  className?: string;
  scrollerClassName?: string;
  children: React.ReactNode;
  prevLabel?: string;
  nextLabel?: string;
  scrollStepRatio?: number;
  minScrollStep?: number;
};

const EDGE_THRESHOLD_PX = 2;

const HorizontalOverflowHint: React.FC<THorizontalOverflowHintProps> = ({
  className,
  scrollerClassName,
  children,
  prevLabel = 'Show previous tabs',
  nextLabel = 'Show more tabs',
  scrollStepRatio = 0.65,
  minScrollStep = 120,
}) => {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateOverflowState = React.useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, clientWidth, scrollWidth } = scroller;
    const overflowPx = scrollWidth - clientWidth;

    if (overflowPx <= EDGE_THRESHOLD_PX) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(scrollLeft > EDGE_THRESHOLD_PX);
    setCanScrollRight(scrollLeft < overflowPx - EDGE_THRESHOLD_PX);
  }, []);

  React.useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    updateOverflowState();

    scroller.addEventListener('scroll', updateOverflowState, { passive: true });
    window.addEventListener('resize', updateOverflowState);

    const resizeObserver = new ResizeObserver(updateOverflowState);
    resizeObserver.observe(scroller);

    const mutationObserver = new MutationObserver(updateOverflowState);
    mutationObserver.observe(scroller, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      scroller.removeEventListener('scroll', updateOverflowState);
      window.removeEventListener('resize', updateOverflowState);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateOverflowState]);

  const scrollByStep = React.useCallback(
    (direction: -1 | 1) => {
      const scroller = scrollerRef.current;

      if (!scroller) {
        return;
      }

      const step = Math.max(Math.round(scroller.clientWidth * scrollStepRatio), minScrollStep);

      scroller.scrollBy({
        left: direction * step,
        behavior: 'smooth',
      });
    },
    [minScrollStep, scrollStepRatio]
  );

  return (
    <div className={`${styles.overflowHint} ${className ?? ''}`}>
      <div ref={scrollerRef} className={scrollerClassName}>
        {children}
      </div>
      {canScrollLeft && (
        <button
          type="button"
          className={`${styles.arrowButton} ${styles.arrowButtonLeft}`}
          aria-label={prevLabel}
          title={prevLabel}
          onClick={() => scrollByStep(-1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          className={`${styles.arrowButton} ${styles.arrowButtonRight}`}
          aria-label={nextLabel}
          title={nextLabel}
          onClick={() => scrollByStep(1)}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default HorizontalOverflowHint;
