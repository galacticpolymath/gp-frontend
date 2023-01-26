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
import { Card } from 'react-bootstrap';
import Layout from '../components/Layout';
import CardContainer from '../components/HireUsComps/CardContainer';
import teacherTestimonies from '../data/HireUsPg/teacherTestimonies.json'
import grantReviewersFeedback from '../data/HireUsPg/grantReviewersFeedback.json'
import feedbackOfClients from '../data/HireUsPg/feedbackOfClients.json'
import WhatTeachersSaysBackground from '../public/imgs/background/2_southeast_purplish_1.png';
import WhatOurClientsSayBackground from '../public/imgs/background/4_north-south_dark-heat-cline_1.png';
import GrantReviewerFeedbackBackground from '../public/imgs/background/5_chaotic_bluish_1.png';
import lessonsInfo from '../data/HireUsPg/lessonsInfo.json'
import tiersInfoForModal from '../data/HireUsPg/tiersInfoForModal.json'
import TierInfoModal from '../components/HireUsComps/modals/TierInfoModal'
import { useState } from 'react';
import ReadyToInspireSec from '../components/HireUsComps/ReadyToInspireSec';
import ShareYourKnowledge from '../components/HireUsComps/sections/ShareYourKnowledge';
import ClientFundingSec from '../components/HireUsComps/sections/ClientFundingSec';
import WhenShouldIReachOutSec from '../components/HireUsComps/sections/WhenShouldIReachOutSec';
import WhoMakesTheLessonsSec from '../components/HireUsComps/sections/WhoMakesTheLessonsSec';
import ScientistSection from '../components/HireUsComps/sections/ScientistSection';
import HowMuchDoesItCostSec from '../components/HireUsComps/sections/HowMuchDoesItCostSec';
import IntroSecHireUs from '../components/HireUsComps/sections/IntroSecHireUs';
import WhatDoWeDoSec from '../components/HireUsComps/sections/WhatDoWeDoSec';
import HowDoesItWorkSec from '../components/HireUsComps/sections/HowDoesItWorkSec';
import WhatYouWillGetSec from '../components/HireUsComps/sections/WhatYouWillGetSec';


const HireUsPage = () => {
    const [tiersInfoForModalArr, setTiersInfoForModalArr] = useState(tiersInfoForModal.map(tier => ({ ...tier, isModalOn: false })))

    return (
        <>
            <Layout description="Galactic PolyMath Hire Us Page." keywords="Hire us, Galactic PolyMath">
                <div className="w-100 hireUsPg d-flex flex-column justify-content-center align-items-center">
                    <div className="container-fluid noPadding noMargin w-100 hireUsPgWrapper">
                        <IntroSecHireUs />
                        <section className="CardSec d-flex justify-content-center align-items-center flex-column align-sm-items-stretch ps-3 pe-3 ps-sm-4 pe-sm-4">
                            <Card className='hireUsPgInfoCard w-100 border shadow pt-4 pb-5'>
                                <Card.Body className="hireUsPgInfoCardBody">
                                    <WhatDoWeDoSec />
                                    <HowDoesItWorkSec />
                                    <WhatYouWillGetSec />
                                    <section className="d-flex mt-5">
                                        <CardContainer headingTxt="What teachers & students says: " userInputs={teacherTestimonies} backgroundImgSrc={WhatTeachersSaysBackground.src} headerContainerClassNamesDynamic="cardHeadingSec mt-5 mt-sm-0 pb-3 pb-sm-0" />
                                    </section>
                                    <ShareYourKnowledge lessonsInfo={lessonsInfo} isMobile />
                                    <ShareYourKnowledge lessonsInfo={lessonsInfo} />
                                    <ClientFundingSec isMobile />
                                    <ClientFundingSec />
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
                                            customCardStyles='grantReviewsCard'
                                            itemCarouselStylesCustom='grantReviewItemCarousel'
                                        />
                                    </section>
                                    <HowMuchDoesItCostSec setTiersInfoForModalArr={setTiersInfoForModalArr} />
                                </Card.Body>
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
