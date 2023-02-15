/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import JobViz from '.';
import jobVizData from '../../data/Jobviz/jobVizData.json';

export const getStaticProps = async ({ params }) => {
    console.log('params:', params);
    return {
        props: {
            startingSearchResults: jobVizData
        }
    };
};

const JobVizSearchResults = () => {
    return <JobViz />; 
};

export default JobVizSearchResults;
