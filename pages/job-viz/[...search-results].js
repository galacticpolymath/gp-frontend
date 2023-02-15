/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import JobViz from '.';
import jobVizData from '../../data/Jobviz/jobVizData.json';

const JobVizSearchResults = () => {
    return <JobViz />;
};

export const getStaticProps = async ({ params }) => {
    console.log('params:', params);
    return {
        props: {
            startingSearchResults: jobVizData
        }
    };
};

export async function getStaticPaths() {
    return {
        paths: [{ params: { 'search-results': '1' } }],
        fallback: false, // can also be true or 'blocking'
    };
}

export default JobVizSearchResults;
