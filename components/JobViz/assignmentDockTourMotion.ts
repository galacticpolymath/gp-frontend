const DESKTOP_DOCK_MEDIA_QUERY = "(min-width: 1200px)";
const DOCK_SCROLL_SELECTOR = '[data-jobviz-assignment-scroll="true"]';

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const escapeSocCode = (socCode: string) => {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(socCode);
  }
  return socCode.replace(/"/g, '\\"');
};

const getDockScrollNode = () =>
  document.querySelector<HTMLElement>(DOCK_SCROLL_SELECTOR);

export const isDesktopDockViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia(DESKTOP_DOCK_MEDIA_QUERY).matches;

export const emitTourDockMutation = (
  socCode: string,
  action: "add" | "remove"
) => {
  if (typeof window === "undefined" || !socCode) return;
  window.dispatchEvent(
    new CustomEvent("jobviz-tour-dock-mutation", {
      detail: { socCode, action },
    })
  );
};

export const scrollTourDockIntoView = async (
  socCode: string,
  options?: { fallbackToBottom?: boolean; delayMs?: number }
) => {
  if (typeof window === "undefined" || !isDesktopDockViewport()) return false;
  const scrollNode = getDockScrollNode();
  if (!scrollNode) return false;
  const selector = `[data-assignment-soc="${escapeSocCode(socCode)}"]`;
  const target = scrollNode.querySelector<HTMLElement>(selector);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  } else if (options?.fallbackToBottom) {
    scrollNode.scrollTo({ top: scrollNode.scrollHeight, behavior: "smooth" });
  } else {
    return false;
  }
  await wait(options?.delayMs ?? 240);
  return true;
};
