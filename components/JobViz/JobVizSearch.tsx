import * as React from "react";
import { useRouter } from "next/router";
import styles from "../../styles/jobvizBurst.module.scss";
import { LucideIcon } from "./LucideIcon";
import { JOBVIZ_BREADCRUMB_ID } from "./JobVizBreadcrumb";
import {
  AssignmentParams,
  buildJobvizUrl,
  getDisplayTitle,
  jobVizData,
} from "./jobvizUtils";

interface JobVizSearchProps {
  assignmentParams?: AssignmentParams;
  extraQueryParams?: Record<string, string | null | undefined>;
}

export const JobVizSearch: React.FC<JobVizSearchProps> = ({
  assignmentParams,
  extraQueryParams,
}) => {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputId = "jobviz-search-field";
  const listboxId = React.useId();
  const resultRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const normalizedQuery = query.trim().toLowerCase();

  const results = React.useMemo(() => {
    if (!normalizedQuery) return [];

    return jobVizData
      .filter((node) => {
        const titleMatch = (node.title || node.soc_title || "")
          .toLowerCase()
          .includes(normalizedQuery);
        const socMatch =
          typeof node.soc_code === "string" &&
          node.soc_code.toLowerCase().includes(normalizedQuery);

        return titleMatch || socMatch;
      })
      .slice(0, 12);
  }, [normalizedQuery]);

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [normalizedQuery, results.length]);

  React.useEffect(() => {
    resultRefs.current = resultRefs.current.slice(0, results.length);
  }, [results.length]);

  const scrollResultIntoView = (nextIndex: number) => {
    requestAnimationFrame(() => {
      resultRefs.current[nextIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    });
  };

  const scrollToBreadcrumb = () => {
    window.requestAnimationFrame(() => {
      const el = document.getElementById(JOBVIZ_BREADCRUMB_ID);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 32;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  const handleResultClick = (nodeId: number) => {
    const node = jobVizData.find((n) => n.id === nodeId);
    if (!node) return;

    const url = buildJobvizUrl(
      { fromNode: node },
      assignmentParams,
      extraQueryParams
    );
    const isGroup = node.occupation_type !== "Line item";
    const pushPromise = router.push(url, undefined, {
      scroll: !isGroup,
    });
    if (isGroup) {
      pushPromise.then(() => {
        setTimeout(scrollToBreadcrumb, 40);
      });
    }
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (activeIndex + 1) % results.length;
      setActiveIndex(nextIndex);
      scrollResultIntoView(nextIndex);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex =
        activeIndex <= 0 ? results.length - 1 : activeIndex - 1;
      setActiveIndex(nextIndex);
      scrollResultIntoView(nextIndex);
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handleResultClick(results[activeIndex].id);
      return;
    }
    if (event.key === "Escape") {
      setActiveIndex(-1);
    }
  };

  return (
    <div className={styles.jobvizSearch}>
      <div className={styles.jobvizSearchField}>
        <LucideIcon name="Search" className={styles.jobvizSearchIcon} />
        <input
          id={inputId}
          type="search"
          className={`${styles.jobvizSearchInput} form-control`}
          placeholder="Search by job title or SOC code…"
          aria-label="Search jobs by title or SOC code"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleInputKeyDown}
          aria-controls={results.length ? listboxId : undefined}
          aria-activedescendant={
            activeIndex >= 0
              ? `${listboxId}-option-${results[activeIndex].id}`
              : undefined
          }
        />
      </div>
      {results.length > 0 && (
        <div
          className={styles.jobvizSearchResults}
          role="listbox"
          id={listboxId}
        >
          {results.map((node, index) => {
            const isActive = index === activeIndex;
            const resultType =
              node.occupation_type === "Line item" ? "Job" : "GRP";
            return (
            <button
              key={node.id}
              type="button"
              className={`${styles.jobvizSearchResult} ${
                isActive ? styles.jobvizSearchResultActive : ""
              }`}
              onClick={() => handleResultClick(node.id)}
              role="option"
              aria-selected={isActive}
              id={`${listboxId}-option-${node.id}`}
              ref={(el) => {
                resultRefs.current[index] = el;
              }}
            >
              <span className={styles.jobvizSearchTitle}>
                <span
                  className={
                    node.occupation_type === "Line item"
                      ? styles.resultJobBadge
                      : styles.resultGroupBadge
                  }
                >
                  {resultType}
                </span>
                {getDisplayTitle(node)}
              </span>
              <span className={styles.jobvizSearchMeta}>{node.soc_code}</span>
            </button>
          );
          })}
        </div>
      )}
    </div>
  );
};
