import { BsSearch } from "react-icons/bs";
import { Card } from "react-bootstrap";
import getSearchResultsAsync from "../../helperFns/getSearchResults";
import { useCallback, useEffect, useState } from "react";
import SearchResult from "./SearchSec/SearchResult";
import HighlighterComp from "./SearchSec/HighlighterComp";
import CloseSearchResultsJobViz from "./Buttons/CloseSearchResultsJobViz";

const { Title, Body, Header } = Card;

const SearchInputSec = ({
  _searchResults,
  _searchInput,
  searchInputRef,
  _isHighlighterOn,
  _isSearchResultsModalOn,
  searchParamsStr
}) => {
  const [searchResults, setSearchResults] = _searchResults;
  const [, setForceReRenderer] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchResultsModalOn, setIsSearchResultsModalOn] =
    _isSearchResultsModalOn;
  const [searchInput, setSearchInput] = _searchInput;
  const [isHighlighterOn, setIsHighlighterOn] = _isHighlighterOn;

  const rerenderComp = () => {
    setForceReRenderer({});
  };

  const forceUpdate = useCallback(() => rerenderComp(), []);

  const forceUpdateComp = () => {
    forceUpdate();
  };

  const closeSearchResultsModal = () => {
    setIsSearchResultsModalOn(false);
  };

  const handleInput = (event) => {
    if (event.target.value) {
      setIsLoading(true);
      setSearchInput(event.target.value);
      setIsSearchResultsModalOn(true);
      setTimeout(() => {
        getSearchResultsAsync(event.target.value.toLowerCase())
          .then((results) => {
            setSearchResults(results);
          })
          .catch((error) => {
            console.error("Something went wrong: ", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }, 800);
      return;
    }
    setSearchResults([]);
    setSearchInput("");
    setIsSearchResultsModalOn(false);
    setIsLoading(false);
  };

  const handleCheckBoxChange = (event) => {
    setIsHighlighterOn(event.target.checked);
  };

  const handleEscapeKey = (event) => {
    if (event.key === "Escape") {
      closeSearchResultsModal();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
  }, []);

  return (
    <section className="w-100 pt-5 mt-3 d-flex justify-content-center align-items-center flex-column overflow-hidden">
      <section className="d-flex inputSec">
        <section>
          <input
            id="searchInputField"
            value={searchInput}
            className="border-4 rounded ps-1 pe-1"
            placeholder="Search Jobs"
            onChange={handleInput}
          />
        </section>
        <section className="d-flex justify-content-center align-items-center ps-1">
          <BsSearch />
        </section>
      </section>
      <section className="d-flex justify-content-center position-relative searchCardContainer min-vw-100">
        <div
          ref={searchInputRef}
          className="position-absolute w-100 mt-5 jobVizBtnElDeterminer"
        />
        {!!isSearchResultsModalOn && (
          <Card className="jobSearchResultsCard mt-2">
            <Header className="position-relative searchResultsHeader d-flex flex-row">
              <section className="d-flex flex-column flex-sm-row justify-content-between w-100">
                {!isLoading ? (
                  <Title className="mb-0 d-flex justify-content-sm-center align-items-sm-center jobVizSearchResultsTitle">
                    {searchResults?.length ? "Search Results" : "No results"}
                  </Title>
                ) : (
                  <Title className="mb-0 d-flex justify-content-sm-center align-items-sm-center jobVizSearchResultsTitle">
                    Loading...
                  </Title>
                )}
                <HighlighterComp
                  handleCheckBoxChange={handleCheckBoxChange}
                  isHighlighterOn={isHighlighterOn}
                  closeSearchResultsModal={closeSearchResultsModal}
                />
              </section>
              <CloseSearchResultsJobViz
                willShowOnlyOnSmScreen
                closeSearchResultsModal={closeSearchResultsModal}
              />
            </Header>
            <Body>
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center w-100 h-100">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                !!searchResults?.length &&
                searchResults.map((result, index) => (
                  <SearchResult
                    key={index}
                    result={result}
                    searchInput={searchInput}
                    forceUpdateParentComp={forceUpdateComp}
                    index={index}
                    setSearchResults={setSearchResults}
                    _searchInput={[searchInput, setSearchInput]}
                    isHighlighterOn={isHighlighterOn}
                    closeSearchResultsModal={closeSearchResultsModal}
                    searchParamsStr={searchParamsStr}
                  />
                ))
              )}
            </Body>
          </Card>
        )}
      </section>
    </section>
  );
};

export default SearchInputSec;
