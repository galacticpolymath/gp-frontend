/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import JobViz from '.';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const JobVizSearchResults = () => {
    console.log(useSWR);

    // put the params in the path
    const { data, error } = useSWR('/api/jobVizData/{"data": "data"}', fetcher);

    if(data){
        console.log('data: ', JSON.parse(data));
    }
    console.log('error: ', error);

    return <JobViz />;
};

export default JobVizSearchResults;
