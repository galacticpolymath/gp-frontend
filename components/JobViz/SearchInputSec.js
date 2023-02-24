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

const SearchInputSec = ({ _searchResults, _searchInput, searchInputRef }) => {
    const [searchResults, setSearchResults] = _searchResults;
    const [, setForceReRenderer] = useState({});
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
        if (event.target.value) {
            getSearchResultsAsync(event.target.value.toLowerCase())
                .then(results => {
                    setSearchResults(results);
                    setSearchInput(event.target.value);
                })
                .catch(error => {
                    console.error("Something went wrong: ", error)
                }).finally(() => {

                })
            return;
        }
        setSearchResults([]);
        setSearchInput("");
    }

    // if there are results and if there is user input, show the scroll up button (set isScrollToInputBtnVisible to true)
    // if the input section is not visible and if there is search input, still show the scrollToInputBtn



    return (
        <section className="w-100 d-flex justify-content-center align-items-center flex-column">
            <section className="d-flex inputSec">
                <section>
                    <input ref={searchInputRef} id="searchInputField" className='border-4 rounded ps-1 pe-1' placeholder='Search Jobs' onChange={handleInput} />
                </section>
                <section className="d-flex justify-content-center align-items-center ps-1">
                    <BsSearch />
                </section>
            </section>
            <section className="min-vw-100 d-flex justify-content-center">
                {/* show the search results in this section, present a card with all of the search results */}
                {/* comment for testing */}
                {!!searchInput &&
                    <Card className="jobSearchResultsCard mt-2">
                        <Header>
                            <Title>{searchResults?.length ? "Search Results" : "No results"}</Title>
                        </Header>
                        <Body>
                            {!!searchResults?.length && searchResults.map((result, index) => <SearchResult key={index} result={result} searchInput={searchInput} forceUpdateParentComp={forceUpdateComp} index={index} />)}
                        </Body>
                    </Card>}

                {/* FOR TESTING PURPOSES ONLY, UNCOMMENT FOR TESTING */}
                {/* <Card className="w-75">
                    <Title>{searchResults?.length ? "Search Results" : "No results"}</Title>
                    <Body>
                        {!!searchResults?.length && searchResults.map((result, index) => <SearchResult key={index} result={result} forceUpdateParentComp={forceUpdateComp} />)}
                    </Body>
                </Card> */}
            </section>
        </section>
    )
}

export default SearchInputSec;