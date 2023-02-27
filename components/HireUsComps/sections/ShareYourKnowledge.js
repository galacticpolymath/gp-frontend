/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-tag-spacing */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable brace-style */
/* eslint-disable comma-dangle */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import PicAndDescriptionSec from './PicAndDescriptionSec'
import Image from "next/image";

const ShareYourKnowledge = ({ lessonsInfo, isMobile }) => {
    return isMobile ?
        <>
            <section className="d-flex d-md-none ps-2 pe-2 ps-sm-5 pe-sm-5 ps-md-0 pe-md-0 mt-5 ps-xl-5 pe-xl-5 justify-content-md-center align-items-md-center justify-content-xl-start align-items-xl-stretch">
                <div className='shareYourKnowledgeImgContainer position-relative'>
                    <Image
                        src="/imgs/classroom.jpg"
                        alt="Galactic_PolyMath_First_Sec_Mobile_Info"
                        className="h-100 w-100 position-absolute"
                        fill
                        sizes="100vw" />
                </div>
            </section>
            <section className="mt-sm-5 ps-sm-5 d-flex justify-content-center justify-content-sm-start d-md-none pe-sm-3">
                <section>
                    <h3 className="text-center text-sm-start noMargin">Share your knowledge with anyone, anywhere!</h3>
                </section>
            </section>
            <section className="mt-4 mt-md-7 ps-sm-5 pe-sm-5 d-flex d-md-none">
                <PicAndDescriptionSec
                    text="We promote lessons through our growing GP Constellation dissemination network."
                    imgPath="/imgs/GP_Constellation_dark.png"
                    parentSecStyles="GPConstellationSec"
                />
            </section>
            <section className="mt-5 ps-sm-5 pe-sm-5 eachLessonMainSec d-flex flex-column d-md-none">
                <section className="w-100">
                    <h3 className="fst-italic text-dark text-center text-wrap w-100 text-sm-start move10pxRightResponsive">Each lesson is: </h3>
                </section>
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
        </>
        :
        <section className="d-none d-md-flex flex-column ps-5 pe-5 mt-5 shareYourKnowledgeDesktopSec">
            <section className="w-100 d-flex mt-3 mb-xl-4">
                <section className="w-50 d-flex flex-column pt-xl-2">
                    <section className="w-100">
                        <h3 className="text-center text-sm-start noMargin">Share your knowledge with anyone, anywhere!</h3>
                    </section>
                    <section className="w-100 introTxtShareYourKnowledge">
                        <span className="d-inline-block mt-3">
                            We promote lessons through our growing GP Constellation dissemination network.
                        </span>
                    </section>
                </section>
                <section className="w-50 d-flex justify-content-center align-items-center">
                    <div className='shareYourKnowledgeImgContainer position-relative'>
                        <PicAndDescriptionSec
                            imgPath="/imgs/GP_Constellation_dark.png"
                            parentSecStyles="GPConstellationSec onDesktop d-md-flex justify-content-md-center align-items-md-center align-items-xl-stretch"
                            isRegImg
                        />
                    </div>
                </section>
            </section>
            <section className="w-100 d-flex flex-md-column-reverse flex-xl-row">
                <section className="d-flex justify-content-center shareYourKnowledgeImgSec">
                    <div className='shareYourKnowledgeImgContainer classRoom position-relative'>
                        {/* <Image src="/imgs/classroom.jpg" layout='fill' alt="Galactic_PolyMath_First_Sec_Mobile_Info" className="h-100 w-100 position-absolute" /> */}
                        <img src="/imgs/classroom.jpg" alt="Galactic_PolyMath_First_Sec_Mobile_Info" className='' />
                    </div>
                </section>
                <section className="d-flex flex-column justify-content-center align-items-center mt-md-5 mt-xl-0 ms-xl-5 mb-md-4 mt-xl-0 lessonInfoSec">
                    <div className="eachLessonWrapper">
                        <section className="w-100">
                            <h3 className="fst-italic text-dark text-center text-wrap w-100 text-sm-start move10pxRightResponsive">Each lesson is: </h3>
                        </section>
                        <ul className="eachLessonInfoList">
                            {lessonsInfo.map(({ normalTxt, underLineTxt }, index) => (
                                <li className="text-dark fw249" key={index}>
                                    {normalTxt}
                                    <span className="text-decoration-underline underline-less-thick">
                                        {underLineTxt}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </section>
        </section>;
}

export default ShareYourKnowledge;