/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import Hero from '../components/Hero';
import JobVizIcon from '../components/JobViz/JobVizIcon';
import Layout from '../components/Layout';
import { BsSearch } from 'react-icons/bs';
import { Button, Card } from 'react-bootstrap';
import { IoNewspaperOutline } from 'react-icons/io5';

const { Body } = Card;

const JobViz = () => {
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
            <div className="jobVizContent min-vh-100 pt-5">
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
                <section className="d-flex justify-content-center align-items-center w-100 border pt-5 mt-5">
                    {/* put modal card for job categories here */}
                    <Card className="jobVizCard border-0 shadow">
                        <Body className="position-relative">
                            <h4 className='text-muted text-center'>Job Categories</h4>
                            <div>
                                {/* <img /> */}
                            </div>
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
                        </Body>
                    </Card>
                </section>
                <section>
                    {/* put bracket image */}
                </section>
                <section>
                    {/* job modal cards */}
                </section>
            </div>
        </Layout>
    );
};

export default JobViz;
