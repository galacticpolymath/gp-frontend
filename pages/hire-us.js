/* eslint-disable no-multi-spaces */
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
import PicAndDescriptionSec from '../components/HireUsComps/sections/PicAndDescriptionSec';
import WhatTeachersSaysBackground from '../public/imgs/background/2_southeast_purplish_1.png';
import WhatOurClientsSayBackground from '../public/imgs/background/4_north-south_dark-heat-cline_1.png';
import GrantReviewerFeedbackBackground from '../public/imgs/background/5_chaotic_bluish_1.png';
import lessonsInfo from '../data/HireUsPg/lessonsInfo.json'
import clientFundingSourcesPics from '../data/HireUsPg/clientFundingSourcesPics.json'
import scientists from '../data/HireUsPg/scientists.json'
import infoTxtsFirstSec from '../data/HireUsPg/infoTxtsFirstSec.json'
import whatYouWillGetTxts from '../data/HireUsPg/whatYouWillGetTxts.json'
import tiers from '../data/HireUsPg/tiers.json'
import tiersInfoForModal from '../data/HireUsPg/tiersInfoForModal.json'
import Tier from '../components/HireUsComps/sections/Tier';
import TierInfoModal from '../components/HireUsComps/modals/TierInfoModal'
import { useState } from 'react';
import ReadyToInspireSec from '../components/HireUsComps/ReadyToInspireSec';
import ShareYourKnowledge from '../components/HireUsComps/sections/ShareYourKnowledge';
import ClientFundingSec from '../components/HireUsComps/sections/ClientFundingSec';
import WhenShouldIReachOutSec from '../components/HireUsComps/sections/WhenShouldIReachOutSec';
import WhoMakesTheLessonsSec from '../components/HireUsComps/sections/WhoMakesTheLessonsSec';
import ScientistSection from '../components/HireUsComps/sections/ScientistSection';


const HireUsPage = () => {
    const cardVideoSec1 = (
        <video className="border rounded looped-vid-hire-us" autoPlay muted loop>
            <source src="./videos/client-asset-to-lesson-animation.mp4" type="video/mp4" />
        </video>
    );
    const cardVideoSec2 = <div className="video-styles rounded overflow-hidden">
        <ReactPlayer
            url='https://www.youtube.com/watch?v=V0EtA5pbVSY'
            width='100%'
            height="100%"
            light={true}
            playing
            controls />
    </div>
    const hireUsCardsSectionTexts = [{ text: "1. You give us your outreach goals, along with complex texts, data, and media related to your work: ", mobileTxt: "You give us your outreach goals, along with complex texts, data, and any media you might have related to your work: ", content: cardVideoSec1 }, { text: "2. We create lessons and supporting media that achieve your outreach aims by making your work accessible to teachers around the world. ", mobileTxt: "We create lessons and supporting multimedia that achieve your outreach aims by making your work accessible to teachers around the world.", content: cardVideoSec2 }]
    const [tiersInfoForModalArr, setTiersInfoForModalArr] = useState(tiersInfoForModal.map(tier => ({ ...tier, isModalOn: false })))

    return (
        <>
            <Layout description="Galactic PolyMath Hire Us Page." keywords="Hire us, Galactic PolyMath">
                <div className="w-100 hireUsPg d-flex flex-column justify-content-center align-items-center">
                    <div className="container-fluid noPadding noMargin w-100 hireUsPgWrapper">
                        <section className='d-flex flex-row parallax row introSecHireUsPg' style={{ backgroundImage: `url(${LayoutBackGroundImg.src})` }}>
                            <section className="d-none d-md-flex w-100 noMargin col-12 introSecAndLetTalksSec">
                                <section className="d-flex flex-column w-100 justify-content-center align-items-center">
                                    <section className="w-100 ps-5">
                                        <h1 className={`${styles.shadow} display-1 headingHireUs`}>Easier, Classroom-Ready Outreach</h1>
                                    </section>
                                    <section className="w-100 ps-5">
                                        <span className={`${styles.shadow} display-6 noMargin noPadding w-75 subTxtHeadingDesktop`}>
                                            We translate your work so that non-experts can teach mind-opening lessons.
                                        </span>
                                    </section>
                                </section>
                                <section className="d-flex align-items-end justify-content-end letTalksMainBtnSec">
                                    <LetsTalkBtnContainer isMainBtn />
                                </section>
                            </section>
                            {/* make this into a different component */}
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
                                    <section className="ps-0 ps-sm-1 pt-4 pt-sm-5">
                                        <LetsTalkBtnContainer isMainBtn />
                                    </section>
                                </section>
                            </section>
                        </section>
                        <section className="CardSec d-flex justify-content-center align-items-center flex-column align-sm-items-stretch ps-3 pe-3 ps-sm-4 pe-sm-4">
                            <Card className='hireUsPgInfoCard w-100 border shadow pt-4 pb-5'>
                                <CardBody className="hireUsPgInfoCardBody">
                                    <section className="d-flex flex-column">
                                        <section className="d-flex ps-sm-5 pe-sm-5">
                                            <h3 className="text-center text-sm-start w-100 text-sm-nowrap">
                                                What do we do?
                                            </h3>
                                        </section>
                                        <section className="pb-4 mt-3 ps-sm-5 pe-sm-5">
                                            <span className='d-sm-none bolder text-wrap text-dark text-center w-100 d-block responsiveInfoTxt'>
                                                We mobilize knowledge
                                            </span>
                                            <span className="hireUsCardIntroTxt d-inline-block responsiveInfoTxt text-center text-sm-start ps-3 pe-3 ps-sm-0 pe-sm-1">
                                                <span className='bolder text-sm-nowrap d-none d-sm-inline-block'>
                                                    We mobilize knowledge
                                                </span>
                                                <span className='ms-2 fwtHireUsCard'>
                                                    by turning our clients outreach goals into rich, open-access learning experiences.
                                                </span>
                                            </span>
                                        </section>
                                        <section className="ps-sm-5 pe-sm-5">
                                            <div className="d-none d-md-flex flex-row whatDoWeDoSec">
                                                {infoTxtsFirstSec.map((textsAndImg, index) => <HireUsCardFirstSecMobile key={index} textsAndImg={textsAndImg} customCssClass='weMobileKnowledgeSec' />)}
                                            </div>
                                        </section>
                                        <div className="d-flex d-md-none flex-column ps-sm-5 pe-sm-5 ms-4 me-4 ms-sm-5 me-sm-5 whatDoWeDoSec pb-5">
                                            {infoTxtsFirstSec.map((textsAndImg, index) => <HireUsCardFirstSecMobile key={index} textsAndImg={textsAndImg} index={index} />)}
                                        </div>
                                    </section>
                                    <section className="d-flex flex-column mt-5 mb-5 howDoesItWorkSec">
                                        <section className="d-flex justify-content-center align-items-center d-sm-block justify-sm-content-start align-sm-items-stretch ps-sm-5 pe-sm-5">
                                            <h3 className="text-center text-sm-start">
                                                How does it work?
                                            </h3>
                                        </section>
                                        <section className="d-flex flex-column flex-md-row ps-sm-5 pe-sm-5 mt-3">
                                            {hireUsCardsSectionTexts.map(({ content, text, mobileTxt }, index) => {
                                                return (
                                                    <>
                                                        <HireUsCardSection key={index} text={text} mobileTxt={mobileTxt} content={content} />
                                                        {(index === 0) && (
                                                            <section className='d-flex justify-content-center align-items-center mt-3 arrowSec ms-sm-3 me-sm-3'>
                                                                <Image src="/imgs/pretty-down-arrow.png" width={75} height={75} alt="Galactic_PolyMath_First_Sec_Mobile_Info" />
                                                            </section>
                                                        )}
                                                    </>
                                                );
                                            })}
                                        </section>
                                    </section>
                                    <section>
                                        <section className="d-flex ps-sm-5 pe-sm-5">
                                            <h3 className="text-center text-sm-start w-100 text-sm-nowrap">
                                                What will you get?
                                            </h3>
                                        </section>
                                        <section className="d-flex d-md-block flex-column ps-sm-5 pe-sm-5 flex-md-row pb-5 mt-4 whatYouWillGetSec">
                                            {whatYouWillGetTxts.map((textsAndImg, index) => <HireUsCardFirstSecMobile isWhatWillYouGetSec={true} key={index} textsAndImg={textsAndImg} index={index} customCssClass='whatWillYouGetSec' />)}
                                        </section>
                                    </section>
                                    <section className="d-flex mt-5">
                                        <CardContainer headingTxt="What teachers & students says: " userInputs={teacherTestimonies} backgroundImgSrc={WhatTeachersSaysBackground.src} headerContainerClassNamesDynamic="cardHeadingSec mt-5 mt-sm-0 pb-3 pb-sm-0" />
                                    </section>
                                    <ShareYourKnowledge lessonsInfo={lessonsInfo} isMobile />
                                    <ShareYourKnowledge lessonsInfo={lessonsInfo} />
                                    <ClientFundingSec clientFundingSourcesPics={clientFundingSourcesPics} isMobile />
                                    <ClientFundingSec clientFundingSourcesPics={clientFundingSourcesPics}  />
                                    <WhenShouldIReachOutSec />
                                    <section className="d-flex mt-8">
                                        <CardContainer headingTxt="What our clients says: " userInputs={feedbackOfClients} backgroundImgSrc={WhatOurClientsSayBackground.src} headerContainerClassNamesDynamic="cardHeadingSec" />
                                    </section>
                                    <WhoMakesTheLessonsSec />
                                    <section className="d-flex mt-8">
                                        <CardContainer
                                            headingTxt="Dynamic teams translate any body of knowledge"
                                            dynamicCssClasses=' dynamicTeamsSec'
                                            headerContainerClassNamesDynamic="ps-sm-5 ps-md-0 ps-1 pe-1 pe-sm-0 mb-md-4"
                                            isCardOnly
                                        />
                                    </section>
                                    <ScientistSection />
                                    <section className="d-flex mt-5">
                                        <CardContainer
                                            userInputs={grantReviewersFeedback}
                                            headingTxt="Grant Reviewer Feedback"
                                            backgroundImgSrc={GrantReviewerFeedbackBackground.src}
                                            headerContainerClassNamesDynamic="cardHeadingSec"
                                            customCardStyles='granterReviewsCard'
                                        />
                                    </section>
                                    {/* ps-sm-5 pe-sm-5 */}
                                    <section className="howMuchDoesItCostSec mt-4 d-md-none">
                                        <section className="ps-sm-5 pe-sm-5">
                                            <h3 className="display-1 noMargin">How much does it cost?</h3>
                                            {/* <h3 className="display-1 noMargin">cost?</h3> */}
                                        </section>
                                        <section className="w-100 d-flex justify-content-start align-items-center mt-4 mb-5 ps-1 pe-1 ps-sm-0 pe-sm-0 ps-sm-5 pe-sm-5">
                                            <span className="fs-large fw200 fst-italic text-dark text-center text-sm-start ps-1 ps-sm-0 pe-1 pe-sm-0">
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
                                                        setTiersInfoForModalArr={setTiersInfoForModalArr}
                                                    />
                                                )
                                            })}
                                        </section>
                                    </section>
                                    {/* <section className="mt-2 d-flex d-md-none">
                                        <Parallax bgImage={ClassRoom2.src} className="img-background-container" contentClassName='classRoom2ContentStyles position-relative'>
                                            <section className="position-absolute ps-4">
                                                <span className="fs-24 d-block fw650">Ready to inspire students</span>
                                                <span className="fs-24 d-block fw650">with your work?</span>
                                            </section>
                                        </Parallax>
                                    </section>
                                    <section className="mt-4 mb-4 ps-2 ps-sm-3 d-flex d-md-none">
                                        <LetsTalkBtnContainer />
                                    </section> */}
                                </CardBody>
                            </Card>
                        </section>
                    </div>
                    <ReadyToInspireSec />
                </div>
            </Layout>
            {tiersInfoForModalArr.map((tierInfo, index) => (
                <TierInfoModal
                    key={index}
                    index={index}
                    tierModalInfo={tierInfo}
                    setTiersInfoForModalArr={setTiersInfoForModalArr}
                />
            ))

            }
        </>
    );
};

export default HireUsPage;
