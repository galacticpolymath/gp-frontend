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
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import { useRouter } from "next/router";
import { IoNewspaperOutline } from 'react-icons/io5';
import jobVizData from '../../data/Jobviz/jobVizData.json';
import { useMemo } from "react";


const startingJobResults = jobVizData.filter(jobCategory => jobCategory.hierarchy === 1).map(jobCategory => ({ ...jobCategory, currentLevel: jobCategory.level1 }))

const sortJobResults = jobResults => {
    return jobResults.sort((jobA, jobB) => {
        const _jobA = jobA.title.toUpperCase();
        const _jobB = jobB.title.toUpperCase();

        return (_jobA === _jobB) ? 0 : ((_jobA > _jobB) ? 1 : -1);
    })
}


const JobCategories = ({ dynamicJobResults, currentLevelNum, isLoading, getNewJobsData }) => {
    const router = useRouter();
    let jobResults = dynamicJobResults ?? startingJobResults;
    jobResults = useMemo(() => sortJobResults(jobResults), dynamicJobResults)

    const handleBtnClick = level => {
        console.log('level: ', level);
        const _currentLevelNum = (currentLevelNum + 1)
        router.push(`/job-viz/${_currentLevelNum}/${level}`)
        getNewJobsData && getNewJobsData(_currentLevelNum, level);
    }

    return (
        <section className="pt-3 d-flex justify-content-center align-items-center">
            <div className="jobCategoriesSec">
                {/* display the default search results */}
                {!jobResults ?
                    <span>Loading results...</span>
                    :
                    jobResults.map(({ title, id, currentLevel, occupation_type }) => (
                        <div id={id} key={id} className="shadow jobFieldStartingResult d-inline-block flex-column">
                            <section className="w-100 h-50 d-flex justify-content-center align-items-center">
                                <h4 className="text-center">{title}</h4>
                            </section>
                            <section className="w-100 h-50 d-flex justify-content-center align-items-center">
                                {(occupation_type === "Line item") ?
                                    <Button id={`details_btn_${id}`} className="d-flex justify-content-center align-items-center">
                                        <span className="w-25 h-100 d-flex justify-content-center align-items-center">
                                            <IoNewspaperOutline />
                                        </span>
                                        <span className="w-75 h-100 d-flex justify-content-center align-items-center ps-1">
                                            Details
                                        </span>
                                    </Button>
                                    :
                                    <Button id={`${id}_btn_more_jobs`} className="d-flex job-categories-btn shadow" onClick={() => handleBtnClick(currentLevel)}>
                                        <AccountTreeIcon /> More Jobs
                                    </Button>

                                }
                            </section>
                        </div>
                    )
                    )}
            </div>
        </section>
    );
};

export default JobCategories;