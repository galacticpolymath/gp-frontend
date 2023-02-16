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

const fetcher = (url) => fetch(url).then((res) => res.json());
// need to get the following when the user is on a dynamic route:
// the current job cards
// the previous job card routes (get the summary for the previous job card)
// at the lowest level, there should be three previous routes that the user can click and go to
// minus the hierarchy number by one until you reach 1. When you reach one, don't compute the difference
// when the user clicks on these routes, the get hierarchy number 

// GOAL #1: get the current job cards when the user clicks on the more jobs (get it in the form of json data)

const JobVizSearchResults = () => {
    const router = useRouter();
    console.log('router?.query: ', router?.query);
    const _jobSearchCriteria = router?.query?.['search-results'] ?? [];
    console.log('_jobSearchCriteria: ', _jobSearchCriteria);
    const [jobSearchCriteria, setJobSearchCriteria] = useState(_jobSearchCriteria);
    const [willGetNewResults, setWillGetNewResults] = useState(true);
    // the params will contain the following: 
    // { jobSearchCriteria: { hierarchy: number, level1: 17-0000 (string number) } }
    // GOAL: the user is on a specific level of the job search
    // send the following to the server: { jobSearchCriteria: { hierarchy: number, level1: 17-0000 (string number) } }
    const { data: jobResults, error, isLoading } = useSWR(`/api/jobVizData/${JSON.stringify(jobSearchCriteria)}`, fetcher);

    

    if (error) {
        // CASE: an error has occurred, take the user to default page of JobViz
        return <JobViz />;
    }

    if (isLoading) {
        console.log('jobResults: ', jobResults);
        // parse the data and pass it into the results
        return <JobViz setWillGetNewResults={setWillGetNewResults} isLoading={isLoading} />;
    }


    return <JobViz setWillGetNewResults={setWillGetNewResults} dynamicJobResults={jobResults} />;
};

export default JobVizSearchResults;
