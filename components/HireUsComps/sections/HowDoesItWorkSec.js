/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import ReactPlayer from "react-player";
import HireUsCardSection from "../HireUsCardSection";
import Image from 'next/image'
import { useEffect, useState } from "react";


const HowDoesItWorkSec = () => {
    const [isDOMLoaded, setIsDOMLoaded] = useState(false);

    useEffect(() => {
        setIsDOMLoaded(true);
    }, []);

    const cardVideoSec1 = (
        <video className="rounded looped-vid-hire-us" autoPlay muted loop>
            <source src="./videos/client-asset-to-lesson-animation.mp4" type="video/mp4" />
        </video>
    );
    const cardVideoSec2 = isDOMLoaded && (
        <div className="video-styles rounded overflow-hidden">
            <ReactPlayer
                url='https://www.youtube.com/watch?v=V0EtA5pbVSY'
                width='100%'
                height="100%"
                light
                playing
                controls />
        </div>
    )

    const hireUsCardsSectionTexts = [{ text: "1. You give us your outreach goals, along with complex texts, data, and media related to your work: ", mobileTxt: "You give us your outreach goals, along with complex texts, data, and any media you might have related to your work: ", content: cardVideoSec1 }, { text: "2. We create lessons and supporting media that achieve your outreach aims by making your work accessible to teachers around the world. ", mobileTxt: "We create lessons and supporting multimedia that achieve your outreach aims by making your work accessible to teachers around the world.", content: cardVideoSec2 }]

    return (
        <section className="d-flex flex-column mt-5 mb-5 howDoesItWorkSec">
            <section className="d-flex justify-content-center align-items-center d-sm-block justify-sm-content-start align-sm-items-stretch ps-sm-5 pe-sm-5">
                <h3 className="text-center text-sm-start">
                    How does it work?
                </h3>
            </section>
            <section className="d-flex flex-column justify-content-md-center align-items-md-center justify-content-lg-start align-items-lg-stretch flex-lg-row ps-sm-5 pe-sm-5 mt-3">
                {/* {hireUsCardsSectionTexts.map(({ content, text, mobileTxt }, index) => {
                    return (
                        <>
                            <HireUsCardSection key={index} text={text} mobileTxt={mobileTxt} content={content} />
                            {(index === 0) && (
                                <section className='d-flex justify-content-center align-items-center mt-3 arrowSec ms-sm-3 me-sm-3'>
                                    <Image src="/imgs/pretty-down-arrow.png" width={50} height={50} alt="Galactic_PolyMath_First_Sec_Mobile_Info" />
                                </section>
                            )}
                        </>
                    );
                })} */}
                <HireUsCardSection
                    text={hireUsCardsSectionTexts[0].text}
                    mobileTxt={hireUsCardsSectionTexts[0].mobileTxt}
                    content={hireUsCardsSectionTexts[0].content}
                />
                <section className='d-flex justify-content-center align-items-center mt-3 arrowSec ms-sm-3 me-sm-3'>
                    <Image src="/imgs/pretty-down-arrow.png" width={50} height={50} alt="Galactic_PolyMath_First_Sec_Mobile_Info" />
                </section>
                <HireUsCardSection
                    text={hireUsCardsSectionTexts[1].text}
                    mobileTxt={hireUsCardsSectionTexts[1].mobileTxt}
                    content={hireUsCardsSectionTexts[1].content}
                />
            </section>
        </section>
    )
}

export default HowDoesItWorkSec;