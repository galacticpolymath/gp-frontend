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
import styles from "../../styles/jobvizBurst.module.scss";
import HeroForFreeUsers from "../../components/JobViz/Heros/HeroForFreeUsers";
import { JobVizSortControl } from "../../components/JobViz/JobVizSortControl";
import {
  buildIdPathForNode,
  buildJobvizUrl,
  collectAssignmentAncestorIds,
  getDisplayTitle,
  getTargetLevelForNode,
  getSelectedSocCodeForLevel,
  getIconNameForNode,
  getLineItemCountForNode,
  getJobSpecificIconName,
  jobVizData,
  jobVizNodeById,
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
import { verifyJwt } from "../../nondependencyFns";
import { useModalContext } from "../../providers/ModalProvider";

export const JOBVIZ_BRACKET_SEARCH_ID = "jobviz-bracket-search";

const JOBVIZ_DESCRIPTION =
  "Explore the full BLS hierarchy with the JobViz glass UI—glass cards, glowing breadcrumbs, and animated explore links keyed to real SOC data.";
const JOBVIZ_DATA_SOURCE =
  "https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm";

const JobViz = ({ unitName, jobTitleAndSocCodePairs, hasGpPlusMembership }) => {
  const router = useRouter();
  const { _selectedJob, _isJobModalOn } = useModalContext();
  const [, setSelectedJob] = _selectedJob;
  const [, setIsJobModalOn] = _isJobModalOn;

  const assignmentSocCodes = useMemo(() => {
    const param = router.query?.[SOC_CODES_PARAM_NAME];
    const value = Array.isArray(param) ? param.join(",") : param;

    if (!value) return null;

    return new Set(value.split(",").filter(Boolean));
  }, [router.query]);

  const preservedUnitName =
    unitName ?? (router.query?.[UNIT_NAME_PARAM_NAME]?.toString() || null);
  const shouldRenderAssignment =
    Boolean(preservedUnitName) || Boolean(jobTitleAndSocCodePairs?.length);

  const assignmentParams = useMemo(
    () => ({
      socCodes: assignmentSocCodes ?? undefined,
      unitName: preservedUnitName,
    }),
    [assignmentSocCodes, preservedUnitName]
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

  const level1Nodes = useMemo(() => {
    return jobVizData.filter((node) => node.hierarchy === 1);
  }, []);

  const gridItems = useMemo(() => {
    return level1Nodes.map((node) => ({
      id: String(node.id),
      title: getDisplayTitle(node),
      iconName: getIconNameForNode(node),
      level: 1,
      jobsCount: getLineItemCountForNode(node),
      growthPercent: node.employment_change_percent ?? null,
      wage: node.median_annual_wage ?? null,
      socCode: node.soc_code ?? null,
      isAssignmentJob: false,
      highlight:
        assignmentAncestors.has(node.id) ||
        (assignmentSocCodes?.has(node.soc_code) ?? false),
      highlightClicked: false,
      showBookmark:
        assignmentAncestors.has(node.id) ||
        (assignmentSocCodes?.has(node.soc_code) ?? false),
    }));
  }, [level1Nodes, assignmentAncestors, assignmentSocCodes]);
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

  const openJobDetailFromGrid = (item) => {
    if (!item?.socCode) return;
    handleAssignmentJobClick(item.socCode);
  };

  const handleRootClick = (item) => {
    const node = jobVizNodeById.get(Number(item.id));
    if (!node) return;

    const targetLevel = getTargetLevelForNode(node);
    const selectedLevel = getSelectedSocCodeForLevel(node, targetLevel);
    const idPath = buildIdPathForNode(node);
    const nextUrl = buildJobvizUrl(
      { targetLevel, selectedLevel, idPath },
      assignmentParams,
      sortQueryParams
    );

    router.push(nextUrl, undefined, { scroll: false }).finally(
      scrollToBreadcrumb
    );
  };

  const breadcrumbs = useMemo(
    () => [
      {
        label: "job-categories",
        iconName: "Grid2x2",
        isActive: true,
      },
    ],
    []
  );

  const heroSubtitle =
    "A tool for grades 6 to adult to explore career possibilities!";
  const forceGpPlusHero = !!router.query?.soc_code;
  const isGpPlusHero = hasGpPlusMembership || forceGpPlusHero;
  const heroSlot = isGpPlusHero ? null : <HeroForFreeUsers />;


  const layoutProps = {
    title:
      "JobViz Career Explorer | Connect Learning to 1,000+ Real-World Careers",
    description: JOBVIZ_DESCRIPTION,
    imgSrc: "https://teach.galacticpolymath.com/imgs/jobViz/jobviz_icon.png",
    url: "https://teach.galacticpolymath.com/jobviz",
    keywords:
      "jobviz, job viz, career explorer, career, career exploration, career exploration tool, career exploration for students, career exploration for high school students, career exploration for middle school students, career exploration for teens, career exploration for teenagers, career exploration for kids, career exploration for children, career exploration for young adults, career exploration for young people, career exploration for youth, career exploration for adolescents, career exploration for parents, career exploration for teachers, career exploration for counselors, career exploration",
  };

  return (
    <Layout {...layoutProps}>
      {shouldRenderAssignment && (
        <AssignmentBanner
          variant="mobile"
          unitName={preservedUnitName}
          jobs={jobTitleAndSocCodePairs}
          assignmentParams={assignmentParams}
          onJobClick={handleAssignmentJobClick}
        />
      )}
      <div
        className={styles.jobvizPageShell}
        data-has-assignment={shouldRenderAssignment}
      >
        <div className={styles.jobvizMainColumn}>
          <JobVizLayout
            heroTitle="JobViz Career Explorer+"
            heroSubtitle={heroSubtitle}
            heroSlot={heroSlot}
            heroEyebrow={isGpPlusHero ? "GP+ Subscriber Version" : undefined}
          >
            <div id={JOBVIZ_BRACKET_SEARCH_ID} />
            <h2 className={styles.jobvizSectionHeading}>
              Browse jobs by category or search
            </h2>
            <h3 className={styles.jobvizSearchAppeal}>
              Explore the true diversity of career opportunities.
            </h3>

            <JobVizSearch
              assignmentParams={assignmentParams}
              extraQueryParams={sortQueryParams}
            />
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
                      ? openJobDetailFromGrid
                      : handleRootClick
                  }
                />
              </div>

              <p className={`${styles.jobvizSource} ${styles.jobvizSourceFixed}`}>
                Data source:{" "}
                <a href={JOBVIZ_DATA_SOURCE} target="_blank" rel="noreferrer">
                  US Bureau of Labor Statistics
                </a>
              </p>
            </div>
          </JobVizLayout>
        </div>
        {shouldRenderAssignment && (
          <AssignmentBanner
            variant="desktop"
            unitName={preservedUnitName}
            jobs={jobTitleAndSocCodePairs}
            assignmentParams={assignmentParams}
            onJobClick={handleAssignmentJobClick}
          />
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps = async ({ query, req }) => {
  const socCodesStr = query?.[SOC_CODES_PARAM_NAME];
  const unitName = query?.[UNIT_NAME_PARAM_NAME] ?? null;
  const socCodes = socCodesStr ? new Set(socCodesStr.split(",")) : null;
  const sessionToken = req.cookies["next-auth.session-token"];
  let hasGpPlusMembership = req?.cookies?.["isGpPlusMember"];

  if (typeof hasGpPlusMembership === "string") {
    hasGpPlusMembership = hasGpPlusMembership === "true";
  } else if (!hasGpPlusMembership && sessionToken) {
    hasGpPlusMembership = !!(await verifyJwt(sessionToken))?.payload
      ?.hasGpPlusMembership;
  }

  hasGpPlusMembership = !!hasGpPlusMembership;

  if (socCodes) {
    const jobTitleAndSocCodePairs = getUnitRelatedJobs(socCodes).map(
      ({ title, soc_code }) => [title, soc_code]
    );

    return {
      props: {
        unitName,
        jobTitleAndSocCodePairs,
        hasGpPlusMembership,
      },
    };
  }

  return {
    props: {
      unitName,
      jobTitleAndSocCodePairs: null,
      hasGpPlusMembership,
    },
  };
};

export default JobViz;
