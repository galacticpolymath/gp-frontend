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
import getSearchResultsAsync from "../../helperFns/getSearchResults";
import { useCallback, useEffect, useRef, useState } from "react";
import getPathsOfSearchResult from "../../helperFns/getPathsOfSearchResult";
import { useRouter } from "next/router";
import SearchResult from "./SearchSec/SearchResult";
import jobVizData from '../../data/Jobviz/jobVizData.json'

const { Title, Body, Header } = Card;

const SearchInputSec = ({ _searchResults, _searchInput, searchInputRef, searchResultsCardRef }) => {
    const [searchResults, setSearchResults] = _searchResults;
    const [, setForceReRenderer] = useState({});
    const [isLoading, setIsLoading] = useState(false)
    const [searchInput, setSearchInput] = _searchInput

    const rerenderComp = () => {
        setForceReRenderer({});
    }

    const forceUpdate = useCallback(() => rerenderComp(), []);

    const forceUpdateComp = () => {
        forceUpdate()
    }

    // FOR TESTING PURPOSES ONLY, UNCOMMENT FOR TESTING
    // useEffect(() => {
    //     console.log("hello there")
    //     let groupedSearchResults = [];

    //     jobVizData.forEach(job => {
    //         const firstLetter = job.title[0];

    //         if (groupedSearchResults.length === 0) {
    //             groupedSearchResults.push({ letter: firstLetter, jobs: [job] });
    //             return
    //         }

    //         const targetGroup = groupedSearchResults.find(({ letter }) => letter === firstLetter);

    //         if (targetGroup) {
    //             targetGroup.jobs.push(job);
    //             const targetGroupIndex = groupedSearchResults.findIndex(({ letter }) => letter === firstLetter);
    //             groupedSearchResults.splice(targetGroupIndex, 1, targetGroup);
    //             return
    //         }

    //         groupedSearchResults.push({ letter: firstLetter, jobs: [job] });
    //     })


    //     setSearchResults(groupedSearchResults)
    // }, [])

    const handleInput = event => {
        setIsLoading(true)
        setSearchInput(event.target.value);
        if (event.target.value) {
            setTimeout(() => {
                getSearchResultsAsync(event.target.value.toLowerCase())
                    .then(results => {
                        setSearchResults(results);
                    })
                    .catch(error => {
                        console.error("Something went wrong: ", error)
                    }).finally(() => {
                        setIsLoading(false)
                    })
            }, 800)
            return;
        }
        setSearchResults([]);
        setSearchInput("");
        setIsLoading(false)
    }

    // if there are results and if there is user input, show the scroll up button (set isScrollToInputBtnVisible to true)
    // if the input section is not visible and if there is search input, still show the scrollToInputBtn



    return (
        <section className="w-100 pt-5 mt-3 d-flex justify-content-center align-items-center flex-column">
            <section className="d-flex inputSec">
                <section>
                    <input id="searchInputField" className='border-4 rounded ps-1 pe-1' placeholder='Search Jobs' onChange={handleInput} />
                </section>
                <section className="d-flex justify-content-center align-items-center ps-1">
                    <BsSearch />
                </section>
            </section>
            <section className="min-vw-100 d-flex justify-content-center position-relative">
                {/* show the search results in this section, present a card with all of the search results */}
                {/* comment for testing */}
                {!!searchInput &&
                    <Card ref={searchResultsCardRef} className="jobSearchResultsCard mt-2">
                        <Header className="position-relative searchResultsHeader d-flex flex-sm-row flex-column">
                            {!isLoading ?
                                <Title>
                                    {searchResults?.length ? "Search Results" : "No results"}
                                </Title>
                                :
                                <Title>
                                    Loading...
                                </Title>
                            }
                            {/* <div className="switchMainContainer d-flex flex-column">
                                <section>
                                    <span>Highlighter</span>
                                </section>
                                <section className="d-flex mt-2 mt-sm-0 justify-content-sm-center align-items-sm-center">
                                    <div className="switchContainer">
                                        <label className="switch w-100 h-100">
                                            <input type="checkbox" />
                                            <span className="sliderForBtn round"></span>
                                        </label>
                                    </div>
                                </section>
                            </div> */}
                        </Header>
                        <Body>
                            {isLoading && <div className="d-flex justify-content-center align-items-center w-100 h-100">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                            }
                            {!!searchResults?.length && searchResults.map((result, index) => <SearchResult key={index} result={result} searchInput={searchInput} forceUpdateParentComp={forceUpdateComp} index={index} setSearchResults={setSearchResults} _searchInput={[searchInput, setSearchInput]} />)}
                        </Body>
                    </Card>}

                {/* FOR TESTING PURPOSES ONLY, UNCOMMENT FOR TESTING */}
                {/* <Card className="w-75">
                    <Title>{searchResults?.length ? "Search Results" : "No results"}</Title>
                    <Body>
                        {!!searchResults?.length && searchResults.map((result, index) => <SearchResult key={index} result={result} forceUpdateParentComp={forceUpdateComp} />)}
                    </Body>
                </Card> */}
                <div ref={searchInputRef} className="position-absolute w-100 mt-5 jobVizBtnElDeterminer" />
            </section>
        </section>
    )
}

export default SearchInputSec;