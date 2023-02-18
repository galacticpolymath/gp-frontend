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
import { useEffect, useState } from 'react';
import { useGetJobCategories } from '../../customHooks/useGetJobCategories';

const fetcher = (url) => fetch(url).then((res) => res.json());
// need to get the following when the user is on a dynamic route:
// the current job cards
// the previous job card routes (get the summary for the previous job card)
// at the lowest level, there should be three previous routes that the user can click and go to
// minus the hierarchy number by one until you reach 1. When you reach one, don't compute the difference
// when the user clicks on these routes, the get hierarchy number 

// GOAL #1: get the current job cards when the user clicks on the more jobs (get it in the form of json data)

// const { data: jobResults, error, isLoading } = useSWR(`/api/jobVizData/${JSON.stringify(jobSearchCriteria)}`, fetcher);

const getJobs = async jobSearchCriteria => {
    const response = await fetch(`/api/jobVizData/${JSON.stringify(jobSearchCriteria)}`);
    const data = await response.json();
    return data;
};

const JobVizSearchResults = () => {
    const router = useRouter();
    const params = router.query?.['search-results'] ?? null;
    console.log("params first: ", params?.[0]);
    const { isGettingData, getNewJobsData, jobCategories, parentJobCategories } = useGetJobCategories(params?.[0] ?? null, params?.[1] ?? null);
    const fns = { getNewJobsData: getNewJobsData };
    const vals = { dynamicJobResults: jobCategories, currentLevelNum: (params?.[0] && parseInt(params?.[0])) ?? 1, parentJobCategories }

    JobVizSearchResults.getInitialProps = async () => {
        return {};
    }



    return isGettingData ? <JobViz vals={{ isLoading: true }} /> : <JobViz fns={fns} vals={vals} />;
};

export default JobVizSearchResults;
