 

 

 
 
 
 
 
 
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
import { useSearchParams } from "next/navigation";


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
    const searchParamsStr = useSearchParams().toString();
    const { _selectedJob } = useContext(ModalContext);
    const [, setSelectedJob] = _selectedJob;
    let jobResults = dynamicJobResults ?? startingJobResults;
    jobResults = useMemo(() => sortJobResults(jobResults), [dynamicJobResults])

    const handleMoreJobsBtnClick = (level, currentJobsCategoryId) => {
        const nextLevelHierarchyNum = (currentHierarchyNum + 1)

        console.log('router object: ', router)

        const { query, pathname } = router;

        resetSearch()

        if (pathname == '/jobviz') {
            const baseUrl = `${window.location.origin}/jobviz/${nextLevelHierarchyNum}/${level}/${currentJobsCategoryId}`
            const urlUpdated = searchParamsStr.length ? `${baseUrl}?${searchParamsStr}` : baseUrl;
            router.push(urlUpdated, null, { scroll: false, shallow: true })
            return;
        }

        console.log('query: ', query);

        // TODO: handle the following case: the search-results parameter is not present in the url

        let jobCategoryIds = [...query[`search-results`]]
        jobCategoryIds.splice(0, 2)
        jobCategoryIds.push(currentJobsCategoryId)
        const baseUrl = `${window.location.origin}/jobviz/${nextLevelHierarchyNum}/${level}/${jobCategoryIds.join('/')}`
        const urlUpdated = searchParamsStr.length ? `${baseUrl}?${searchParamsStr}` : baseUrl;

        router.push(urlUpdated, null, { scroll: false, shallow: true })
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
                                                searchParams={searchParamsStr}
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
