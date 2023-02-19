/* eslint-disable quotes */
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
import { useEffect } from 'react';

const { Body } = Card;

const JobViz = ({ fns, vals }) => {
    const { setWillGetNewResults, getNewJobsData } = fns ?? {};
    const { dynamicJobResults, currentLevelNum, isLoading, parentJobCategories } = vals ?? {};
    // WHen the user goes n level deep, get the title of the card in which the the clicked button was located in. 

    // CASE: the user clicks on the engineering button.
    // GOAL: the following should appear onto the UI: 
    // for the chaining, the first level should read Job Categories 
    // the current level, it should read: Architecture & Engineering occupations

    // BRAIN DUMP: 
    // the first level will always be Job Categories
    // the formatting for the next levels will be as follows: { level: the level, name: (the job category name) }
    // put the above in an array and map through it to display the chaining onto the UI
    // the last element in the array will be the current level, that will be card body
    // when the user clicks on either of the chaining links, execute getNewJobsData and pass in target hierarchyNum and the job category name

    // CASE: the user clicks on a button on the first level
    // the [...search-results].js page will be rendered, pass the state called jobCategoriesChain, have the first value be an object, with the following format: { hierarchyNum: 1, name: 'Job Categories' }. Have the second object be the following object with the key-value pairs: { hierarchyNum: 2, name: 'Architecture & Engineering occupations', filterLevel: 'a string that will be used to filter the job categories from'  }

    useEffect(() => {
        console.log("parentJobCategories: ", parentJobCategories)
    })



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
                    <section className="d-flex justify-content-center align-items-center flex-column w-100 pt-5 mt-5">
                        {/* GOAL: when the user clicks on the job category, the name of that job category should appear in the h4 tag */}
                        {/* the name of the job category is displayed in the h4 tag and the card is render onto the dom for the last element of the array that was passed in for this component */}
                        {/* all elements in the array that was passed in from ...search-results comp, besides the last element, are mapped onto the dom as chain */}
                        {/* the selected job category was added to the state of selectedJobCategories. It will have the following data structure: { categoryName, hierarchyNum, parentLevel }. For the last its values will be as follows: { categoryName: 'Job Categories', hierarchyNum: null, parentLevel: null } */}
                        {/* get the name of the job category */}
                        {/* the user presses the more jobs button */}
                        {parentJobCategories.map((jobCategory, index, self) => {
                            const { categoryName, hierarchyNum, parentLevel } = jobCategory ?? {};

                            if (index === 0) {
                                return (
                                    <section id={`chain-${index}`} key={index} className="d-flex justify-content-center align-items-center jobVizChain">
                                        <section>
                                            <div className="position-relative jobVizChainIconContainer">
                                                <img
                                                    src="/imgs/jobViz/jobVizBrick.jpg" alt="Galactic_Polymath_JobViz_Icon_Search"
                                                    className='jobVizIcon position-absolute'
                                                />
                                            </div>
                                        </section>
                                        <section className="moveLeftJobViz">
                                            <button className='no-btn-styles text-center jobViz-chain-txt text-nowrap'>
                                                {/* {categoryName.toUpperCase()} */}
                                            </button>
                                        </section>
                                    </section>
                                )
                            }

                            if ((index !== 0) && (index !== self.length - 1)) {
                                return (
                                    <section key={index} className="d-flex justify-content-center align-items-center jobVizChain">
                                        <section>
                                            <div className="position-absolute">
                                                <img
                                                    src="/imgs/jobViz/branch-job-categories-search.jpg" alt="Galactic_Polymath_JobViz_Icon_Search"
                                                    className='jobVizIcon'
                                                />
                                            </div>
                                        </section>
                                        <section>
                                            <button className='no-btn-styles text-center' onClick={() => getNewJobsData(hierarchyNum, parentLevel)}>
                                                {categoryName.toUpperCase()}
                                            </button>
                                        </section>
                                    </section>
                                )
                            }

                            return (
                                <Card key={index} className="jobVizCard border-0 shadow">
                                    <Body className="position-relative d-flex flex-column justify-content-end">
                                        <div className="jobVizIconContainer rounded-circle shadow position-absolute">
                                            <img
                                                src="/imgs/jobViz/branch-job-categories-search.jpg" alt="Galactic_Polymath_JobViz_Icon_Search"
                                                className='jobVizIcon rounded-circle'
                                            />
                                        </div>
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
                    setWillGetNewResults={setWillGetNewResults}
                    dynamicJobResults={dynamicJobResults}
                    currentLevelNum={currentLevelNum ?? 1}
                    isLoading={isLoading}
                    getNewJobsData={getNewJobsData}
                />
            </div>
        </Layout>
    );
};

export default JobViz;
