import {
  computeScrollTipOverlay,
  isScrollTargetHidden,
} from "../assignmentScrollHelpers";

describe("assignment scroll helpers", () => {
  it("detects when the next job is hidden beneath the fold", () => {
    const containerRect = {
      top: 0,
      bottom: 200,
      left: 0,
      right: 320,
      width: 320,
      height: 200,
    };

    expect(
      isScrollTargetHidden(
        {
          top: 120,
          bottom: 188,
          left: 0,
          right: 320,
          width: 320,
          height: 68,
        },
        containerRect
      )
    ).toBe(false);

    expect(
      isScrollTargetHidden(
        {
          top: 160,
          bottom: 212,
          left: 0,
          right: 320,
          width: 320,
          height: 52,
        },
        containerRect
      )
    ).toBe(true);
  });

  it("computes the tooltip overlay position relative to the footer", () => {
    const footerRect = {
      top: 480,
      bottom: 520,
      left: 64,
      right: 364,
      width: 300,
      height: 40,
    };
    const windowSize = { width: 1024, height: 768 };

    const overlay = computeScrollTipOverlay(footerRect, windowSize);
    expect(Math.round(overlay.left)).toBe(64);
    expect(Math.round(overlay.width)).toBe(300);
    expect(Math.round(overlay.bottom)).toBe(300);
  });
});
