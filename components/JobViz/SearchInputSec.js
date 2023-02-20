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
import getSearchResults from "../../helperFns/getSearchResults";
import { useCallback, useRef, useState } from "react";
import getPathsOfSearchResult from "../../helperFns/getPathsOfSearchResult";
import { useRouter } from "next/router";
import SearchResult from "./SearchSec/SearchResult";

const { Title, Body } = Card;

const SearchInputSec = ({ _searchResults }) => {
    const [searchResults, setSearchResults] = _searchResults;
    const inputRef = useRef();
    const [, setForceReRenderer] = useState({});

    const rerenderComp = () => {
        setForceReRenderer({});
    }

    const forceUpdate = useCallback(() => rerenderComp(), []);

    const handleInput = event => {
        const results = getSearchResults(event.target.value);

        if(results.didErr){
            alert("Could not get search results. Refresh the page and try again.");
            return;
        }

        setSearchResults(results);
    }

    const forceUpdateComp = () => {
        inputRef.current.value = "";
        forceUpdate()
    }

    return (
        <section className="w-100 d-flex justify-content-center align-items-center flex-column">
            <section className="d-flex inputSec">
                <section>
                    <input ref={inputRef} className='border-4 rounded ps-1 pe-1' placeholder='Search Jobs' onChange={handleInput} />
                </section>
                <section className="d-flex justify-content-center align-items-center ps-1">
                    <BsSearch />
                </section>
            </section>
            <section className="min-vw-100 border d-flex justify-content-center">
                {/* show the search results in this section, present a card with all of the search results */}
                {!!inputRef?.current?.value &&
                    <Card className="w-75">
                        <Title>{searchResults?.length ? "Search Results" : "No results"}</Title>
                        <Body>
                            {!!searchResults?.length && searchResults.map((result, index) => <SearchResult key={index} result={result} forceUpdateParentComp={forceUpdateComp} />)}
                        </Body>
                    </Card>
                }
            </section>
        </section>
    )
}

export default SearchInputSec;