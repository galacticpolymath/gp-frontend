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
import { useRef } from "react";

const { Title, Body } = Card;

const SearchInputSec = ({ _searchResults }) => {
    const [searchResults, setSearchResults] = _searchResults;
    const inputRef = useRef();

    const handleInput = event => {
        const results = getSearchResults(event.target.value);
        setSearchResults(results);
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
                            {!!searchResults?.length && searchResults.map((result, index) => {
                                const { letter, jobs } = result;
                                return (
                                    <div key={index} className="d-flex justify-content-between align-items-center flex-column border-bottom">
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
                                                        <button className="no-btn-styles">{title}</button>
                                                    </div>
                                                )
                                            })}
                                        </section>
                                    </div>
                                )
                            })}
                        </Body>
                    </Card>
                }
            </section>
        </section>
    )
}

export default SearchInputSec;