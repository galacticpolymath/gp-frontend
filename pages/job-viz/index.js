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
import JobCategoryChain from '../../components/JobViz/JobCategoryChain';
import { useState } from 'react';
import SearchInputSec from '../../components/JobViz/SearchInputSec';

const { Body } = Card;

const JobViz = ({ vals }) => {
    const { dynamicJobResults, currentHierarchyNum, isLoading, parentJobCategories } = vals ?? {};
    const [searchResults, setSearchResults] = useState([])

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
                <SearchInputSec _searchResults={[searchResults, setSearchResults]} />
                {parentJobCategories &&
                    <section className="d-flex justify-content-center align-items-center flex-column w-100 mt-5">
                        {parentJobCategories.map((jobCategory, index, self) => {

                            /* Job Categories */
                            if (index === 0) {
                                return <JobCategoryChain key={index} jobCategory={jobCategory} isBrick />
                            }

                            if ((index !== 0) && (index !== self.length - 1)) {
                                return <JobCategoryChain key={index} jobCategory={jobCategory} />
                            }

                            return (
                                <JobCategoryChainCard key={index} jobCategoryName={jobCategory.categoryName.toUpperCase()} index={index} />
                            )
                        })}
                    </section>
                }
                {!parentJobCategories &&
                    /* starting section, no jobViz button has been pressed */
                    <section className="d-flex justify-content-center align-items-center flex-column w-100 pt-5 mt-5">
                        <JobCategoryChainCard jobCategoryName="Job Categories" />
                    </section>
                }
                <section className="bracketSec w-100 d-flex justify-content-center align-items-center">
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
            </div>
        </Layout>
    );
};

export default JobViz;
