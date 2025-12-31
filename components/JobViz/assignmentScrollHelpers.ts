import type { RectLike } from "./useAssignmentDockViewport";

const SCROLL_TIP_GUTTER_PX = 16;
const SCROLL_TIP_OFFSET_PX = 12;

export const computeScrollTipOverlay = (
  footerRect: RectLike,
  windowSize: { width: number; height: number }
) => {
  const maxWidth = Math.max(windowSize.width - SCROLL_TIP_GUTTER_PX * 2, 0);
  const width = Math.min(footerRect.width, maxWidth);
  const left = Math.min(
    Math.max(footerRect.left, SCROLL_TIP_GUTTER_PX),
    Math.max(
      windowSize.width - SCROLL_TIP_GUTTER_PX - width,
      SCROLL_TIP_GUTTER_PX
    )
  );
  const bottom = Math.max(
    windowSize.height - footerRect.top + SCROLL_TIP_OFFSET_PX,
    SCROLL_TIP_GUTTER_PX
  );
  return { left, width, bottom };
};

export const isScrollTargetHidden = (
  targetRect: RectLike,
  containerRect: RectLike
) => targetRect.bottom > containerRect.bottom - SCROLL_TIP_OFFSET_PX;
