/* eslint-disable react/jsx-first-prop-new-line */
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

import Image from 'next/image';
import { TbArrowBigDown } from 'react-icons/tb';
import { Card, CardBody } from 'reactstrap';
import Layout from '../components/Layout';
import styles from './index.module.css';
import LayoutBackGroundImg from '../assets/img/1_northeast_merlot_darker.png';
import HireUsCardSection from '../components/HireUsComps/HireUsCardSection';
import ReactPlayer from 'react-player'
import LetsTalkBtnContainer from '../components/HireUsComps/buttons/LetsTalkBtnContainer';
import HireUsCardFirstSecMobile from '../components/HireUsComps/HireUsCardFirstSecMobile';
import CarouselContainer from '../components/HireUsComps/CarouselContainer';
import teacherTestimonies from '../data/HireUsPg/teacherTestimonies.json'
import PicAndImageSec from '../components/HireUsComps/sections/PicAndImageSec';
import WhatTeachersSaysBackground from '../public/imgs/background/4_north-south_dark-heat-cline_1.png';
import lessonsInfo from '../data/HireUsPg/lessonsInfo.json'
import clientFundingSourcesPics from '../data/HireUsPg/clientFundingSourcesPics.json'


const HireUsPage = () => {
    const cardVideoSec1 = (
        <video className="video-styles border rounded" controls>
            <source src="./videos/client-asset-to-lesson-animation.mp4" type="video/mp4" />
        </video>
    );
    const cardVideoSec2 = <div className="video-styles rounded overflow-hidden">
        <ReactPlayer
            url='https://www.youtube.com/watch?v=V0EtA5pbVSY&feature=youtu.be'
            width='100%'
            height="100%"
            light={true}
            playing
            controls />
    </div>




    const hireUsCardsSectionTexts = [{ text: "Clients provide complex texts, data, and outreach aims", mobileTxt: "You give us your outreach goals, along with complex texts, data, and any media you might have related to your work: ", content: cardVideoSec1 }, { text: "We create open access (free) lessons that a non-specialist can teach:", mobileTxt: "We create lessons and supporting multimedia that achieve your outreach aims by making your work accessible to teachers around the world.", content: cardVideoSec2 }];
    const infoTxtsFirstSec = [{ boldedTxt: "We help researchers", unBoldedText: "win grants and do outreach more easily.", imgPath: "/imgs/pretty-ribbon.png" }, { boldedTxt: "We help nonprofits", unBoldedText: "grow student understanding and enthusiasm around their mission.", imgPath: "/imgs/pretty-sustainability.png" }, { boldedTxt: "We help companies", unBoldedText: "build tomorrow’s workforce by connecting classwork to career paths.", imgPath: "/imgs/pretty-rocket-career.png" }]

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
                <section className="CardSec ps-4 pe-4">
                    <Card className='hireUsPgInfoCard w-100 border shadow pt-4 pb-4'>
                        <CardBody className="hireUsPgInfoCardBody">
                            <section className="d-flex flex-column ps-5 pe-5">
                                <section className="d-flex d-md-none">
                                    <h3 className="text-nowrap">
                                        What do we do?
                                    </h3>
                                </section>
                                <section className="pb-4 mt-3">
                                    <span className="hireUsCardIntroTxt d-inline-block">
                                        <span className='bolder'>
                                            We mobilize knowledge
                                        </span>
                                        <span className='ms-2 fwtHireUsCard'>
                                            by turning our clients outreach goals into rich, open-access learning experiences.
                                        </span>
                                    </span>
                                </section>
                                <section className="d-none d-md-flex flex-column">
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
                                    {infoTxtsFirstSec.map((textsAndImg, index) => <HireUsCardFirstSecMobile key={index} textsAndImg={textsAndImg} />)}
                                </section>
                            </section>
                            <section className="d-flex d-md-none flex-column mt-15 mb-15">
                                <section className="ps-5 pe-5">
                                    <section>
                                        <h3 className="text-nowrap">
                                            How does it work?
                                        </h3>
                                    </section>
                                </section>
                                {hireUsCardsSectionTexts.map(({ content, mobileTxt }, index) => {
                                    return (
                                        <>
                                            <HireUsCardSection key={index} mobileTxt={mobileTxt} content={content} />
                                            {(index === 0) && (
                                                <section className='d-flex justify-content-center align-items-center mt-3'>
                                                    <Image src="/imgs/pretty-down-arrow.png" width={75} height={75} alt="Galactic_PolyMath_First_Sec_Mobile_Info" />
                                                </section>
                                            )}
                                        </>
                                    );
                                })}
                            </section>
                            <section className="d-flex d-md-none mt-5">
                                <CarouselContainer headingTxt="What teachers says: " userInputs={teacherTestimonies} backgroundImgSrc={WhatTeachersSaysBackground.src} headerContainerClassNamesDynamic="teacherReviewsSecHeading" />
                            </section>
                            <section className="mt-5 ps-5 d-flex d-md-none">
                                <section>
                                    <h3 className="display-1">Share your knowledge</h3>
                                    <h3 className="display-1">with anyone, anywhere!</h3>
                                </section>
                            </section>
                            <section className="mt-7 ps-5 pe-3 d-flex d-md-none">
                                <PicAndImageSec
                                    text="We promote lessons through our growing GP Constellation dissemination network."
                                    imgPath="/imgs/GP_Constellation_dark.png"
                                    customTxtSpanClassNames="promoteLessonsTxtClass move10pxRight"
                                    imgMainSectionCustomCss="logoConstellationImgSec w-75"
                                />
                            </section>
                            <section className="mt-5 ps-5 pe-5 eachLessonMainSec d-flex flex-column d-md-none">
                                <section>
                                    <h5 className="fst-italic text-dark move10pxRight">Each lesson is: </h5>
                                </section>
                                <ul className="eachLessonInfoList ps-5 pt-2">
                                    {lessonsInfo.map(({ normalTxt, underLineTxt }, index) => (
                                        <li className="text-dark fw249" key={index}>
                                            {normalTxt}
                                            <span className="text-decoration-underline underline-less-thick">
                                                {underLineTxt}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                            <section className="mt-5 d-md-none">
                                <CarouselContainer headingTxt="Our Clients' Funding Sources" pics={clientFundingSourcesPics} autoCarouselHeadingTxtClassNames="ourClientsFundingSourcesHeadingTxt fw200 text-dark" />
                            </section>
                            <section className="mt-5 d-md-none ps-5 pe-5 d-flex flex-column">
                                <section>
                                    <h3 className="display-1 noMargin">When should I reach</h3>
                                    <h3 className="display-1 noMargin">out?</h3>
                                </section>
                                <section className="w-100 pt-5 pb-5">
                                    <span className="text-dark fs-large w-85 d-block fw249">
                                        Any time! Whether you have funds now, want to write us into a proposal, or just have a question, we are here to help!
                                    </span>
                                </section>
                                <section>
                                    <LetsTalkBtnContainer isBtnColorDarker />
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
