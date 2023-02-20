/* eslint-disable no-debugger */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import JobViz from '.';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetJobCategories } from '../../customHooks/useGetJobCategories';
import jobVizData from "../../data/Jobviz/jobVizData.json";



const getParentJobCategories = jobCategoryIds => {
    let _jobVizData = jobVizData.filter(jobCategory => jobCategoryIds.includes(jobCategory.id))
    _jobVizData = _jobVizData.map(job => {
        const { hierarchy, id, title } = job;
        const selectedLevel = job[`level${hierarchy}`]

        return {
            ...job,
            id,
            currentLevel: selectedLevel,
            categoryName: title
        }
    })
    _jobVizData.splice(0, 0, { categoryName: 'Job Categories', 'hierarchyNum': null, 'currentLevel': null })

    return _jobVizData;
}

const JobVizSearchResults = () => {
    const router = useRouter();
    const params = router.query?.['search-results'] ?? null;
    const { _setIsGettingData, jobCategories } = useGetJobCategories(params?.[0] ?? null, params?.[1] ?? null,);
    const [isGettingData, setIsGettingData] = _setIsGettingData
    const [, setForceReRenderer] = useState({});

    const rerenderComp = () => {
        setForceReRenderer({});
        setIsGettingData(true);
    }

    const forceUpdate = useCallback(() => rerenderComp(), []);
    const jobCategoryIds = router.query?.['search-results'] ? router.query?.['search-results'].slice(2) : [];
    const parentJobCategories = useMemo(() => getParentJobCategories(jobCategoryIds.map(id => parseInt(id))), [params])
    const vals = { dynamicJobResults: jobCategories, currentHierarchyNum: (params?.[0] && parseInt(params?.[0])) ?? 1, parentJobCategories: parentJobCategories }


    JobVizSearchResults.getInitialProps = async () => {
        return {};
    }




    return isGettingData ? <JobViz vals={{ isLoading: true }} /> : <JobViz vals={vals} />;
};

export default JobVizSearchResults;
