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
import Image from "next/image";
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import GoToSearchInput from '../../components/JobViz/Buttons/GoToSearchInput';
import GoToJobVizChain from '../../components/JobViz/Buttons/GoToJobVizChain';



const JobViz = ({ vals }) => {
    const { dynamicJobResults, currentHierarchyNum, isLoading, parentJobCategories } = vals ?? {};
    const [searchResults, setSearchResults] = useState([])
    const [searchInput, setSearchInput] = useState("")
    const [isHighlighterOn, setIsHighlighterOn] = useState(true);
    const { ref, inView } = useInView({ threshold: 0 });

    const resetSearchResults = () => {
        setSearchInput("")
        setSearchResults([])
    }

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
            <SearchInputSec
                _searchResults={[searchResults, setSearchResults]}
                _searchInput={[searchInput, setSearchInput]}
                searchInputRef={ref}
                _isHighlighterOn={[isHighlighterOn, setIsHighlighterOn]}
            />
            {parentJobCategories &&
                <section className="d-flex justify-content-center align-items-center flex-column w-100 mt-5">
                    {parentJobCategories.map((jobCategory, index, self) => {

                        if (index === 0) {
                            return (
                                <div key={index} className="d-flex justify-content-center align-items-center flex-column">
                                    <PreviouslySelectedJobCategory jobCategory={jobCategory} isBrick />
                                    <Image
                                        src="/imgs/jobViz/chain.png"
                                        alt="chain_JobViz_Galactic_Polymath"
                                        width={3}
                                        height={30}
                                        style={{
                                            maxWidth: "100%",
                                            height: "auto"
                                        }} />
                                </div>
                            );
                        }

                        if ((index !== 0) && (index !== self.length - 1)) {

                            return (
                                <div key={index} className="d-flex justify-content-center flex-column align-items-center">
                                    <PreviouslySelectedJobCategory jobCategory={jobCategory} />
                                    <Image
                                        src="/imgs/jobViz/chain.png"
                                        alt="chain_JobViz_Galactic_Polymath"
                                        width={3}
                                        height={30}
                                        style={{
                                            maxWidth: "100%",
                                            height: "auto"
                                        }} />
                                </div>
                            );
                        }

                        return <JobCategoryChainCard key={index} jobCategory={jobCategory} index={index} />

                    })}
                </section>
            }
            {!parentJobCategories &&
                <section className="d-flex justify-content-center align-items-center flex-column w-100 pt-5 mt-5">
                    <JobCategoryChainCard />
                </section>
            }
            <section className="jobCategoriesAndBracketSec d-flex justify-content-center align-items-center flex-column pb-5 mb-5">
                <section className="bracketSec d-flex justify-content-center align-items-center">
                    <div className="bracketImgContainer">
                        <img
                            src="/imgs/jobViz/bracket_search.png"
                            alt="Galactic_Polymath_JobViz_Icon_Search"
                            className='w-100 h-100'
                        />
                    </div>
                </section>
                <JobCategoriesSec
                    dynamicJobResults={dynamicJobResults}
                    currentHierarchyNum={currentHierarchyNum ?? 1}
                    isLoading={isLoading}
                    resetSearch={resetSearchResults}
                />
            </section>
            {!!searchResults.length && <GoToSearchInput isScrollToInputBtnVisible={inView} />}
            {!!searchResults.length && <GoToJobVizChain isScrollToJobVizChainBtnVisible={inView} />}
        </Layout>
    );
};

export default JobViz;
