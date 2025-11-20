import { useMemo } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { AssignmentBanner } from "../../components/JobViz/AssignmentBanner";
import { JobVizBreadcrumb } from "../../components/JobViz/JobVizBreadcrumb";
import { JobVizGrid } from "../../components/JobViz/JobVizGrid";
import { JobVizLayout } from "../../components/JobViz/JobVizLayout";
import styles from "../../styles/jobvizGlass.module.css";
import {
  buildIdPathForNode,
  buildJobvizUrl,
  collectAssignmentAncestorIds,
  getDisplayTitle,
  getTargetLevelForNode,
  getSelectedSocCodeForLevel,
  getIconNameForNode,
  jobVizData,
  jobVizNodeById,
} from "../../components/JobViz/jobvizUtils";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../../components/LessonSection/JobVizConnections";
import { getUnitRelatedJobs } from "../../helperFns/filterUnitRelatedJobs";
import { verifyJwt } from "../../nondependencyFns";

const JOBVIZ_DESCRIPTION =
  "Explore the full BLS hierarchy with the JobViz glass UI—glass cards, glowing breadcrumbs, and animated explore links keyed to real SOC data.";
const JOBVIZ_DATA_SOURCE =
  "https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm";

const JobViz = ({ unitName, jobTitleAndSocCodePairs, hasGpPlusMembership }) => {
  const router = useRouter();

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

  const assignmentAncestors = useMemo(
    () => collectAssignmentAncestorIds(assignmentSocCodes ?? undefined),
    [assignmentSocCodes]
  );

  const level1Nodes = useMemo(() => {
    const nodes = jobVizData.filter((node) => node.hierarchy === 1);

    if (!assignmentAncestors.size) return nodes;

    const filtered = nodes.filter((node) => assignmentAncestors.has(node.id));

    return filtered.length ? filtered : nodes;
  }, [assignmentAncestors]);

  const gridItems = useMemo(
    () =>
      level1Nodes.map((node) => ({
        id: String(node.id),
        title: getDisplayTitle(node),
        iconName: getIconNameForNode(node),
        level: 1,
      })),
    [level1Nodes]
  );

  const handleRootClick = (item) => {
    const node = jobVizNodeById.get(Number(item.id));
    if (!node) return;

    const targetLevel = getTargetLevelForNode(node);
    const selectedLevel = getSelectedSocCodeForLevel(node, targetLevel);
    const idPath = buildIdPathForNode(node);
    const nextUrl = buildJobvizUrl(
      { targetLevel, selectedLevel, idPath },
      assignmentParams
    );

    router.push(nextUrl);
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

  const heroSubtitle = hasGpPlusMembership
    ? "Welcome back! Explore the full SOC tree or jump straight to your linked lessons."
    : "Prototype-inspired JobViz refresh with glass cards, Lucide icons, and animated explore links.";

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
      <JobVizLayout
        heroTitle="JobViz Career Explorer+"
        heroSubtitle={heroSubtitle}
      >
        <AssignmentBanner
          unitName={preservedUnitName}
          jobs={jobTitleAndSocCodePairs}
        />

        <JobVizBreadcrumb segments={breadcrumbs} />
        <h2 className={styles.jobvizSectionHeading}>Explore job families</h2>

        <JobVizGrid items={gridItems} onItemClick={handleRootClick} />

        <p className={`${styles.jobvizSource} mt-4`}>
          Data source:{" "}
          <a href={JOBVIZ_DATA_SOURCE} target="_blank" rel="noreferrer">
            US Bureau of Labor Statistics
          </a>
        </p>
      </JobVizLayout>
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
