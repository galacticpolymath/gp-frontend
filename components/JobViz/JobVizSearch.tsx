import * as React from "react";
import { useRouter } from "next/router";
import styles from "../../styles/jobvizBurst.module.scss";
import {
  AssignmentParams,
  buildJobvizUrl,
  getDisplayTitle,
  jobVizData,
} from "./jobvizUtils";

interface JobVizSearchProps {
  assignmentParams?: AssignmentParams;
}

export const JobVizSearch: React.FC<JobVizSearchProps> = ({
  assignmentParams,
}) => {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

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

  const handleResultClick = (nodeId: number) => {
    const node = jobVizData.find((n) => n.id === nodeId);
    if (!node) return;

    const url = buildJobvizUrl({ fromNode: node }, assignmentParams);
    router.push(url, undefined, { scroll: false });
  };

  return (
    <div className={styles.jobvizSearch}>
      <label className="form-label fw-semibold" htmlFor="jobviz-search-input">
        Search jobs
      </label>
      <input
        id="jobviz-search-input"
        type="search"
        className={`${styles.jobvizSearchInput} form-control`}
        placeholder="Search by job title or SOC code…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className={styles.jobvizSearchResults} role="listbox">
          {results.map((node) => (
            <button
              key={node.id}
              type="button"
              className={styles.jobvizSearchResult}
              onClick={() => handleResultClick(node.id)}
            >
              <span className={styles.jobvizSearchTitle}>
                {getDisplayTitle(node)}
              </span>
              <span className={styles.jobvizSearchMeta}>{node.soc_code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
