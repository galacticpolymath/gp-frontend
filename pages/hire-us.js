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
import HireUsCardFirstSecMobile from '../components/HireUsComps/HireUsCardFirstSecMobile';
import CarouselContainer from '../components/HireUsComps/CarouselContainer';
import SectionWithBackgroundImg from '../components/SectionWithBackgroundImg';
import teacherTestimonies from '../data/HireUsPg/teacherTestimonies.json'


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
                            <section className="d-flex flex-column ps-3 pe-3">
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
                            <section className="d-flex d-md-none flex-column mt-15">
                                <section className="ps-4 pe-4">
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
                            <section className="d-flex">
                                <CarouselContainer headingTxt="What teachers says: " userInputs={teacherTestimonies} />
                            </section>
                        </CardBody>
                    </Card>
                </section>

            </div>
        </Layout>
    );
};

export default HireUsPage;
