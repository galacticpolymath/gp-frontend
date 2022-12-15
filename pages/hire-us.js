/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable semi */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable prefer-template */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

// TbArrowBigDown
import { Parallax } from 'react-scroll-parallax';
import { TbArrowBigDown } from 'react-icons/tb';
import {
    Card,
    CardBody,
    CardImg,
    CardTitle,
    CardText,
} from 'reactstrap';
import Head from 'next/head'
import Layout from '../components/Layout';
import styles from './index.module.css';
import Button from 'react-bootstrap/Button';
import LayoutBackGroundImg from '../assets/img/1_northeast_merlot_darker.png';
import MessageBoxIcon from '../components/svgs/MessageBoxIcon';
import HireUsCardSection from '../components/HireUsComps/HireUsCardSection';
import ReactPlayer from 'react-player'
import LetsTalkBtnContainer from '../components/HireUsComps/buttons/LetsTalkBtnContainer';


const HireUsPage = () => {
    const cardVideoSec1 = (
        <video className="video-styles border rounded" controls>
            <source src="./videos/client-asset-to-lesson-animation.mp4" type="video/mp4" />
        </video>
    );
    const cardVideoSec2 = <div className="video-styles border rounded overflow-hidden">
        <ReactPlayer
            url='https://www.youtube.com/watch?v=V0EtA5pbVSY&feature=youtu.be'
            width="100%"
            height="100%"
            light={true}
            playing
            controls />
    </div>
    const hireUsCardsSectionTexts = [{ text: "Clients provide complex texts, data, and outreach aims", content: cardVideoSec1 }, { text: "We create open access (free) lessons that a non-specialist can teach:", content: cardVideoSec2 }];

    return (
        <Layout description="Galactic PolyMath Hire Us Page.">
            <div className="min-vh-100 container-fluid noPadding noMargin w-100 hireUsPg">
                <section className='d-flex flex-row parallax row' style={{ backgroundImage: `url(${LayoutBackGroundImg.src})` }}>
                    <section className="d-none d-md-flex w-100 noMargin col-12 introSecAndLetTalksSec">
                        <section className="w-50 d-flex flex-column align-items-center justify-content-center">
                            <section>
                                <h1 className={`${styles.shadow} display-1 headingHireUs`}>Better, Easier</h1>
                                <h1 className={`${styles.shadow} display-1 headingHireUs`}>Outreach</h1>
                            </section>
                            <section>
                                <p className={`${styles.shadow} display-6 noMargin noPadding introSubTextHireUs`}>We help you make a real</p>
                                <p className={`${styles.shadow} display-6 noMargin noPadding introSubTextHireUs`}>impact!</p>
                            </section>
                        </section>
                        <section className="w-50 d-flex align-items-center justify-content-center">
                            <LetsTalkBtnContainer />
                        </section>
                    </section>
                    <section className="d-flex d-md-none w-100 noMargin col-12 introSecAndLetTalksSec">
                        <section className="w-100 d-flex flex-column align-items-center pt-4">
                            <section className="w-75">
                                <h1 className={`${styles.shadow} display-1 headingHireUs noMargin`}>Easier,</h1>
                                <h1 className={`${styles.shadow} display-1 headingHireUs noMargin`}>Classroom-ready</h1>
                                <h1 className={`${styles.shadow} display-1 headingHireUs noMargin`}>Outreach</h1>
                            </section>
                            <section className="w-75 ps-1 mt-4">
                                <span className={`${styles.shadow} display-6 noMargin noPadding`}>
                                    We translate your work so that non-experts can teach mind-opening lessons.
                                </span>
                            </section>
                            <section className="w-75 ps-1 pt-5">
                                <LetsTalkBtnContainer />
                            </section>
                        </section>
                    </section>
                </section>
                <section className="ps-4 pe-4 row">
                    <Card className='hireUsPgInfoCard w-100 border shadow ps-3 pe-3 pt-4 pb-4'>
                        <CardBody className="hireUsPgInfoCardBody">
                            <section className="d-none d-md-flex flex-column">
                                <section className="pb-4">
                                    <span className="hireUsCardIntroTxt d-inline-block">
                                        <span className='bolder'>
                                            We mobilize knowledge
                                        </span>
                                        <span className='ms-2 fwtHireUsCard'>
                                            by turning our clients outreach goals into rich, open-access learning experiences.
                                        </span>
                                    </span>
                                </section>
                                {hireUsCardsSectionTexts.map(({ text, content }, index) => {
                                    return (
                                        <>
                                            <HireUsCardSection key={index} text={text} content={content} />
                                            {(index === 0) && (
                                                <section className='d-flex justify-content-center align-items-center mt-3'>
                                                    <TbArrowBigDown className="arrowDown" />
                                                </section>
                                            )}
                                        </>
                                    );
                                })}
                            </section>
                            <section className="d-flex d-md-none flex-column">
                                <section className="">
                                    <section>
                                        <h3 className="text-nowrap">
                                            What do we do?
                                        </h3>
                                    </section>
                                </section>
                                <section className="mt-3">
                                    <span className="hireUsCardIntroTxt d-inline-block">
                                        <span className='bolder'>
                                            We mobilize knowledge
                                        </span>
                                        <span className='ms-2 fwtHireUsCard'>
                                            by turning our clients outreach goals into rich, open-access learning experiences.
                                        </span>
                                    </span>
                                </section>
                            </section>
                        </CardBody>
                    </Card>
                </section>

            </div>
        </Layout>
    );
};

export default HireUsPage;
