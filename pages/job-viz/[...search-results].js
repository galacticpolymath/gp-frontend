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
import { useState } from 'react';



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

const JobVizSearchResults = ({ metaDescription }) => {
    const router = useRouter();
    const { _selectedJob } = useContext(ModalContext)
    const [, setSelectedJob] = _selectedJob;
    const params = router.query?.['search-results'] ?? null;
    const hierarchyNum = params?.[0] ?? null
    let { jobCategories } = useGetJobCategories(hierarchyNum, params?.[1] ?? null,);
    let jobCategoryIds = router.query?.['search-results'] ? router.query?.['search-results'].slice(2) : [];
    (jobCategoryIds.length === parseInt(hierarchyNum)) && jobCategoryIds.pop()
    const parentJobCategories = useMemo(() => getParentJobCategories(jobCategoryIds.map(id => parseInt(id))), [params])
    const vals = { dynamicJobResults: jobCategories, currentHierarchyNum: (hierarchyNum && parseInt(hierarchyNum)) ?? 1, parentJobCategories: parentJobCategories }


    JobVizSearchResults.getInitialProps = async () => {
        return {};
    }

    const [willCheckParamsAgain, setWillCheckParamsAgain] = useState(false)

    useEffect(() => {
        console.log("params: ", params)
        const jobCategoryIds = params?.slice(2);
        let hierarchyNum = params?.[0]

        console.log({ jobCategoryIds: jobCategoryIds?.length, hierarchyNum: hierarchyNum })
        
        if(parseInt(hierarchyNum) === jobCategoryIds?.length){
            let lastJobCategoryId = params?.[params.length - 1]
            const targetJobCategory = jobVizDataObj.data.find(jobCategory => jobCategory.id === parseInt(lastJobCategoryId))
            setSelectedJob(targetJobCategory)
            return;
        } 

        setWillCheckParamsAgain(true)

    },[])

    useEffect(() => {

        if(willCheckParamsAgain){
            let jobCategoryIds = params?.slice(2);

            if(jobCategoryIds?.length === 0 || !jobCategoryIds?.length){
                let pathsSplitted = window.location.pathname.split('/')
                pathsSplitted.splice(0, 2)
                const jobCategoryPaths = pathsSplitted.slice(2)

                if(parseInt(pathsSplitted[0]) === jobCategoryPaths?.length){
                    let lastJobCategoryId = jobCategoryPaths?.[jobCategoryPaths.length - 1]
                    const targetJobCategory = jobVizDataObj.data.find(jobCategory => jobCategory.id === parseInt(lastJobCategoryId))
                    setSelectedJob(targetJobCategory)
                }
                
            }
            setWillCheckParamsAgain(false) 
        }

    },[willCheckParamsAgain])






    return <JobViz vals={vals} />;
};

// JobVizSearchResults.getInitialProps = async (context) => {
//     console.log('context.req.url: ', context.req.url)
//     const currentPaths = context.req.url.split('/')

//     // z = the id of the selected job that is displayed in the modal

//     // CASE: the user is two levels deep, with a modal on the screen: /job-viz/3/17-2000/A/B/Z
    

//     // CASE: the user is one level deep with modal on the screen: /job-viz/3/17-2000/A/Z

//     // CASE: the user is three levels deep with a modal on the screen: /A/B/C/Z
//     // the target job is attained by using the z id of the selected job
//     // get the number last number of the array, this will be the id of the selected job that is displayed 
//     // in the modal 
//     // a job modal is being displayed on the screen 
//     // there are 


//     // PROBLEM: there is an overlap between a selected job in two levels deep (A/B/Z) and the user just being 
//     // at the fourth level of the job viz page (A/B/C)

//     return {
//         props: { metaDescription: "" }
//     }
// }

export default JobVizSearchResults;
