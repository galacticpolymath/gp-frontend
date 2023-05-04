/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable indent */
import Hero from '../../components/Hero';
import JobVizIcon from '../../components/JobViz/JobVizIcon';
import Layout from '../../components/Layout';
import JobCategoriesSec from '../../components/JobViz/JobCategoriesSec';
import JobCategoryChainCard from '../../components/JobViz/JobCategoryChainCard';
import PreviouslySelectedJobCategory from '../../components/JobViz/PreviouslySelectedJobCategory';
import SearchInputSec from '../../components/JobViz/SearchInputSec';
import Image from 'next/image';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import GoToSearchInput from '../../components/JobViz/Buttons/GoToSearchInput';
import GoToJobVizChain from '../../components/JobViz/Buttons/GoToJobVizChain';
import { useEffect } from 'react';

const DATA_SOURCE_LINK = "https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm"

const JobViz = ({ vals }) => {
    const { dynamicJobResults, currentHierarchyNum, isLoading, parentJobCategories, metaDescription } = vals ?? {};
    const [searchResults, setSearchResults] = useState([])
    const [searchInput, setSearchInput] = useState("")
    const [isHighlighterOn, setIsHighlighterOn] = useState(true);
    const [isSearchResultsModalOn, setIsSearchResultsModalOn] = useState(false)
    const { ref, inView } = useInView({ threshold: 0 });
    const jobVizPgDescriptor = "A tool for middle and high school students to explore career possibilities. Browse, search, and share descriptions and stats for over a thousands jobs."

    const resetSearchResults = () => {
        setSearchInput("")
        setSearchResults([])
    }

    const [didFirstRenderOccur, setDidFirstRenderOccur] = useState(false)

    const layoutProps = {
        title: "JobViz Career Explorer",
        description: metaDescription || jobVizPgDescriptor,
        imgSrc: didFirstRenderOccur && `${window.location.origin}/imgs/jobViz/jobviz_icon.png`,
        url: "https://galacticpolymath.com/job-viz",
        keywords: "jobviz, job viz, career explorer, career, career exploration, career exploration tool, career exploration for students, career exploration for high school students, career exploration for middle school students, career exploration for teens, career exploration for teenagers, career exploration for kids, career exploration for children, career exploration for young adults, career exploration for young people, career exploration for youth, career exploration for adolescents, career exploration for parents, career exploration for teachers, career exploration for counselors, career exploration", 
    }

    useEffect(() => {
        setDidFirstRenderOccur(true);
    }, [])

    return (
        <Layout {...layoutProps}>
            <Hero className="jobVizHero">
                <section className="d-flex jobVizHeroMainSec">
                    <section className="d-flex flex-column">
                        <h1 className='text-muted'>JobViz Career Explorer</h1>
                        <p className='text-muted'>{jobVizPgDescriptor}</p>
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
                _isSearchResultsModalOn={[isSearchResultsModalOn, setIsSearchResultsModalOn]}
            />
            {parentJobCategories &&
                <section className="d-flex justify-content-center align-items-center flex-column w-100 mt-5">
                    {parentJobCategories.map((jobCategory, index, self) => {

                        if (index === 0) {
                            return (
                                <div key={index} className="d-flex justify-content-center align-items-center flex-column">
                                    <PreviouslySelectedJobCategory jobCategory={jobCategory} isBrick />
                                    <section className='w-100 d-flex justify-content-center align-items-center'>
                                        <div style={{ height: 14, width: 3 }} className='position-relative'>
                                            <Image
                                                src="/imgs/jobViz/chain.png"
                                                alt="chain_JobViz_Galactic_Polymath"
                                                fill
                                                sizes="3px"
                                                style={{
                                                    object: "fit",
                                                }}
                                            />
                                        </div>
                                    </section>
                                </div>
                            );
                        }

                        if ((index !== 0) && (index !== self.length - 1)) {

                            return (
                                <div key={index} className="d-flex justify-content-center flex-column align-items-center">
                                    <PreviouslySelectedJobCategory jobCategory={jobCategory} />
                                    <section className='w-100 d-flex justify-content-center align-items-center'>
                                        <div style={{ height: 14, width: 3 }} className='position-relative'>
                                            <Image
                                                src="/imgs/jobViz/chain.png"
                                                alt="chain_JobViz_Galactic_Polymath"
                                                fill
                                                sizes="3px"
                                                style={{
                                                    object: "fit",
                                                }}
                                            />
                                        </div>
                                    </section>
                                </div>
                            );
                        }

                        return <JobCategoryChainCard key={index} jobCategory={jobCategory} index={index} isSearchResultsChainPresent />

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
                    <div style={{ height: 70 }} className="bracketImgContainer position-relative w-100">
                        <Image
                            src="/imgs/jobViz/bracket_search.png"
                            alt="Galactic_Polymath_JobViz_Icon_Search"
                            fill
                            style={{
                                objectFit: 'fill',
                            }}
                            size="(max-width: 575px) 488.75px, (max-width: 767px) 651.945px, (max-width: 991px) 842.344px, (max-width: 1199px) 1019.15px, 1025px"
                            priority
                        />
                    </div>
                </section>
                <JobCategoriesSec
                    dynamicJobResults={dynamicJobResults}
                    currentHierarchyNum={currentHierarchyNum ?? 1}
                    isLoading={isLoading}
                    resetSearch={resetSearchResults}
                />
                <section className="w-100 d-flex justify-content-sm-end justify-content-center align-items-center mt-5">
                    <span className='d-block d-sm-inline me-sm-5'>
                        <span className="d-block d-sm-inline font-weight-bold me-sm-2 text-sm-start text-center">
                            Data Source:
                        </span>
                        <a href={DATA_SOURCE_LINK} target="_blank" className="underline-on-hover text-sm-start text-center">
                            US Bureau of Labor Statistics
                        </a>
                    </span>
                </section>
            </section>
            {isSearchResultsModalOn && (searchResults.length && <GoToSearchInput isScrollToInputBtnVisible={inView} />)}
            {isSearchResultsModalOn && (searchResults.length && <GoToJobVizChain isScrollToJobVizChainBtnVisible={inView} />)}
        </Layout>
    );
};

export default JobViz;
