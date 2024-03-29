/* eslint-disable react/jsx-indent-props */
/* eslint-disable no-debugger */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */
import { Button } from "react-bootstrap";
import { MdAccountTree } from "react-icons/md";
import { useRouter } from "next/router";
import { IoNewspaperOutline } from 'react-icons/io5';
import jobVizDataObj from '../../data/Jobviz/jobVizDataObj.json';
import { useMemo } from "react";
import { useContext } from 'react';
import { ModalContext } from "../../providers/ModalProvider";
import { getJobCategoryIds } from '../../helperFns/getJobCategoryIds';
import DetailsBtn from "./Buttons/Details";


const startingJobResults = jobVizDataObj.data.filter(jobCategory => jobCategory.hierarchy === 1).map(jobCategory => ({ ...jobCategory, currentLevel: jobCategory.level1 }))


const sortJobResults = jobResults => {
    return jobResults.sort((jobA, jobB) => {
        const _jobA = jobA.title.toUpperCase();
        const _jobB = jobB.title.toUpperCase();

        return (_jobA === _jobB) ? 0 : ((_jobA > _jobB) ? 1 : -1);
    })
}


const JobCategoriesSec = ({ dynamicJobResults, currentHierarchyNum, resetSearch }) => {
    const router = useRouter();
    const { _selectedJob } = useContext(ModalContext);
    const [, setSelectedJob] = _selectedJob;
    let jobResults = dynamicJobResults ?? startingJobResults;
    jobResults = useMemo(() => sortJobResults(jobResults), [dynamicJobResults])

    const handleMoreJobsBtnClick = (level, currentJobsCategoryId) => {
        const nextLevelHierarchyNum = (currentHierarchyNum + 1)
        const { query, asPath } = router;

        resetSearch()

        if (asPath == '/jobviz') {
            router.push({ pathname: `/jobviz/${nextLevelHierarchyNum}/${level}/${currentJobsCategoryId}` }, null, { scroll: false })
            return;
        }

        let jobCategoryIds = [...query[`search-results`]]
        jobCategoryIds.splice(0, 2)
        jobCategoryIds.push(currentJobsCategoryId)
        const pathUpdated = `/jobviz/${nextLevelHierarchyNum}/${level}/${jobCategoryIds.join('/')}`

        router.push({ pathname: pathUpdated }, null, { scroll: false })
    }

    const handleDetailsBtnClick = (jobToShowInModal) => {
        const jobCategoryIdPaths = getJobCategoryIds(router.query['search-results'], jobToShowInModal.id.toString())
        const pathUpdated = `/jobviz/${currentHierarchyNum}/${router.query['search-results'][1]}/${jobCategoryIdPaths.join('/')}`
        router.push({ pathname: pathUpdated }, null, { scroll: false })
        setSelectedJob(jobToShowInModal)
    }


    return (
        <section className="pt-sm-3 d-flex justify-content-center align-items-center">
            <div className="jobCategoriesSec">
                {!jobResults ?
                    <span>Loading results...</span>
                    :
                    <div>
                        {jobResults.map(job => {
                            const { title, id, currentLevel, occupation_type } = job;
                            return (
                                <div id={id} key={id} className="shadow jobFieldStartingResult d-inline-block flex-column">
                                    <section className="w-100 h-50 d-flex justify-content-center align-items-center">
                                        <h4 id="currentJobCategory" className="text-center ps-2 pe-2 pt-3">{title}</h4>
                                    </section>
                                    <section className="w-100 h-50 d-flex justify-content-center align-items-center">
                                        {(occupation_type === "Line item") ?
                                            <DetailsBtn 
                                                jobToShowInModal={job}
                                                setSelectedJob={setSelectedJob}
                                                id={`${id}_btn_more_jobs`}
                                            />
                                            :
                                            <Button id={`${id}_btn_more_jobs`} className="d-flex job-categories-btn moreJobsBtn shadow" onClick={() => handleMoreJobsBtnClick(currentLevel, id)}>
                                                <span className="d-inline-flex justify-content-center align-items-center h-100">
                                                    <MdAccountTree />
                                                </span>
                                                <span className="d-inline-flex ms-1 justify-content-center align-items-center h-100">
                                                    More Jobs
                                                </span>
                                            </Button>
                                        }
                                    </section>
                                </div>
                            )
                        })}
                    </div>
                }
            </div>
        </section>
    );
};

export default JobCategoriesSec;