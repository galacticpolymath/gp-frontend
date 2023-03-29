/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable curly */
/* eslint-disable react/jsx-curly-spacing */
/* eslint-disable brace-style */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable prefer-template */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable quotes */
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

import PicAndDescriptionSec from "./PicAndDescriptionSec";
import mattsAwards from '../../../data/HireUsPg/mattsAwards.json'


// PROBLEM: the image for the owner section is not showing up at all 

const WhoMakesTheLessonsSec = () => {

    return (
        <section className="mt-5 ps-sm-5 pe-sm-5 d-flex flex-column ownerInfoSec">
            <section>
                <h3 className="noMargin d-block d-md-none">Who makes the</h3>
                <h3 className="noMargin d-block d-md-none">lessons?</h3>
                <h3 className="noMargin d-none d-md-block">Who makes the lessons?</h3>
            </section>
            <section className="mt-3 d-flex flex-column">
                <span className="text-dark fst-italic fw249 d-none d-sm-inline d-md-none">The GP Team is led by our founder,</span>
                <span className="text-dark fst-italic fw249 d-none d-sm-inline d-md-none">Matt Wilkins, PhD.</span>
                <span className="text-dark text-center text-md-start pe-1 fst-italic fw249 d-inline d-sm-none d-md-inline">The GP Team is led by our founder, Matt Wilkins, PhD.</span>
            </section>
            <section className="d-flex flex-column flex-lg-row mattsAwardParentSec">
                <section className="mt-4 mb-4 mt-sm-5 mt-md-5 d-block d-lg-none">
                    <PicAndDescriptionSec
                        text="Matt is a scientist, teacher at the middle school to college level, and science communicator, who has won awards for his work: "
                        imgPath="/imgs/profilePics/matt_wilkins_profile3_sq_xs.jpg"
                        parentSecStyles="ownerSection secWithHumanPic"
                    />
                </section>
                <section className="d-none pt-lg-4 d-lg-block">
                    <PicAndDescriptionSec
                        text="Matt is an award-winning scientist, science communicator, and teacher at the middle school to college level."
                        imgPath="/imgs/profilePics/matt_wilkins_profile3_sq_xs.jpg"
                        parentSecStyles="ownerSection secWithHumanPic"
                    />
                </section>
                <section className="pt-md-2 pt-lg-4 mattsAwardsSec">
                    {mattsAwards.map((award, index) => {
                        const { alt, src, txt, link } = award;
                        return (
                            <PicAndDescriptionSec
                                parentSecStyles="picAndDescriptionSecInList mattsAward"
                                key={index}
                                link={link}
                                alt={alt}
                                text={txt}
                                imgPath={src}
                            />
                        )
                    })}
                </section>
            </section>
        </section>
    )
}

export default WhoMakesTheLessonsSec;