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
import { getPathsOfSearchResult } from "../../../helperFns/getPathsOfSearchResult";
import { ModalContext } from "../../../providers/ModalProvider";



const SearchResult = ({ result, forceUpdateParentComp }) => {
    const { _selectedJob } = useContext(ModalContext);
    console.log("_selectedJob: ", _selectedJob)
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
        <div className="d-flex justify-content-between align-items-center flex-column">
            <section className="w-100">
                <h5 className="ms-3 searchResultHeaderTxt fst-italic display-6">{letter}</h5>
            </section>
            <section className="w-100 jobVizSearchResultsSec ps-3 pt-3 pb-5 pe-3">
                {jobs.map(job => {
                    const { title, id } = job;
                    return (
                        <div key={id} id={`${id}_searchResult`} className="searchResultJob d-inline-flex w-100">
                            <button id={`${id}_searchResult_btn`} onClick={() => handleBtnClick(job)} className="no-btn-styles text-center w-100">{title}</button>
                        </div>
                    )
                })}
            </section>
        </div>
    )
}

export default SearchResult;

