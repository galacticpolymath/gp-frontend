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
import Image from 'next/image'

const ShareYourKnowledgeMobileDisplay = ({ lessonsInfo, isMobile }) => {
    return (
        isMobile ?
            <>
                <section className="d-flex d-md-none ps-2 pe-2 ps-sm-5 pe-sm-5 mt-5">
                    <div className='shareYourKnowledgeImgContainer position-relative'>
                        <Image src="/imgs/classroom.jpg" layout='fill' alt="Galactic_PolyMath_First_Sec_Mobile_Info" className="h-100 w-100 position-absolute" />
                    </div>
                </section>
                <section className="mt-sm-5 ps-sm-5 d-flex justify-content-center justify-content-sm-start d-md-none pe-sm-3">
                    <section>
                        <h3 className="display-1 text-center text-sm-start noMargin">Share your knowledge with anyone, anywhere!</h3>
                    </section>
                </section>
                <section className="mt-4 mt-sm-7 ps-sm-5 pe-sm-5 d-flex d-md-none">
                    <PicAndDescriptionSec
                        text="We promote lessons through our growing GP Constellation dissemination network."
                        imgPath="/imgs/GP_Constellation_dark.png"
                        parentSecStyles="GPConstellationSec"
                    />
                </section>
                <section className="mt-5 ps-sm-5 pe-sm-5 eachLessonMainSec d-flex flex-column d-md-none">
                    <section className="w-100">
                        <h5 className="fst-italic text-dark text-center text-wrap w-100 text-sm-start move10pxRightResponsive">Each lesson is: </h5>
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
            <>
            
            </>
    )
}

export default ShareYourKnowledgeMobileDisplay;