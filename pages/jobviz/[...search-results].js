import JobViz from ".";
import { useRouter } from "next/router";
import { useContext, useMemo } from "react";
import { useGetJobCategories } from "../../customHooks/useGetJobCategories";
import jobVizDataObj from "../../data/Jobviz/jobVizDataObj.json";
import { useEffect } from "react";
import { ModalContext } from "../../providers/ModalProvider";
import { useState } from "react";
import filterResults from "../../helperFns/filterResults";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../../components/LessonSection/JobVizConnections";
import { getUnitRelatedJobs } from "../../helperFns/filterUnitRelatedJobs";
import { verifyJwt } from "../../backend/utils/security";

const getParentJobCategories = (jobCategoryIds) => {
  let _jobVizData = jobVizDataObj.data.filter((jobCategory) =>
    jobCategoryIds.includes(jobCategory.id)
  );
  _jobVizData = _jobVizData.map((job) => {
    const { hierarchy, id, soc_title } = job;
    const selectedLevel = job[`level${hierarchy}`];

    return {
      ...job,
      id,
      currentLevel: selectedLevel,
      categoryName: soc_title,
    };
  });
  _jobVizData.splice(0, 0, {
    categoryName: "Job Categories",
    hierarchyNum: null,
    currentLevel: null,
  });

  return _jobVizData;
};

const JobVizSearchResults = ({
  metaDescription,
  unitName,
  jobTitleAndSocCodePairs,
  hasGpPlusMembership,
}) => {
  const router = useRouter();
  const { _selectedJob } = useContext(ModalContext);
  const [selectedJob, setSelectedJob] = _selectedJob;
  const params = router.query?.["search-results"] ?? null;
  const hierarchyNum = params?.[0] ?? null;
  let { jobCategories } = useGetJobCategories(
    hierarchyNum,
    params?.[1] ?? null
  );
  let jobCategoryIds = router.query?.["search-results"]
    ? router.query?.["search-results"].slice(2)
    : [];
  jobCategoryIds.length === parseInt(hierarchyNum) && jobCategoryIds.pop();
  const parentJobCategories = useMemo(
    () => getParentJobCategories(jobCategoryIds.map((id) => parseInt(id))),
    [params]
  );
  const vals = {
    dynamicJobResults: jobCategories,
    currentHierarchyNum: (hierarchyNum && parseInt(hierarchyNum)) ?? 1,
    parentJobCategories: parentJobCategories,
    metaDescription: metaDescription,
  };
  const [willCheckParamsAgain, setWillCheckParamsAgain] = useState(false);

  useEffect(() => {
    const jobCategoryIds = params?.slice(2);
    let hierarchyNum = params?.[0];

    if (!selectedJob && parseInt(hierarchyNum) === jobCategoryIds?.length) {
      let lastJobCategoryId = params?.[params.length - 1];
      const targetJobCategory = jobVizDataObj.data.find(
        (jobCategory) => jobCategory.id === parseInt(lastJobCategoryId)
      );

      console.log("targetJobCategory, sup there: ", targetJobCategory);

      setSelectedJob(targetJobCategory);
      return;
    }

    setWillCheckParamsAgain(true);
  }, []);

  useEffect(() => {
    if (willCheckParamsAgain) {
      let jobCategoryIds = params?.slice(2);

      if (jobCategoryIds?.length === 0 || !jobCategoryIds?.length) {
        let pathsSplitted = window.location.pathname.split("/");
        pathsSplitted.splice(0, 2);
        const jobCategoryPaths = pathsSplitted.slice(2);

        if (parseInt(pathsSplitted[0]) === jobCategoryPaths?.length) {
          let lastJobCategoryId =
            jobCategoryPaths?.[jobCategoryPaths.length - 1];
          const targetJobCategory = jobVizDataObj.data.find(
            (jobCategory) => jobCategory.id === parseInt(lastJobCategoryId)
          );
          setSelectedJob(targetJobCategory);
        }
      }
      setWillCheckParamsAgain(false);
    }
  }, [willCheckParamsAgain]);

  return (
    <JobViz
      vals={vals}
      unitName={unitName}
      jobTitleAndSocCodePairs={jobTitleAndSocCodePairs}
      hasGpPlusMembership={hasGpPlusMembership}
    />
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
  let paths = resolvedUrl.split("/");
  const sessionToken = req.cookies["next-auth.session-token"];
  let hasGpPlusMembership = req?.cookies?.["isGpPlusMember"];

  console.log('hasGpPlusMembership before validation: ', hasGpPlusMembership);
  console.log('is sessionToken present: ', !!sessionToken);

  if (typeof hasGpPlusMembership === 'string') {
    hasGpPlusMembership = hasGpPlusMembership === 'true'
  } else if (!hasGpPlusMembership && sessionToken) {
    console.log('Checking membership with verifyJwt...');
    hasGpPlusMembership = !!(await verifyJwt(sessionToken))?.payload?.hasGpPlusMembership
  }

  hasGpPlusMembership = !!hasGpPlusMembership

  console.log('hasGpPlusMembership after validation: ', hasGpPlusMembership);

  paths.splice(0, 2);

  if (
    paths.length === 5 &&
    paths[paths.length - 1] === paths[paths.length - 2]
  ) {
    const targetJob = jobVizDataObj.data.find(
      ({ id }) => id === parseInt(paths[paths.length - 1])
    );

    return {
      props: {
        metaDescription: targetJob.soc_title,
        unitName,
        jobTitleAndSocCodePairs,
        hasGpPlusMembership,
      },
    };
  }

  if (paths.length === 5) {
    const targetJobCategories = filterResults(parseInt(paths[0]), paths[1]);
    const jobInModal = targetJobCategories.find(
      ({ id }) => id === parseInt(paths[paths.length - 1])
    );

    if (jobInModal) {
      return {
        props: {
          metaDescription: `${jobInModal.soc_title}: ${jobInModal.def}`,
          unitName,
          jobTitleAndSocCodePairs,
          hasGpPlusMembership,
        },
      };
    }
  }
  if (paths.length === 6 || paths.length === 4) {
    const targetJobCategories = filterResults(parseInt(paths[0]), paths[1]);
    const jobInModal = targetJobCategories.find(
      ({ id }) => id === parseInt(paths[paths.length - 1])
    );

    if (!jobInModal) {
      const jobCategory = jobVizDataObj.data.find(
        ({ id }) => id === parseInt(paths[paths.length - 2])
      );

      return {
        props: {
          metaDescription: jobCategory.soc_title,
          unitName,
          jobTitleAndSocCodePairs,
          hasGpPlusMembership,
        },
      };
    }

    return {
      props: {
        metaDescription: `${jobInModal.soc_title}: ${jobInModal.def}`,
        unitName,
        jobTitleAndSocCodePairs,
        hasGpPlusMembership,
      },
    };
  }

  return {
    props: {
      metaDescription: null,
      unitName,
      jobTitleAndSocCodePairs,
      hasGpPlusMembership,
    },
  };
};

export default JobVizSearchResults;
