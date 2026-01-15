import { useCallback } from "react";
import { JOBVIZ_BREADCRUMB_ID } from "./JobVizBreadcrumb";
import {
  JOBVIZ_CATEGORIES_ANCHOR_ID,
  JOBVIZ_HIERARCHY_HEADING_ID,
  JOBVIZ_MAIN_ANCHOR_ID,
} from "./jobvizDomIds";

const JOBVIZ_SEARCH_FIELD_ID = "jobviz-search-field";
const JOBVIZ_SORT_CONTROL_ID = "jobviz-sort-control";
const JOBVIZ_GROWTH_SORT_ID = "growth-desc";
type HeroStatActionOptions = {
  onBrowseNavigate?: () => void | Promise<void>;
};

const SCROLL_OFFSET_SMALL = 16;
const SCROLL_OFFSET_BREADCRUMB = -64;

const scrollElementToTop = (element: HTMLElement, offset = 0) => {
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth",
  });
};

const scrollBreadcrumbToTop = () => {
  const breadcrumb = document.getElementById(JOBVIZ_BREADCRUMB_ID);
  if (!breadcrumb) return;
  scrollElementToTop(breadcrumb as HTMLElement, SCROLL_OFFSET_BREADCRUMB);
};

const waitForScrollSettled = (delay = 280) => {
  return new Promise<void>((resolve) => {
    let timer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, delay);
    const cleanup = () => {
      window.removeEventListener("scroll", handleScroll);
    };
    const handleScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        cleanup();
        resolve();
      }, delay);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
  });
};

const isPromise = (value: unknown): value is Promise<void> =>
  Boolean(value) && typeof (value as Promise<void>).then === "function";

export const useHeroStatAction = (options: HeroStatActionOptions = {}) => {
  const { onBrowseNavigate } = options;
  return useCallback(
    (statId: string) => {
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }

      if (statId === "search") {
        const field = document.getElementById(JOBVIZ_SEARCH_FIELD_ID);
        const mainAnchor = document.getElementById(JOBVIZ_MAIN_ANCHOR_ID);
        if (mainAnchor) {
          scrollElementToTop(mainAnchor as HTMLElement);
        } else if (field) {
          field.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (field) {
          window.requestAnimationFrame(() => {
            field.focus({ preventScroll: true });
          });
        }
        return;
      }

      if (statId === "browse") {
        const completeScroll = () => {
          window.requestAnimationFrame(scrollBreadcrumbToTop);
        };
        const maybeNavigate = onBrowseNavigate?.();
        if (isPromise(maybeNavigate)) {
          maybeNavigate.catch(() => {}).finally(completeScroll);
        } else {
          completeScroll();
        }
        return;
      }

      if (statId === "growth") {
        const triggerSortFocus = () => {
          window.dispatchEvent(
            new CustomEvent("jobviz-sort-focus", {
              detail: { optionId: JOBVIZ_GROWTH_SORT_ID },
            })
          );
        };
        const categoriesAnchor = document.getElementById(
          JOBVIZ_CATEGORIES_ANCHOR_ID
        );
        if (categoriesAnchor) {
          scrollElementToTop(categoriesAnchor as HTMLElement);
          waitForScrollSettled(450).finally(triggerSortFocus);
          return;
        }
        const hierarchyHeading = document.getElementById(
          JOBVIZ_HIERARCHY_HEADING_ID
        );
        if (hierarchyHeading) {
          scrollElementToTop(
            hierarchyHeading as HTMLElement,
            SCROLL_OFFSET_SMALL
          );
          waitForScrollSettled(450).finally(triggerSortFocus);
          return;
        }
        const dropdown = document.getElementById(JOBVIZ_SORT_CONTROL_ID);
        dropdown?.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(triggerSortFocus, 350);
      }
    },
    [onBrowseNavigate]
  );
};
