/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import { useRouter } from "next/router";
import { useCallback, useContext, useState } from "react";
import getPathsOfSearchResult from "../../../helperFns/getPathsOfSearchResult";
import { ModalContext } from "../../../providers/ModalProviders";



const SearchResult = ({ result, forceUpdateParentComp }) => {
    const { _isJobInfoModalOn, _selectedJob } = useContext(ModalContext);
    const [, setIsJobInfoModalOn] = _isJobInfoModalOn;
    const [, setSelectedJob] = _selectedJob;
    const { letter, jobs } = result;
    const router = useRouter();

    const handleBtnClick = jobCategory => {
        const currentPath = router.pathname
        const paths = getPathsOfSearchResult(jobCategory);

        router.push({ pathname: `/job-viz${paths}` }, null, { scroll: false })

        if (currentPath !== "/job-viz") {
            forceUpdateParentComp()
        }

        setSelectedJob(jobCategory);
    }

    return (
        <div className="d-flex justify-content-between align-items-center flex-column border-bottom">
            <section>
                <div>
                    <h5>{letter}</h5>
                </div>
            </section>
            <section>
                {jobs.map(job => {
                    const { title, id } = job;
                    return (
                        <div key={id} className="searchResultJob">
                            <button onClick={() => handleBtnClick(job)} className="no-btn-styles">{title}</button>
                        </div>
                    )
                })}
            </section>
        </div>
    )
}

export default SearchResult;

