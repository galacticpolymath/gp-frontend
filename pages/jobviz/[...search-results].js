import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { AssignmentBanner } from "../../components/JobViz/AssignmentBanner";
import {
  JobVizBreadcrumb,
  JOBVIZ_BREADCRUMB_ID,
} from "../../components/JobViz/JobVizBreadcrumb";
import { JobVizGrid } from "../../components/JobViz/JobVizGrid";
import { JobVizLayout } from "../../components/JobViz/JobVizLayout";
import { LucideIcon } from "../../components/JobViz/LucideIcon";
import { JobVizSortControl } from "../../components/JobViz/JobVizSortControl";
import HeroForFreeUsers from "../../components/JobViz/Heros/HeroForFreeUsers";
import { JOBVIZ_BRACKET_SEARCH_ID } from "../../pages/jobviz/index";
import styles from "../../styles/jobvizBurst.module.scss";
import {
  buildIdPathForNode,
  buildJobvizUrl,
  collectAssignmentAncestorIds,
  filterJobsBySocCodes,
  getChainFromIds,
  getDisplayTitle,
  getHierarchySlice,
  getIconNameForNode,
  getJobSpecificIconName,
  getLineItemCountForNode,
  getSelectedSocCodeForLevel,
  getTargetLevelForNode,
  jobVizData,
  jobVizNodeById,
  parseJobvizPath,
} from "../../components/JobViz/jobvizUtils";
import { JobVizSearch } from "../../components/JobViz/JobVizSearch";
import {
  JOBVIZ_DEFAULT_SORT_OPTION,
  JOBVIZ_SORT_OPTIONS,
  getSortOptionById,
  sortJobVizItems,
} from "../../components/JobViz/jobvizSorting";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../../components/LessonSection/JobVizConnections";
import { getUnitRelatedJobs } from "../../helperFns/filterUnitRelatedJobs";
import { verifyJwt } from "../../backend/utils/security";
import { useModalContext } from "../../providers/ModalProvider";

const JOBVIZ_DATA_SOURCE =
  "https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm";

const JobVizSearchResults = ({
  metaDescription,
  unitName,
  jobTitleAndSocCodePairs,
  hasGpPlusMembership,
}) => {
  const router = useRouter();
  const { _selectedJob, _isJobModalOn } = useModalContext();
  const [, setSelectedJob] = _selectedJob;
  const [, setIsJobModalOn] = _isJobModalOn;

  const parsed = useMemo(
    () => parseJobvizPath(router.query?.["search-results"]),
    [router.query]
  );

  const assignmentSocCodes = useMemo(() => {
    const param = router.query?.[SOC_CODES_PARAM_NAME];
    const value = Array.isArray(param) ? param.join(",") : param;

    if (!value) return null;

    return new Set(value.split(",").filter(Boolean));
  }, [router.query]);

  const preservedUnitName =
    unitName ?? (router.query?.[UNIT_NAME_PARAM_NAME]?.toString() || null);

  const assignmentParams = useMemo(
    () => ({
      socCodes: assignmentSocCodes ?? undefined,
      unitName: preservedUnitName,
    }),
    [assignmentSocCodes, preservedUnitName]
  );

  const chainNodes = useMemo(
    () => getChainFromIds(parsed.idPath),
    [parsed.idPath]
  );

  const selectedLevelFromChain = useMemo(() => {
    const parent = chainNodes.find(
      (node) => node.hierarchy === parsed.targetLevel - 1
    );

    if (!parent) return null;

    return getSelectedSocCodeForLevel(parent, parsed.targetLevel);
  }, [chainNodes, parsed.targetLevel]);

  const selectedLevel =
    parsed.selectedLevel ?? selectedLevelFromChain ?? null;

  const hierarchySlice = useMemo(
    () => getHierarchySlice(parsed.targetLevel, selectedLevel),
    [parsed.targetLevel, selectedLevel]
  );

  const assignmentAncestors = useMemo(
    () => collectAssignmentAncestorIds(assignmentSocCodes ?? undefined),
    [assignmentSocCodes]
  );
  const hasAssignmentList = Boolean(assignmentSocCodes?.size);
  const [showAssignmentOnly, setShowAssignmentOnly] = useState(false);
  const sortQueryFromRouter =
    typeof router.query?.sort === "string" ? router.query.sort : undefined;
  const normalizedSortFromQuery = useMemo(
    () => getSortOptionById(sortQueryFromRouter).id,
    [sortQueryFromRouter]
  );
  const [sortOptionId, setSortOptionId] = useState(normalizedSortFromQuery);
  useEffect(() => {
    setSortOptionId(normalizedSortFromQuery);
  }, [normalizedSortFromQuery]);
  const persistSortInQuery = useCallback(
    (nextId) => {
      const [path, search = ""] = router.asPath.split("?");
      const params = new URLSearchParams(search);
      if (nextId && nextId !== JOBVIZ_DEFAULT_SORT_OPTION.id) {
        params.set("sort", nextId);
      } else {
        params.delete("sort");
      }
      const queryString = params.toString();
      const nextUrl = queryString ? `${path}?${queryString}` : path;
      router.replace(nextUrl, undefined, { shallow: true, scroll: false });
    },
    [router]
  );
  const handleSortControlChange = useCallback(
    (nextId) => {
      setSortOptionId(nextId);
      persistSortInQuery(nextId);
    },
    [persistSortInQuery]
  );
  const sortQueryParam =
    sortOptionId === JOBVIZ_DEFAULT_SORT_OPTION.id ? undefined : sortOptionId;
  const sortQueryParams = useMemo(
    () => (sortQueryParam ? { sort: sortQueryParam } : undefined),
    [sortQueryParam]
  );
  // filter state managed via button; when assignment data is absent the toggle is ignored.
  const focusAssignedActive = Boolean(showAssignmentOnly && hasAssignmentList);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.jobvizFocus = focusAssignedActive ? "true" : "false";
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jobviz-focus-toggle", {
          detail: { value: focusAssignedActive },
        })
      );
    }
  }, [focusAssignedActive]);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        delete document.body.dataset.jobvizFocus;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("jobviz-focus-toggle", { detail: { value: false } })
        );
      }
    };
  }, []);

  const filteredSlice = useMemo(() => {
    return hierarchySlice;
  }, [hierarchySlice]);

  const handleAssignmentJobClick = (socCode) => {
    const node = jobVizData.find((n) => n.soc_code === socCode);
    if (!node) return;

    setSelectedJob({ ...node, wasSelectedFromJobToursCard: false });
    setIsJobModalOn(true);

    const url = buildJobvizUrl(
      { fromNode: node },
      assignmentParams,
      sortQueryParams
    );
    router.push(url, undefined, { scroll: false });
  };

  const activeNode = chainNodes[chainNodes.length - 1] ?? null;

  const scrollToBreadcrumb = () => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      const el = document.getElementById(JOBVIZ_BREADCRUMB_ID);
      if (!el) return;
      const offset = 32;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  const gridItems = useMemo(() => {
    return filteredSlice.map((node) => ({
      id: String(node.id),
      title: getDisplayTitle(node),
      iconName: getIconNameForNode(node),
      level: node.occupation_type === "Line item" ? 2 : 1,
      jobsCount:
        node.occupation_type === "Line item"
          ? undefined
          : getLineItemCountForNode(node),
      growthPercent: node.employment_change_percent ?? null,
      wage: node.median_annual_wage ?? null,
      education:
        node.occupation_type === "Line item"
          ? node.typical_education_needed_for_entry ?? null
          : null,
      jobIconName:
        node.occupation_type === "Line item"
          ? getJobSpecificIconName(node)
          : undefined,
      socCode: node.soc_code ?? null,
      isAssignmentJob:
        node.occupation_type === "Line item"
          ? assignmentSocCodes?.has(node.soc_code) ?? false
          : false,
      highlight:
        assignmentAncestors.has(node.id) ||
        (assignmentSocCodes?.has(node.soc_code) ?? false),
      highlightClicked: activeNode?.id === node.id,
      showBookmark:
        assignmentAncestors.has(node.id) ||
        (assignmentSocCodes?.has(node.soc_code) ?? false),
    }));
  }, [
    filteredSlice,
    assignmentAncestors,
    assignmentSocCodes,
    activeNode?.id,
  ]);

  const assignmentJobItems = useMemo(() => {
    if (!assignmentSocCodes?.size) return [];
    return Array.from(assignmentSocCodes)
      .map((code) => jobVizData.find((node) => node.soc_code === code))
      .filter(Boolean)
      .map((node) => ({
        id: String(node.id),
        title: getDisplayTitle(node),
        iconName: getIconNameForNode(node),
        level: 2,
        jobsCount: undefined,
        growthPercent: node.employment_change_percent ?? null,
        wage: node.median_annual_wage ?? null,
        education: node.typical_education_needed_for_entry ?? null,
        jobIconName: getJobSpecificIconName(node),
        socCode: node.soc_code ?? null,
        isAssignmentJob: true,
        highlight: true,
        highlightClicked: false,
        showBookmark: true,
      }));
  }, [assignmentSocCodes]);

  const sortedGridItems = useMemo(
    () => sortJobVizItems(gridItems, sortOptionId),
    [gridItems, sortOptionId]
  );

  const sortedAssignmentItems = useMemo(
    () => sortJobVizItems(assignmentJobItems, sortOptionId),
    [assignmentJobItems, sortOptionId]
  );

  const filteredGridItems = useMemo(() => {
    if (showAssignmentOnly && hasAssignmentList) {
      return sortedAssignmentItems;
    }
    return sortedGridItems;
  }, [
    sortedGridItems,
    sortedAssignmentItems,
    showAssignmentOnly,
    hasAssignmentList,
  ]);

  const showDetail = activeNode && activeNode.occupation_type === "Line item";
  const parentForHeading = useMemo(() => {
    if (selectedLevel) {
      return jobVizData.find((node) => node.soc_code === selectedLevel) ?? null;
    }
    return null;
  }, [selectedLevel]);

  const sectionHeading =
    parentForHeading?.soc_title ||
    parentForHeading?.title ||
    "Browse jobs by category or search";

  const showIntroHeading = chainNodes.length === 0;

  const handleAssignmentGridClick = (item) => {
    if (!item?.socCode) return;
    handleAssignmentJobClick(item.socCode);
  };

  const handleGridClick = (item) => {
    const node = jobVizNodeById.get(Number(item.id));
    if (!node) return;

    const targetLevel = getTargetLevelForNode(node);
    const selectedLevelForNode = getSelectedSocCodeForLevel(
      node,
      targetLevel
    );
    const idPath = buildIdPathForNode(node);
    const nextUrl = buildJobvizUrl(
      { targetLevel, selectedLevel: selectedLevelForNode, idPath },
      assignmentParams,
      sortQueryParams
    );

    router.push(nextUrl, undefined, { scroll: false }).finally(
      scrollToBreadcrumb
    );
  };

  const breadcrumbs = useMemo(() => {
    const segments = [
      {
        label: "job-categories",
        iconName: "Grid2x2",
        onClick:
          chainNodes.length || parsed.targetLevel > 1
            ? () =>
                router.push(
                  buildJobvizUrl(
                    { targetLevel: 1, selectedLevel: null, idPath: [] },
                    assignmentParams,
                    sortQueryParams
                  ),
                  undefined,
                  { scroll: false }
                )
            : undefined,
        isActive: !chainNodes.length,
      },
    ];

    chainNodes.forEach((node, index) => {
      const targetLevelForNode = getTargetLevelForNode(node);
      const isLast = index === chainNodes.length - 1;
      const label = getDisplayTitle(node)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      // Avoid duplicate consecutive labels when idPath contains the same node twice.
      const isDuplicate =
        segments.length &&
        segments[segments.length - 1].label === label &&
        segments[segments.length - 1].iconName === getIconNameForNode(node);

      if (isDuplicate) return;

      segments.push({
        label,
        iconName: getIconNameForNode(node),
        isActive: isLast,
        onClick: isLast
          ? undefined
          : () =>
              router.push(
                buildJobvizUrl(
                  {
                    targetLevel: targetLevelForNode,
                    selectedLevel: getSelectedSocCodeForLevel(
                      node,
                      targetLevelForNode
                    ),
                    idPath: buildIdPathForNode(node),
                  },
                  assignmentParams,
                  sortQueryParams
                ),
                undefined,
                { scroll: false }
              ),
      });
    });

    return segments;
  }, [assignmentParams, chainNodes, parsed.targetLevel, router]);

  const heroSubtitle =
    "A tool for grades 6 to adult to explore career possibilities!";
  const forceGpPlusHero = !!router.query?.soc_code;
  const isGpPlusHero = hasGpPlusMembership || forceGpPlusHero;
  const heroSlot = isGpPlusHero ? null : <HeroForFreeUsers />;


  useEffect(() => {
    if (activeNode && activeNode.occupation_type === "Line item") {
      setSelectedJob({ ...activeNode, wasSelectedFromJobToursCard: false });
      setIsJobModalOn(true);
      return;
    }

    setIsJobModalOn(false);
    setSelectedJob(null);
  }, [activeNode, setIsJobModalOn, setSelectedJob]);

  const layoutProps = {
    title: "JobViz Career Explorer | Search results",
    description:
      metaDescription ??
      "Navigate the SOC hierarchy, explore categories, and dig into job details.",
    imgSrc: "https://teach.galacticpolymath.com/imgs/jobViz/jobviz_icon.png",
    url: "https://teach.galacticpolymath.com/jobviz",
    keywords:
      "jobviz, job viz, career explorer, career exploration, career pathways, BLS jobs, career navigation",
  };

  return (
    <Layout {...layoutProps}>
      <AssignmentBanner
        variant="mobile"
        unitName={preservedUnitName}
        jobs={jobTitleAndSocCodePairs}
        assignmentParams={assignmentParams}
        onJobClick={handleAssignmentJobClick}
      />
      <div
        className={styles.jobvizPageShell}
        data-has-assignment={Boolean(jobTitleAndSocCodePairs?.length)}
      >
        <div className={styles.jobvizMainColumn}>
          <JobVizLayout
            heroTitle="JobViz Career Explorer+"
            heroSubtitle={heroSubtitle}
            heroSlot={heroSlot}
          >
            {showIntroHeading && (
              <h2 className={styles.jobvizSectionHeading}>{sectionHeading}</h2>
            )}
            <h3 className={styles.jobvizSearchAppeal}>
              Explore the true diversity of career opportunities.
            </h3>

            <JobVizSearch
              assignmentParams={assignmentParams}
              extraQueryParams={sortQueryParams}
            />
            <div id={JOBVIZ_BRACKET_SEARCH_ID} />
            <div className={styles.jobvizContextZone}>
              <div className={styles.jobvizGridWrap}>
                {(!showAssignmentOnly || !hasAssignmentList) && (
                  <>
                    <div className={styles.gridContextLabel}>Current Path</div>
                    <JobVizBreadcrumb segments={breadcrumbs} />
                  </>
                )}
                <div className={styles.gridFilterRow}>
                  {hasAssignmentList && (
                    <div className={styles.gridFilterActions}>
                      <span className={styles.gridFilterLabel}>
                        {showAssignmentOnly
                          ? "Showing Only Assigned"
                          : "Showing All Jobs"}
                      </span>
                      <button
                        type="button"
                        className={`${styles.gridFilterButton} ${
                          !showAssignmentOnly
                            ? styles.gridFilterButtonActive
                            : ""
                        }`}
                        onClick={() => setShowAssignmentOnly((prev) => !prev)}
                      >
                        {showAssignmentOnly
                          ? "Show All Jobs"
                          : "Show Only Assigned"}
                      </button>
                    </div>
                  )}
                  {hasAssignmentList && (
                    <JobVizSortControl
                      activeOptionId={sortOptionId}
                      onChange={handleSortControlChange}
                      options={JOBVIZ_SORT_OPTIONS}
                    />
                  )}
                  {!hasAssignmentList && (
                    <JobVizSortControl
                      activeOptionId={sortOptionId}
                      onChange={handleSortControlChange}
                      options={JOBVIZ_SORT_OPTIONS}
                    />
                  )}
                </div>
                <JobVizGrid
                  items={filteredGridItems}
                  onItemClick={
                    showAssignmentOnly && hasAssignmentList
                      ? handleAssignmentGridClick
                      : handleGridClick
                  }
                />
              </div>

              <p className={`${styles.jobvizSource} ${styles.jobvizSourceFixed}`}>
                Data source:{" "}
                <a href={JOBVIZ_DATA_SOURCE} target="_blank" rel="noreferrer">
                  US Bureau of Labor Statistics
                </a>
                {activeNode?.BLS_link && (
                  <>
                    {"  "}•{" "}
                    <a href={activeNode.BLS_link} target="_blank" rel="noreferrer">
                      View on BLS
                    </a>
                  </>
                )}
              </p>
            </div>
          </JobVizLayout>
        </div>
        <AssignmentBanner
          variant="desktop"
          unitName={preservedUnitName}
          jobs={jobTitleAndSocCodePairs}
          assignmentParams={assignmentParams}
          onJobClick={handleAssignmentJobClick}
        />
      </div>
    </Layout>
  );
};

export const getServerSideProps = async ({ query, req, resolvedUrl }) => {
  const socCodesStr = query?.[SOC_CODES_PARAM_NAME];
  const unitName = query?.[UNIT_NAME_PARAM_NAME] ?? null;
  const socCodes = socCodesStr ? new Set(socCodesStr.split(",")) : null;
  const jobTitleAndSocCodePairs = socCodes
    ? getUnitRelatedJobs(socCodes).map(({ title, soc_code }) => [
        title,
        soc_code,
      ])
    : null;
  let metaDescription = null;
  const sessionToken = req.cookies["next-auth.session-token"];
  let hasGpPlusMembership = req?.cookies?.["isGpPlusMember"];

  if (typeof hasGpPlusMembership === "string") {
    hasGpPlusMembership = hasGpPlusMembership === "true";
  } else if (!hasGpPlusMembership && sessionToken) {
    hasGpPlusMembership = !!(await verifyJwt(sessionToken))?.payload
      ?.hasGpPlusMembership;
  }

  hasGpPlusMembership = !!hasGpPlusMembership;

  const pathWithoutQuery = resolvedUrl.split("?")[0];
  const pathSegments = pathWithoutQuery.split("/").slice(2);
  const parsedPath = parseJobvizPath(pathSegments);
  const lastId = parsedPath.idPath[parsedPath.idPath.length - 1];

  if (lastId) {
    const node = jobVizNodeById.get(lastId);
    if (node) {
      metaDescription = node.def
        ? `${getDisplayTitle(node)}: ${node.def}`
        : getDisplayTitle(node);
    }
  }

  return {
    props: {
      metaDescription,
      unitName,
      jobTitleAndSocCodePairs,
      hasGpPlusMembership,
    },
  };
};

export default JobVizSearchResults;
