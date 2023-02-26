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
import { useContext } from "react";
import { getPathsOfSearchResult } from "../../../helperFns/getPathsOfSearchResult";
import { ModalContext } from "../../../providers/ModalProvider";
import Highlighter from "react-highlight-words";



const SearchResult = ({ result, forceUpdateParentComp, index, _searchInput, setSearchResults, isHighlighterOn }) => {
    const { _selectedJob } = useContext(ModalContext);
    const [, setSelectedJob] = _selectedJob;
    const [searchInput, setSearchInput] = _searchInput;
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
        setSearchResults([])
        setSearchInput("")
    }

    return (
        <div key={`${index}_searchResultGroup`} className="d-flex justify-content-between align-items-center flex-column">
            <section className={`w-100 ${(index !== 0) ? 'border-top' : ''} border-bottom`}>
                <h5 className="ms-sm-3 searchResultHeaderTxt text-center text-sm-start fw-bold fst-italic display-6 ">{letter}</h5>
            </section>
            <section className="w-100 jobVizSearchResultsSec ps-3 pt-3 pb-5 pe-3">
                {jobs.map(job => {
                    const { title, id } = job;
                    return (
                        <div key={id} id={`${id}_searchResult`} className="searchResultJob d-inline-flex w-100">
                            <button id={`${id}_searchResult_btn`} onClick={() => handleBtnClick(job)} className="no-btn-styles text-center w-100">
                                {isHighlighterOn ?
                                    <Highlighter
                                        highlightClassName="searchResultHighlight"
                                        searchWords={[searchInput]}
                                        autoEscape={true}
                                        textToHighlight={title}
                                    />
                                    :
                                    <span>
                                        {title}
                                    </span>
                                }
                            </button>
                        </div>
                    )
                })}
            </section>
        </div>
    )
}

export default SearchResult;

