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

import { BsSearch } from "react-icons/bs"
import { Button, Card } from 'react-bootstrap';
import { AiOutlineClose } from 'react-icons/ai'
import getSearchResultsAsync from "../../helperFns/getSearchResults";
import { useCallback, useEffect, useState } from "react";
import SearchResult from "./SearchSec/SearchResult";

const { Title, Body, Header } = Card;

const SearchInputSec = ({ _searchResults, _searchInput, searchInputRef, searchResultsCardRef, _isHighlighterOn }) => {
    const [searchResults, setSearchResults] = _searchResults;
    const [, setForceReRenderer] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchResultsModalOn, setIsSearchResultsModalOn] = useState(false)
    const [searchInput, setSearchInput] = _searchInput;
    const [isHighlighterOn, setIsHighlighterOn] = _isHighlighterOn;

    const rerenderComp = () => {
        setForceReRenderer({});
    }

    const forceUpdate = useCallback(() => rerenderComp(), []);

    const forceUpdateComp = () => {
        forceUpdate()
    }

    const closeSearchResultsModal = () => {
        setIsSearchResultsModalOn(false)
    }

    const handleInput = event => {
        if (event.target.value) {
            setIsLoading(true)
            setSearchInput(event.target.value);
            setIsSearchResultsModalOn(true);
            setTimeout(() => {
                getSearchResultsAsync(event.target.value.toLowerCase())
                    .then(results => {
                        setSearchResults(results);
                        console.log("results attained")
                    })
                    .catch(error => {
                        console.error("Something went wrong: ", error)
                    }).finally(() => {
                        setIsLoading(false)
                    })
            }, 800)
            console.log("loading...")
            return;
        }
        setSearchResults([]);
        setSearchInput("");
        setIsSearchResultsModalOn(false)
        setIsLoading(false)
    }

    const handleCheckBoxChange = event => {
        setIsHighlighterOn(event.target.checked)
    }

    const handleEscapeKey = event => {
        console.log("hey there")
        console.log({ isSearchResultsModalOn })
        if (event.key === "Escape") {
            console.log("closing search results modal")
            closeSearchResultsModal();
        }
    }


    useEffect(() => {
        // when the user search results modal is on the page, if the user presses the escape key, close the modal

        document.addEventListener("keydown", handleEscapeKey);
    }, [])




    return (
        <section className="w-100 pt-5 mt-3 d-flex justify-content-center align-items-center flex-column">
            <section className="d-flex inputSec">
                <section>
                    <input id="searchInputField" value={searchInput} className='border-4 rounded ps-1 pe-1' placeholder='Search Jobs' onChange={handleInput} />
                </section>
                <section className="d-flex justify-content-center align-items-center ps-1">
                    <BsSearch />
                </section>
            </section>
            <section className="min-vw-100 d-flex justify-content-center position-relative">
                {!!isSearchResultsModalOn &&
                    <Card ref={searchResultsCardRef} className="jobSearchResultsCard mt-2">
                        <Header className="position-relative searchResultsHeader d-flex flex-sm-row flex-column">
                            <section className="d-flex flex-column">
                                {!isLoading ?
                                    <Title>
                                        {searchResults?.length ? "Search Results" : "No results"}
                                    </Title>
                                    :
                                    <Title>
                                        Loading...
                                    </Title>
                                }
                                <section className="switchMainContainer d-flex flex-column">
                                    <section>
                                        <span>Highlighter</span>
                                    </section>
                                    <section className="d-flex mt-1">
                                        <div className="switchContainer">
                                            <label className="switch w-100 h-100">
                                                <input
                                                    type="checkbox"
                                                    onChange={handleCheckBoxChange}
                                                    checked={isHighlighterOn}
                                                />
                                                <span className="sliderForBtn round"></span>
                                            </label>
                                        </div>
                                    </section>
                                </section>
                            </section>
                            {/* create a button that will close the modal */}
                            <button
                                className="searchResultsCloseBtn position-absolute top-0 end-0 noBtnStyles"
                                onClick={closeSearchResultsModal}
                            >
                                <AiOutlineClose />
                            </button>
                        </Header>
                        <Body>
                            {isLoading && <div className="d-flex justify-content-center align-items-center w-100 h-100">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                            }
                            {!!searchResults?.length && searchResults.map((result, index) =>
                                <SearchResult
                                    key={index}
                                    result={result}
                                    searchInput={searchInput}
                                    forceUpdateParentComp={forceUpdateComp}
                                    index={index}
                                    setSearchResults={setSearchResults}
                                    _searchInput={[searchInput, setSearchInput]}
                                    isHighlighterOn={isHighlighterOn}
                                />)}
                        </Body>
                    </Card>}
                <div ref={searchInputRef} className="position-absolute w-100 mt-5 jobVizBtnElDeterminer" />
            </section>
        </section>
    )
}

export default SearchInputSec;