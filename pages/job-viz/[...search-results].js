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
import filterResults from '../../helperFns/filterResults';



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
    console.log('metaDescription bacon sup: ', metaDescription)
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
    const [willCheckParamsAgain, setWillCheckParamsAgain] = useState(false)

    useEffect(() => {
        console.log("params: ", params)
        const jobCategoryIds = params?.slice(2);
        let hierarchyNum = params?.[0]

        console.log({ jobCategoryIds: jobCategoryIds?.length, hierarchyNum: hierarchyNum })

        if (parseInt(hierarchyNum) === jobCategoryIds?.length) {
            let lastJobCategoryId = params?.[params.length - 1]
            const targetJobCategory = jobVizDataObj.data.find(jobCategory => jobCategory.id === parseInt(lastJobCategoryId))
            setSelectedJob(targetJobCategory)
            return;
        }

        setWillCheckParamsAgain(true)

    }, [])

    useEffect(() => {
        console.log("metaDescription: ", metaDescription)
    }, [metaDescription])

    useEffect(() => {

        if (willCheckParamsAgain) {
            let jobCategoryIds = params?.slice(2);

            if (jobCategoryIds?.length === 0 || !jobCategoryIds?.length) {
                let pathsSplitted = window.location.pathname.split('/')
                pathsSplitted.splice(0, 2)
                const jobCategoryPaths = pathsSplitted.slice(2)

                if (parseInt(pathsSplitted[0]) === jobCategoryPaths?.length) {
                    let lastJobCategoryId = jobCategoryPaths?.[jobCategoryPaths.length - 1]
                    const targetJobCategory = jobVizDataObj.data.find(jobCategory => jobCategory.id === parseInt(lastJobCategoryId))
                    setSelectedJob(targetJobCategory)
                }

            }
            setWillCheckParamsAgain(false)
        }

    }, [willCheckParamsAgain])






    return <JobViz vals={vals} />;
};

export const getServerSideProps = async (context) => {
    let paths = context.resolvedUrl.split('/');
    // delete the first two element from paths
    paths.splice(0, 2)
    console.log('paths: ', paths)

    if ((paths.length === 5) && (paths[paths.length - 1] === paths[paths.length - 2])) {
        const targetJob = jobVizDataObj.data.find(({ id }) => id === parseInt(paths[paths.length - 1]))
        return {
            props: { metaDescription: targetJob.soc_title }
        }
    }

    // if the last number is in the jobCategories, then a modal is on the screen

    if (paths.length === 5) {
        const targetJobCategories = filterResults(parseInt(paths[0]), paths[1])
        const jobInModal = targetJobCategories.find(({ id }) => id === parseInt(paths[paths.length - 1]))

        if (jobInModal) return {
            props: { metaDescription: jobInModal.def }
        }

    }



    // the user has the follwing in the url: A/B/C, each letter is a number
    // if c is in targetJobCategories, then a modal is on the screen 
    // if c is the same as the b, then a modal is on the screen 
    // else, the user is three levels deep with no modal on the screen

    // CASE: c is in the targetJobCategories
    // GOAL: get the description of the selected job and pass it as the metaDescription
    // the description of the selected job is attained 
    // the target job is found from the json file that has all of the job categories using the id of the 
    // target job
    // all of the job categories are attained from the json file
    // get all of the job categories for the current level (using the first number as the targetHierarchyNum 
    // and the second number as the selectedLevel, using the function filterResults)
    // B) check if the selected job is in the job categories array
    // not A 
    // A) check if the second number is the same as the last number 
    // get the last number in the paths array that will the id of the target job 


    return {
        props: { metaDescription: "" }
    }
}

export default JobVizSearchResults;
