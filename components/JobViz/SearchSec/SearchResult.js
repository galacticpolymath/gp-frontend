/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable quotes */
 
/* eslint-disable react/jsx-wrap-multilines */
 
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
 
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import { useRouter } from "next/router";
import { useContext } from "react";
import { getPathsOfSearchResult } from "../../../helperFns/getPathsOfSearchResult";
import { ModalContext } from "../../../providers/ModalProvider";
import Highlighter from "react-highlight-words";



const SearchResult = ({ result, forceUpdateParentComp, index, _searchInput, setSearchResults, isHighlighterOn, closeSearchResultsModal }) => {
    const { _selectedJob } = useContext(ModalContext);
    const [, setSelectedJob] = _selectedJob;
    const [searchInput, setSearchInput] = _searchInput;
    const { letter, jobs } = result;
    const router = useRouter();

    const handleBtnClick = jobCategory => {
        const currentPath = router.pathname
        const paths = getPathsOfSearchResult(jobCategory);

        router.push({ pathname: `/jobviz${paths}` }, null, { scroll: false })

        if (currentPath !== "/jobviz") {
            forceUpdateParentComp()
        }

        setSelectedJob(jobCategory);
        setSearchResults([])
        setSearchInput("")
        closeSearchResultsModal()
    }

    return (
        <div key={`${index}_searchResultGroup`} className={`d-flex justify-content-between align-items-center position-relative border-bottom flex-sm-row flex-column`}>
            <h5 className="ms-sm-3 searchResultHeaderTxt text-center text-sm-start fw-bold fst-italic display-6 position-absolute top-0 d-sm-block d-none">{letter}</h5>
            <section className="d-sm-none d-flex w-100 p-0">
                <h5 className="w-100 m-0">
                    {letter}
                </h5>
            </section>
            <section className="w-100 jobVizSearchResultsSec ps-sm-5 pt-2 pb-5 pe-sm-3">
                <ul className="w-100 h-100 jobVizSearchResultsSecUl">
                    {jobs.map(job => {
                        const { title, id } = job;
                        return (
                            <li key={id} id={`${id}_searchResult`} className="searchResultJob">
                                <button id={`${id}_searchResult_btn`} onClick={() => handleBtnClick(job)} className="no-btn-styles w-100 text-start">
                                    {isHighlighterOn ?
                                        <Highlighter
                                            highlightClassName="searchResultHighlight searchResultTitle"
                                            searchWords={[searchInput]}
                                            autoEscape={true}
                                            textToHighlight={title}
                                        />
                                        :
                                        <span className="searchResultTitle">
                                            {title}
                                        </span>
                                    }
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </section>
        </div>
    )
}

export default SearchResult;

