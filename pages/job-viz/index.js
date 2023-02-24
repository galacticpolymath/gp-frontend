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
import Hero from '../../components/Hero';
import JobVizIcon from '../../components/JobViz/JobVizIcon';
import Layout from '../../components/Layout';
import JobCategoriesSec from '../../components/JobViz/JobCategoriesSec';
import JobCategoryChainCard from '../../components/JobViz/JobCategoryChainCard';
import PreviouslySelectedJobCategory from '../../components/JobViz/PreviouslySelectedJobCategory';
import SearchInputSec from '../../components/JobViz/SearchInputSec';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import GoToSearchInput from '../../components/JobViz/Buttons/GoToSearchInput';
import GoToJobVizChain from '../../components/JobViz/Buttons/GoToJobVizChain';



const JobViz = ({ vals }) => {
    const { dynamicJobResults, currentHierarchyNum, isLoading, parentJobCategories } = vals ?? {};
    const [searchResults, setSearchResults] = useState([])
    const [searchInput, setSearchInput] = useState("")
    const [wasRendered, setWasRendered] = useState(false);
    const [searchInputRef, setSearchInputRef] = useState(null)
    const [isScrollToInputBtnVisible, setIsScrollToInputBtnVisible] = useState(false);
    const mainChainCardRef = useRef();
    const { ref, inView, entry } = useInView({ threshold: 0 });
    const { ref: searchResultsCardRef, inView: inViewSearchResultsCard } = useInView({ threshold: 0 });
    console.log("entry: ", entry)
    // GOAL: wheN the user clicks on job viz chain button, the following should occur: 
    // take the user to the job viz chain card 
    // don't show the show button 





    return (
        <Layout>
            <Hero className="jobVizHero">
                <section className="d-flex jobVizHeroMainSec">
                    <section className="d-flex flex-column">
                        <h1 className='text-muted'>JobViz Career Explorer</h1>
                        <p className='text-muted'>A tool for middle and high school students to explore career possibilities. Browse, search, and share descriptions and stats for over a thousands jobs.</p>
                        <p className='text-muted'>What do you want to be?</p>
                    </section>
                    <section>
                        <JobVizIcon isOnJobVizPg />
                    </section>
                </section>
            </Hero>
            <div className="jobVizContent min-vh-100 pt-5 pb-5 position-relative">
                <SearchInputSec
                    _searchResults={[searchResults, setSearchResults]}
                    _searchInput={[searchInput, setSearchInput]}
                    searchInputRef={ref}
                    searchResultsCardRef={searchResultsCardRef}
                    setIsScrollToInputBtnVisible={setIsScrollToInputBtnVisible}
                />
                {parentJobCategories &&
                    <section className="d-flex justify-content-center align-items-center flex-column w-100 mt-5">
                        {parentJobCategories.map((jobCategory, index, self) => {

                            /* Job Categories */
                            {/* insert the chain here as well */ }
                            if (index === 0) {
                                return (
                                    <>
                                        <PreviouslySelectedJobCategory key={index} jobCategory={jobCategory} isBrick />
                                        <Image src="/imgs/jobViz/chain.png" alt="chain_JobViz_Galactic_Polymath" width={3} height={30} />
                                    </>
                                )
                            }

                            {/* insert the chain here */ }
                            if ((index !== 0) && (index !== self.length - 1)) {

                                return <>
                                    <PreviouslySelectedJobCategory key={index} jobCategory={jobCategory} />
                                    <Image src="/imgs/jobViz/chain.png" alt="chain_JobViz_Galactic_Polymath" width={3} height={30} />
                                </>
                            }

                            return <JobCategoryChainCard key={index} jobCategory={jobCategory} index={index} />

                        })}
                    </section>
                }
                {!parentJobCategories &&
                    /* starting section, no jobViz button has been pressed */
                    <section className="d-flex justify-content-center align-items-center flex-column w-100 pt-5 mt-5">
                        <JobCategoryChainCard />
                    </section>
                }
                <section className="jobCategoriesAndBracketSec d-flex justify-content-center align-items-center flex-column">
                    <section className="bracketSec d-flex justify-content-center align-items-center">
                        <div className="bracketImgContainer">
                            <img
                                src="/imgs/jobViz/bracket_search.png"
                                alt="Galactic_Polymath_JobViz_Icon_Search"
                                className='w-100 h-100'
                            />
                        </div>
                    </section>
                    {/* job modal cards */}
                    <JobCategoriesSec
                        dynamicJobResults={dynamicJobResults}
                        currentHierarchyNum={currentHierarchyNum ?? 1}
                        isLoading={isLoading}
                    />
                </section>
                {!!searchResults.length && <GoToSearchInput isScrollToInputBtnVisible={!inView} />}
                {!!searchResults.length && <GoToJobVizChain isScrollToJobVizChainBtnVisible={!inView} inViewSearchResultsCard={inViewSearchResultsCard} />}
            </div>
        </Layout>
    );
};

export default JobViz;
