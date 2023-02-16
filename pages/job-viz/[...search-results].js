/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import JobViz from '.';
import useSWR from 'swr';
import { useRouter } from 'next/router';

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
    const jobSearchCriteria = router?.query?.['search-results'] ?? [];
    
    // console.log('router?.query: ', router?.query);
    // const [hierarchyNum, level1] = router?.query ?? [];
    // let jobSearchCriteria = {};

    // if (hierarchyNum && level1) {
    //     jobSearchCriteria = { hierarchy: hierarchyNum, level1: level1 };
    // }

    // the params will contain the following: 
    // { jobSearchCriteria: { hierarchy: number, level1: 17-0000 (string number) } }
    // GOAL: the user is on a specific level of the job search
    // send the following to the server: { jobSearchCriteria: { hierarchy: number, level1: 17-0000 (string number) } }
    const { data, error } = useSWR(`/api/jobVizData/${JSON.stringify(jobSearchCriteria)}`, fetcher);

    if (error) {
        // CASE: an error has occurred, take the user to default page of JobViz
        return <JobViz />;
    }

    if (data) {
        console.log('data: ', data);
        // parse the data and pass it into the results
    }


    console.log('error: ', error);

    return <JobViz />;
};

export default JobVizSearchResults;