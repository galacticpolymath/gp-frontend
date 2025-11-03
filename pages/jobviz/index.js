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
import { useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import GoToSearchInput from '../../components/JobViz/Buttons/GoToSearchInput';
import GoToJobVizChain from '../../components/JobViz/Buttons/GoToJobVizChain';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SOC_CODES_PARAM_NAME, UNIT_NAME_PARAM_NAME } from '../../components/LessonSection/JobVizConnections'

const DATA_SOURCE_LINK = "https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm"

const JobViz = ({ vals }) => {
    const searchParams = useSearchParams(); 
    const { unitName, socCodes } = useMemo(() => {
        const socCodesStr = searchParams.get(SOC_CODES_PARAM_NAME)
        const unitName = searchParams.get(UNIT_NAME_PARAM_NAME) ?? "Not found";
        const socCodes = socCodesStr ? new Set(socCodesStr.split(',')) : null;

        return {
            unitName,
            socCodes,
        }
    }, [])

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
        url: "https://galacticpolymath.com/jobviz",
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
            <section className="container py-5">
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <h3 className="mb-4">Jobs and careers related to the &ldquo;Fairy Wrens&rdquo; unit:</h3>
                        <ul className="mb-4 d-none d-sm-block" style={{ columnCount: 2, columnGap: '1.3rem' }}>
                            <li>Environmental scientists and geoscientists</li>
                            <li>Biological technicians</li>
                            <li>Zoologists and wildlife biologists</li>
                            <li>Natural sciences managers</li>
                            <li>Conservation scientists and foresters</li>
                            <li>Biological science teachers, postsecondary</li>
                        </ul>
                        <ul className="mb-4 d-block d-sm-none">
                            <li>Environmental scientists and geoscientists</li>
                            <li>Biological technicians</li>
                            <li>Zoologists and wildlife biologists</li>
                            <li>Natural sciences managers</li>
                            <li>Conservation scientists and foresters</li>
                            <li>Biological science teachers, postsecondary</li>
                        </ul>
                        <div className="d-flex align-items-start">
                            <div className="me-3 mt-1" style={{ fontSize: '2rem' }}>
                                ✏️
                            </div>
                            <div>
                                <p className="mb-2">
                                    <strong>Assignment:</strong> Research these jobs and explain <em>with data</em> which you would be most or least interested in.
                                </p>
                                <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                                    Your teacher will provide instructions on how to share your response.
                                </p>
                                <div className="alert alert-info py-2 px-3 mb-0" role="alert" style={{ fontSize: '0.85rem' }}>
                                    ℹ️ <strong>Note:</strong> This feature is currently being built and will be available soon.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
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
