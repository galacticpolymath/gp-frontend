import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { AssignmentBanner } from "../../components/JobViz/AssignmentBanner";
import { JobVizBreadcrumb } from "../../components/JobViz/JobVizBreadcrumb";
import { JobVizGrid } from "../../components/JobViz/JobVizGrid";
import { JobVizLayout } from "../../components/JobViz/JobVizLayout";
import { LucideIcon } from "../../components/JobViz/LucideIcon";
import HeroForFreeUsers from "../../components/JobViz/Heros/HeroForFreeUsers";
import styles from "../../styles/jobvizGlass.module.css";
import {
  buildIdPathForNode,
  buildJobvizUrl,
  collectAssignmentAncestorIds,
  filterJobsBySocCodes,
  getChainFromIds,
  getDisplayTitle,
  getHierarchySlice,
  getIconNameForNode,
  getSelectedSocCodeForLevel,
  getTargetLevelForNode,
  jobVizData,
  jobVizNodeById,
  parseJobvizPath,
} from "../../components/JobViz/jobvizUtils";
import { JobVizSearch } from "../../components/JobViz/JobVizSearch";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../../components/LessonSection/JobVizConnections";
import { getUnitRelatedJobs } from "../../helperFns/filterUnitRelatedJobs";
import { verifyJwt } from "../../backend/utils/security";
import { useModalContext } from "../../providers/ModalProvider";

const JOBVIZ_DATA_SOURCE =
  "https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm";

const formatCurrency = (value) => {
  if (typeof value !== "number") return "—";
  return `$${value.toLocaleString()}`;
};

const formatPercent = (value) => {
  if (typeof value !== "number") return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

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

  const filteredSlice = useMemo(() => {
    return hierarchySlice;
  }, [hierarchySlice]);

  const handleAssignmentJobClick = (socCode) => {
    const node = jobVizData.find((n) => n.soc_code === socCode);
    if (!node) return;

    setSelectedJob({ ...node, wasSelectedFromJobToursCard: false });
    setIsJobModalOn(true);

    const url = buildJobvizUrl({ fromNode: node }, assignmentParams);
    router.push(url, undefined, { scroll: false });
  };

  const activeNode = chainNodes[chainNodes.length - 1] ?? null;

  const gridItems = useMemo(
    () =>
      filteredSlice.map((node) => ({
        id: String(node.id),
        title: getDisplayTitle(node),
        iconName: getIconNameForNode(node),
        level: parsed.targetLevel === 2 ? 1 : 2,
        highlight:
          assignmentAncestors.has(node.id) ||
          (assignmentSocCodes?.has(node.soc_code) ?? false),
        highlightClicked: activeNode?.id === node.id,
        showBookmark:
          assignmentAncestors.has(node.id) ||
          (assignmentSocCodes?.has(node.soc_code) ?? false),
      })),
    [
      filteredSlice,
      parsed.targetLevel,
      assignmentAncestors,
      assignmentSocCodes,
      activeNode?.id,
    ]
  );

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
      assignmentParams
    );

    router.push(nextUrl, undefined, { scroll: false });
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
                    assignmentParams
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
                  assignmentParams
                ),
                undefined,
                { scroll: false }
              ),
      });
    });

    return segments;
  }, [assignmentParams, chainNodes, parsed.targetLevel, router]);

  const heroSubtitle =
    "A tool for grades 6 to adult to explore career possibilities! Browse, search & share key details about 1000+ jobs.";
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
      <JobVizLayout
        heroTitle="JobViz Career Explorer+"
        heroSubtitle={heroSubtitle}
        heroSlot={heroSlot}
      >
        <div className={styles.assignmentStrip}>
          <div className={styles.assignmentStripInner}>
            <AssignmentBanner
              unitName={preservedUnitName}
              jobs={jobTitleAndSocCodePairs}
              assignmentParams={assignmentParams}
              onJobClick={handleAssignmentJobClick}
            />
          </div>
        </div>

        {showIntroHeading && (
          <h2 className={styles.jobvizSectionHeading}>{sectionHeading}</h2>
        )}

        <JobVizSearch assignmentParams={assignmentParams} />
        <div className={styles.jobvizContextZone}>
          <JobVizBreadcrumb segments={breadcrumbs} />

          <div className={styles.jobvizGridWrap}>
            <JobVizGrid items={gridItems} onItemClick={handleGridClick} />
          </div>

          {showDetail && activeNode && (
            <article className={styles.jobvizDetail}>
              <div className={styles.jobvizDetailHeader}>
                <LucideIcon name={getIconNameForNode(activeNode)} />
                <div>
                  <p className={styles.jobvizDetailSoc}>{activeNode.soc_code}</p>
                  <h3 className={styles.jobvizDetailTitle}>
                    {getDisplayTitle(activeNode)}
                  </h3>
                </div>
              </div>
              {activeNode.def && (
                <p className={styles.jobvizDetailBody}>{activeNode.def}</p>
              )}

              <div className={styles.jobvizDetailMeta}>
                <div className={styles.jobvizStat}>
                  <span className={styles.jobvizStatLabel}>Median wage</span>
                  <span className={styles.jobvizStatValue}>
                    {formatCurrency(activeNode.median_annual_wage)}
                  </span>
                </div>
                <div className={styles.jobvizStat}>
                  <span className={styles.jobvizStatLabel}>
                    Employment change
                  </span>
                  <span className={styles.jobvizStatValue}>
                    {formatPercent(activeNode.employment_change_percent)}
                  </span>
                </div>
                <div className={styles.jobvizStat}>
                  <span className={styles.jobvizStatLabel}>Education</span>
                  <span className={styles.jobvizStatValue}>
                    {activeNode.typical_education_needed_for_entry || "—"}
                  </span>
                </div>
                <div className={styles.jobvizStat}>
                  <span className={styles.jobvizStatLabel}>Training</span>
                  <span className={styles.jobvizStatValue}>
                    {activeNode[
                      "typical_on-the-job_training_needed_to_attain_competency_in_the_occupation"
                    ] || "—"}
                  </span>
                </div>
              </div>
            </article>
          )}

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
