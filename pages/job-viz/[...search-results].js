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
import { useRouter } from 'next/router';
import { useContext, useMemo } from 'react';
import { useGetJobCategories } from '../../customHooks/useGetJobCategories';
import jobVizDataObj from "../../data/Jobviz/jobVizDataObj.json";
import { useEffect } from 'react';
import { ModalContext } from '../../providers/ModalProvider';



const getParentJobCategories = jobCategoryIds => {
    let _jobVizData = jobVizDataObj.data.filter(jobCategory => jobCategoryIds.includes(jobCategory.id))
    _jobVizData = _jobVizData.map(job => {
        const { hierarchy, id, soc_title } = job;
        const selectedLevel = job[`level${hierarchy}`]

        return {
            ...job,
            id,
            currentLevel: selectedLevel,
            categoryName: soc_title
        }
    })
    _jobVizData.splice(0, 0, { categoryName: 'Job Categories', 'hierarchyNum': null, 'currentLevel': null })

    return _jobVizData;
}

const JobVizSearchResults = () => {
    const router = useRouter();
    const { _selectedJob } = useContext(ModalContext)
    const [, setSelectedJob] = _selectedJob;
    const params = router.query?.['search-results'] ?? null;
    const { jobCategories } = useGetJobCategories(params?.[0] ?? null, params?.[1] ?? null,);
    const jobCategoryIds = router.query?.['search-results'] ? router.query?.['search-results'].slice(2) : [];
    const parentJobCategories = useMemo(() => getParentJobCategories(jobCategoryIds.map(id => parseInt(id))), [params])

    console.log("parentJobCategories: ", parentJobCategories)

    const vals = { dynamicJobResults: jobCategories, currentHierarchyNum: (params?.[0] && parseInt(params?.[0])) ?? 1, parentJobCategories: parentJobCategories }


    JobVizSearchResults.getInitialProps = async () => {
        return {};
    }

    useEffect(() => {
        console.log("params: ", params)
        const jobCategoryIds = params?.slice(2);
        let hierarchyNum = params?.[0]
        
        if(parseInt(hierarchyNum) === jobCategoryIds?.length){
            let lastJobCategoryId = params?.[params.length - 1]
            const targetJobCategory = jobVizDataObj.data.find(jobCategory => jobCategory.id === parseInt(lastJobCategoryId))
            setSelectedJob(targetJobCategory)
        }

    },[])






    return <JobViz vals={vals} />;
};

export default JobVizSearchResults;
