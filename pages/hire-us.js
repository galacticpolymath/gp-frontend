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
import CardContainer from '../components/HireUsComps/CardContainer';
import teacherTestimonies from '../data/HireUsPg/teacherTestimonies.json'
import grantReviewersFeedback from '../data/HireUsPg/grantReviewersFeedback.json'
import feedbackOfClients from '../data/HireUsPg/feedbackOfClients.json'
import PicAndImageSec from '../components/HireUsComps/sections/PicAndImageSec';
import WhatTeachersSaysBackground from '../public/imgs/background/2_southeast_purplish_1.png';
import WhatOurClientsSayBackground from '../public/imgs/background/4_north-south_dark-heat-cline_1.png';
import DynamicTeamsTranslateBackground from '../public/imgs/background/3_southern-eddy_lilac_1.png';
import GrantReviewerFeedbackBackground from '../public/imgs/background/5_chaotic_bluish_1.png';
import lessonsInfo from '../data/HireUsPg/lessonsInfo.json'
import clientFundingSourcesPics from '../data/HireUsPg/clientFundingSourcesPics.json'
import mattsAwards from '../data/HireUsPg/mattsAwards.json'
import scientists from '../data/HireUsPg/scientists.json'
import infoTxtsFirstSec from '../data/HireUsPg/infoTxtsFirstSec.json'
import tiers from '../data/HireUsPg/tiers.json'
import Tier from '../components/HireUsComps/sections/Tier';


const HireUsPage = () => {
    const cardVideoSec1 = (
        <video className="border rounded looped-vid-hire-us" autoPlay muted loop>
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

    return (
        <Layout description="Galactic PolyMath Hire Us Page.">
            <div className="min-vh-100 container-fluid noPadding noMargin w-100 hireUsPg">
                <section className='d-flex flex-row parallax row introSecHireUsPg' style={{ backgroundImage: `url(${LayoutBackGroundImg.src})` }}>
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
                            <section className="headerSection">
                                <h1 className={`${styles.shadow} display-1 headingHireUs noMargin`}>Easier,</h1>
                                <h1 className={`${styles.shadow} display-1 headingHireUs noMargin`}>Classroom-ready</h1>
                                <h1 className={`${styles.shadow} display-1 headingHireUs noMargin`}>Outreach</h1>
                            </section>
                            <section className="subTxtHeadingContainerHireUsPg w-75 ps-1 mt-4">
                                <span className={`${styles.shadow} display-6 noMargin noPadding`}>
                                    We translate your work so that non-experts can teach mind-opening lessons.
                                </span>
                            </section>
                            <section className="ps-3 ps-sm-1 pt-5">
                                <LetsTalkBtnContainer />
                            </section>
                        </section>
                    </section>
                </section>
                <section className="CardSec d-flex justify-content-center align-items-center d-sm-block justify-sm-content-start align-sm-items-stretch ps-3 pe-3 ps-sm-4 pe-sm-4">
                    <Card className='hireUsPgInfoCard w-100 border shadow pt-4 pb-4'>
                        <CardBody className="hireUsPgInfoCardBody">
                            <section className="d-flex flex-column">
                                <section className="d-flex d-md-none ps-sm-5 pe-sm-5">
                                    <h3 className="text-center text-sm-start w-100 text-sm-nowrap">
                                        What do we do?
                                    </h3>
                                </section>
                                <section className="pb-4 mt-3 ps-sm-5 pe-sm-5">
                                    <span className="hireUsCardIntroTxt d-inline-block responsiveInfoTxt text-center text-sm-start ps-3 pe-3 ps-sm-0 pe-sm-0">
                                        <span className='bolder text-sm-nowrap'>
                                            We mobilize knowledge
                                        </span>
                                        <span className='ms-2 fwtHireUsCard'>
                                            by turning our clients outreach goals into rich, open-access learning experiences.
                                        </span>
                                    </span>
                                </section>
                                <section className="d-none d-md-flex flex-column ps-sm-5 pe-sm-5">
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
                                <section className="d-flex d-md-none flex-column ps-sm-5 pe-sm-5">
                                    {infoTxtsFirstSec.map((textsAndImg, index) => <HireUsCardFirstSecMobile key={index} textsAndImg={textsAndImg} index={index} />)}
                                </section>
                            </section>
                            <section className="d-flex d-md-none flex-column mt-15 mb-15 howDoesItWorkSec">
                                <section className="d-flex justify-content-center align-items-center d-sm-block justify-sm-content-start align-sm-items-stretch ps-sm-5 pe-sm-5">
                                    <h3 className="text-center text-sm-start">
                                        How does it work?
                                    </h3>
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
                                <CardContainer headingTxt="What teachers says: " userInputs={teacherTestimonies} backgroundImgSrc={WhatTeachersSaysBackground.src} headerContainerClassNamesDynamic="cardHeadingSec" />
                            </section>
                            <section className="mt-5 ps-sm-5 d-flex justify-content-center justify-content-sm-start d-md-none">
                                <section>
                                    <h3 className="display-1 text-center text-sm-start noMargin">Share your knowledge</h3>
                                    <h3 className="display-1 text-center text-sm-start noMargin">with anyone, anywhere!</h3>
                                </section>
                            </section>
                            <section className="mt-4 mt-sm-7 ps-sm-5 pe-sm-3 d-flex d-md-none">
                                <PicAndImageSec
                                    text="We promote lessons through our growing GP Constellation dissemination network."
                                    imgPath="/imgs/GP_Constellation_dark.png"
                                    txtSectionCssClasses="promoteLessonsTxtContainer ps-1 pe-1 ps-sm-0 pe-sm-0"
                                    customTxtSpanClassNames="promoteLessonsTxtClass move10pxRightResponsive ps-1 pe-1 ps-sm-0 pe-sm-0"
                                    imgMainSectionCustomCss="w-75 justify-content-center"
                                />
                            </section>
                            <section className="mt-5 ps-sm-5 pe-sm-5 eachLessonMainSec d-flex flex-column d-md-none">
                                <section className="w-100">
                                    <h5 className="fst-italic text-dark text-center text-wrap w-100 text-sm-start move10pxRightResponsive">Each lesson is: </h5>
                                </section>
                                {/* ps-sm-5 pt-sm-2 */}
                                <ul className="eachLessonInfoList ps-0 pt-2 ps-5 pt-sm-2 pe-3">
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
                                <CardContainer headingTxt="Our Clients' Funding Sources" pics={clientFundingSourcesPics} autoCarouselHeadingTxtClassNames="ourClientsFundingSourcesHeadingTxt fw200 text-dark" />
                            </section>
                            <section className="mt-5 d-md-none ps-5 pe-5 d-flex pb-5 flex-column">
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
                            <section className="d-flex d-md-none mt-8">
                                <CardContainer headingTxt="What our clients says: " userInputs={feedbackOfClients} backgroundImgSrc={WhatOurClientsSayBackground.src} headerContainerClassNamesDynamic="cardHeadingSec" />
                            </section>
                            <section className="mt-5 d-md-none ps-5 pe-5 d-flex pb-5 flex-column ownerInfoSec">
                                <section>
                                    <h3 className="display-1 noMargin">Who makes the</h3>
                                    <h3 className="display-1 noMargin">lessons?</h3>
                                </section>
                                <section className="mt-3 d-flex flex-column">
                                    <span className="text-dark fs-large fst-italic fw249">The GP Team is led by our founder,</span>
                                    <span className="text-dark fs-large fst-italic fw249">Matt Wilkins, PhD.</span>
                                </section>
                                <section className="mt-5">
                                    <PicAndImageSec
                                        isFlexReversed
                                        isImgCircle
                                        text="Matt is a scientist, teacher at the middle school to college level, and science communicator, who has won awards for his work: "
                                        txtSectionCssClasses="w-95"
                                        imgPath="/imgs/matt_wilkins_profile3_xs.jpg"
                                        customTxtSpanClassNames="fs-large pt-4 humanDescriptionTxt"
                                        imgMainSectionCustomCss="w-50 justify-content-start"
                                    />
                                </section>
                                <section>
                                    {mattsAwards.map((award, index) => {
                                        const { alt, src, txt, link } = award;

                                        return (
                                            <PicAndImageSec
                                                key={index}
                                                isFlexReversed
                                                link={link}
                                                alt={alt}
                                                text={txt}
                                                imgPath={src}
                                                txtSectionCssClasses="align-items-center w-50"
                                                customTxtSpanClassNames="fs-large pt-4 humanDescriptionTxt text-decoration-underline underline-1"
                                                imgMainSectionCustomCss="w-50 justify-content-center"
                                            />
                                        )
                                    })}
                                </section>
                            </section>
                            <section className="d-flex d-md-none mt-8">
                                <CardContainer
                                    headingTxt="Dynamic teams translate any body of knowledge"
                                    backgroundImgSrc={DynamicTeamsTranslateBackground.src}
                                    headerContainerClassNamesDynamic="ps-5"
                                    isCardOnly
                                />
                            </section>
                            <section className="d-md-none">
                                <section className="w-100 d-flex justify-content-center align-items-center mt-5 mb-5">
                                    <h5 className="fs-large fw200 fst-italic text-dark text-start w-75">
                                        Some of the many talented scientists, communicators, educators, and artists we work with:
                                    </h5>
                                </section>
                            </section>
                            <section className="d-md-none">
                                {scientists.map((scientist, index) => {
                                    const { alt, src, name, description } = scientist;

                                    return (
                                        <PicAndImageSec
                                            key={index}
                                            isFlexReversed
                                            isImgCircle
                                            txtSectionCssClasses="w-85 flex-column pe-5"
                                            imgPath={src}
                                            text={description}
                                            name={name}
                                            alt={alt}
                                            customTxtSpanClassNames="fs-large pt-1 humanDescriptionTxt"
                                            imgMainSectionCustomCss="w-50 justify-content-center"
                                        />
                                    )
                                })}
                            </section>
                            <section className="d-flex d-md-none mt-5">
                                <CardContainer
                                    userInputs={grantReviewersFeedback}
                                    headingTxt="Grant Reviewer Feedback"
                                    backgroundImgSrc={GrantReviewerFeedbackBackground.src}
                                    headerContainerClassNamesDynamic="cardHeadingSec"
                                />
                            </section>
                            <section className="howMuchDoesItCostSec ps-5 pe-5 mt-4 d-md-none">
                                <section>
                                    <h3 className="display-1 noMargin">How much does it</h3>
                                    <h3 className="display-1 noMargin">cost?</h3>
                                </section>
                                <section className="w-100 d-flex justify-content-start align-items-center mt-4 mb-5">
                                    <span className="fs-large fw200 fst-italic text-dark text-start w-75">
                                        We offer three standard packages, which we’re happy to customize to meet your specific needs.
                                    </span>
                                </section>
                                <section className="d-md-none">
                                    {tiers.map((tier, index) => {
                                        return (
                                            <Tier
                                                isNoBackground={index !== 1}
                                                key={index}
                                                tier={tier}
                                            />
                                        )
                                    })}
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
