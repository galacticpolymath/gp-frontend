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
import { BsSearch } from 'react-icons/bs';
import { Button, Card } from 'react-bootstrap';
import { IoNewspaperOutline } from 'react-icons/io5';
import JobCategoriesSec from '../../components/JobViz/JobCategoriesSec';
import JobCategoryChainCard from '../../components/JobViz/JobCategoryChainCard';

const { Body } = Card;

const JobViz = ({ fns, vals }) => {
    const { setForceReRenderer } = fns ?? {};
    const { dynamicJobResults, currentHierarchyNum, isLoading, parentJobCategories } = vals ?? {};

    const handleJobCategoryChainBtnClick = () =>{
        setForceReRenderer()
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
                        <JobVizIcon isOnJobVizPg={true} />
                    </section>
                </section>
            </Hero>
            <div className="jobVizContent min-vh-100 pt-5 pb-5">
                <section className="w-100 d-flex justify-content-center align-items-center">
                    {/* put search bar here */}
                    <section className="d-flex inputSec">
                        <section>
                            <input className='border-4 rounded ps-1 pe-1' placeholder='Search Jobs' />
                        </section>
                        <section className="d-flex justify-content-center align-items-center ps-1">
                            <BsSearch />
                        </section>
                    </section>
                </section>
                {parentJobCategories &&
                    <section className="d-flex justify-content-center align-items-center flex-column w-100 mt-5">
                        {parentJobCategories.map((jobCategory, index, self) => {
                            const { categoryName, hierarchyNum, parentLevel } = jobCategory ?? {};

                            if (index === 0) {
                                return (
                                    <section id={`chain-${index}`} key={index} className="d-flex justify-content-center align-items-center jobVizChain">
                                        <section className="d-flex">
                                            <section>
                                                <div className="position-relative jobVizChainIconContainer">
                                                    <img
                                                        src="/imgs/jobViz/jobVizBrick.jpg" alt="Galactic_Polymath_JobViz_Icon_Search"
                                                        className='jobVizIcon position-absolute'
                                                    />
                                                </div>
                                            </section>
                                            <section className="moveLeftJobViz d-flex justify-content-center align-items-center">
                                                <button className='no-btn-styles text-center jobViz-chain-txt text-nowrap'>
                                                    {categoryName.toUpperCase()}
                                                </button>
                                            </section>
                                        </section>
                                    </section>
                                )
                            }

                            if ((index !== 0) && (index !== self.length - 1)) {
                                return (
                                    <section key={index} className="d-flex justify-content-center align-items-center jobVizChain">
                                        <section className="d-flex">
                                            <section>
                                                <div className="position-relative jobVizChainIconContainer">
                                                    <img
                                                        src="/imgs/jobViz/branch-job-categories-search.jpg" alt="Galactic_Polymath_JobViz_Icon_Search"
                                                        className='jobVizIcon'
                                                    />
                                                </div>
                                            </section>
                                            <section className="d-flex justify-content-center align-items-center">
                                                <button className='no-btn-styles text-center jobViz-chain-txt text-nowrap' onClick={handleJobCategoryChainBtnClick}>
                                                    {categoryName.toUpperCase()}
                                                </button>
                                            </section>
                                        </section>
                                    </section>
                                )
                            }

                            return (
                                <Card key={index} className="jobVizCard border-0 shadow mt-5">
                                    <Body className="position-relative d-flex flex-column justify-content-end">
                                    <section className="position-relative iconSec">
                                        <div className="jobVizIconContainer rounded-circle shadow position-absolute">
                                            <img
                                                src="/imgs/jobViz/branch-job-categories-search.jpg" alt="Galactic_Polymath_JobViz_Icon_Search"
                                                className='jobVizIcon rounded-circle'
                                            />
                                        </div>
                                    </section>
                                        <section>
                                            <h4 id="currentJobCategoryHeaderTxt" className='text-muted text-center'>{categoryName}</h4>
                                            <section className="d-flex justify-content-center align-items-center w-100">
                                                <Button id="jobVizBtnSearch" className="d-flex justify-content-center align-items-center">
                                                    <span className="w-25 h-100 d-flex justify-content-center align-items-center">
                                                        <IoNewspaperOutline />
                                                    </span>
                                                    <span className="w-75 h-100 d-flex justify-content-center align-items-center ps-1">
                                                        Details
                                                    </span>
                                                </Button>
                                            </section>
                                        </section>
                                    </Body>
                                </Card>
                            )
                        })}
                    </section>}
                {!parentJobCategories &&
                    <section className="d-flex justify-content-center align-items-center flex-column w-100 pt-5 mt-5">
                        <JobCategoryChainCard jobCategoryName="Job Categories" />
                    </section>
                }
                <section className="bracketSec w-100 d-flex justify-content-center align-items-center">
                    {/* put bracket image */}
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
                    setForceReRenderer={setForceReRenderer}
                />
            </div>
        </Layout>
    );
};

export default JobViz;
