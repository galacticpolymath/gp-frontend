import * as React from "react";

export interface RectLike {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

interface UseAssignmentDockViewportOptions {
  enabled: boolean;
}

interface UseAssignmentDockViewportResult {
  registerScrollNode: (node: HTMLDivElement | null) => void;
  registerFooterNode: (node: HTMLDivElement | null) => void;
  contentRect: RectLike | null;
  footerRect: RectLike | null;
  windowSize: WindowSize;
  subscribeToScroll: (listener: () => void) => () => void;
}

const DEFAULT_WINDOW_SIZE: WindowSize = { width: 0, height: 0 };

const rectEquals = (a: RectLike | null, b: RectLike | null) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.width === b.width &&
    a.height === b.height
  );
};

export const toRectLike = (rect: DOMRectReadOnly): RectLike => ({
  top: rect.top,
  bottom: rect.bottom,
  left: rect.left,
  right: rect.right,
  width: rect.width,
  height: rect.height,
});

export const useAssignmentDockViewport = (
  options: UseAssignmentDockViewportOptions
): UseAssignmentDockViewportResult => {
  const { enabled } = options;
  const [scrollNode, setScrollNode] = React.useState<HTMLDivElement | null>(null);
  const [footerNode, setFooterNode] = React.useState<HTMLDivElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const footerRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const [contentRect, setContentRect] = React.useState<RectLike | null>(null);
  const [footerRect, setFooterRect] = React.useState<RectLike | null>(null);
  const [windowSize, setWindowSize] =
    React.useState<WindowSize>(DEFAULT_WINDOW_SIZE);
  const scrollListenersRef = React.useRef(new Set<() => void>());

  const notifyScrollListeners = React.useCallback(() => {
    scrollListenersRef.current.forEach((listener) => {
      try {
        listener();
      } catch {
        // ignore listener failures
      }
    });
  }, []);

  const subscribeToScroll = React.useCallback(
    (listener: () => void) => {
      scrollListenersRef.current.add(listener);
      return () => {
        scrollListenersRef.current.delete(listener);
      };
    },
    []
  );

  const measure = React.useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const node = scrollRef.current;
    if (node) {
      const rect = toRectLike(node.getBoundingClientRect());
      setContentRect((prev) => (rectEquals(prev, rect) ? prev : rect));
    } else {
      setContentRect(null);
    }

    const footer = footerRef.current;
    if (footer) {
      const rect = toRectLike(footer.getBoundingClientRect());
      setFooterRect((prev) => (rectEquals(prev, rect) ? prev : rect));
    } else {
      setFooterRect(null);
    }

    setWindowSize((prev) => {
      if (
        prev.width === window.innerWidth &&
        prev.height === window.innerHeight
      ) {
        return prev;
      }
      return { width: window.innerWidth, height: window.innerHeight };
    });
  }, []);

  const scheduleMeasure = React.useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      measure();
    });
  }, [enabled, measure]);

  React.useEffect(() => {
    if (!enabled && rafRef.current !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [enabled]);

  React.useEffect(() => {
    scrollRef.current = scrollNode;
    if (!enabled) return;
    scheduleMeasure();
  }, [enabled, scheduleMeasure, scrollNode]);

  React.useEffect(() => {
    footerRef.current = footerNode;
    if (!enabled) return;
    scheduleMeasure();
  }, [enabled, footerNode, scheduleMeasure]);

  React.useEffect(() => {
    if (!enabled || !scrollNode) return undefined;
    const handleScroll = () => {
      notifyScrollListeners();
    };
    scrollNode.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollNode.removeEventListener("scroll", handleScroll);
    };
  }, [enabled, notifyScrollListeners, scrollNode]);

  React.useEffect(() => {
    if (!enabled || typeof ResizeObserver === "undefined") return undefined;
    if (!scrollNode && !footerNode) return undefined;
    const observer = new ResizeObserver(() => scheduleMeasure());
    if (scrollNode) observer.observe(scrollNode);
    if (footerNode) observer.observe(footerNode);
    return () => observer.disconnect();
  }, [enabled, footerNode, scheduleMeasure, scrollNode]);

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [enabled, scheduleMeasure]);

  React.useEffect(() => {
    if (!enabled) {
      setContentRect(null);
      setFooterRect(null);
      setWindowSize(DEFAULT_WINDOW_SIZE);
    }
  }, [enabled]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(rafRef.current);
      }
    },
    []
  );

  return {
    registerScrollNode: setScrollNode,
    registerFooterNode: setFooterNode,
    contentRect,
    footerRect,
    windowSize,
    subscribeToScroll,
  };
};
