/** @jest-environment jsdom */

import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useDelayedProgressAnimation } from "../useDelayedProgressAnimation";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useDelayedProgressAnimation", () => {
  jest.useFakeTimers();

  let container: HTMLDivElement;
  let root: Root;
  const latestStateRef = {
    current: null as { displayedRated: number; isAnimating: boolean } | null,
  };

  interface HarnessProps {
    rated: number;
    total: number;
    onComplete?: () => void;
  }

  const Harness: React.FC<HarnessProps> = ({ rated, total, onComplete }) => {
    const state = useDelayedProgressAnimation({
      rated,
      total,
      delayMs: 100,
      animationDurationMs: 200,
      onAnimationComplete: onComplete,
    });
    React.useEffect(() => {
      latestStateRef.current = state;
    }, [state]);
    return null;
  };

  const renderHarness = (props: HarnessProps) => {
    act(() => {
      root.render(<Harness {...props} />);
    });
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    latestStateRef.current = null;
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("delays showing the new progress value before animating", () => {
    const handleComplete = jest.fn();
    renderHarness({ rated: 0, total: 3, onComplete: handleComplete });
    expect(latestStateRef.current).toEqual({
      displayedRated: 0,
      isAnimating: false,
    });

    renderHarness({ rated: 1, total: 3, onComplete: handleComplete });
    expect(latestStateRef.current).toEqual({
      displayedRated: 0,
      isAnimating: false,
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(latestStateRef.current).toEqual({
      displayedRated: 1,
      isAnimating: true,
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(latestStateRef.current).toEqual({
      displayedRated: 1,
      isAnimating: false,
    });
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it("resets the delay if ratings change before it fires", () => {
    const handleComplete = jest.fn();
    renderHarness({ rated: 0, total: 4, onComplete: handleComplete });

    renderHarness({ rated: 1, total: 4, onComplete: handleComplete });
    act(() => {
      jest.advanceTimersByTime(60);
    });

    renderHarness({ rated: 2, total: 4, onComplete: handleComplete });
    act(() => {
      jest.advanceTimersByTime(80);
    });
    expect(latestStateRef.current).toEqual({
      displayedRated: 0,
      isAnimating: false,
    });

    act(() => {
      jest.advanceTimersByTime(20);
    });
    expect(latestStateRef.current).toEqual({
      displayedRated: 2,
      isAnimating: true,
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(latestStateRef.current).toEqual({
      displayedRated: 2,
      isAnimating: false,
    });
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});
