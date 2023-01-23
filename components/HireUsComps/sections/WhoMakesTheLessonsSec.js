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

const WhoMakesTheLessonsSec = () => {

    return (
        <section className="mt-5 ps-sm-5 pe-sm-5 d-flex pb-5 flex-column ownerInfoSec">
            <section>
                <h3 className="display-1 noMargin d-block d-md-none">Who makes the</h3>
                <h3 className="display-1 noMargin d-block d-md-none">lessons?</h3>
                <h3 className="display-1 noMargin d-none d-md-block">Who makes the lessons?</h3>
            </section>
            <section className="mt-3 d-flex flex-column">
                <span className="text-dark fs-large fst-italic fw249 d-none d-sm-inline d-md-none">The GP Team is led by our founder,</span>
                <span className="text-dark fs-large fst-italic fw249 d-none d-sm-inline d-md-none">Matt Wilkins, PhD.</span>
                <span className="text-dark fs-large text-center text-md-start ps-1 pe-1 fst-italic fw249 d-inline d-sm-none d-md-inline">The GP Team is led by our founder, Matt Wilkins, PhD.</span>
            </section>
            <section className="d-flex flex-column flex-md-row mattsAwardParentSec">
                <section className="mt-4 mb-4 mt-sm-5 mt-md-5 d-block d-md-none">
                    <PicAndDescriptionSec
                        text="Matt is a scientist, teacher at the middle school to college level, and science communicator, who has won awards for his work: "
                        imgPath="/imgs/matt_wilkins_profile3_xs.jpg"
                        parentSecStyles="ownerSection secWithHumanPic"
                    />
                </section>
                <section className="mt-5 d-none d-md-block">
                    <PicAndDescriptionSec
                        text="Matt is an award-winning scientist, science communicator, and teacher at the middle school to college level."
                        imgPath="/imgs/matt_wilkins_profile3_xs.jpg"
                        parentSecStyles="ownerSection secWithHumanPic"
                    />
                </section>
                <section className="ms-md-5 pt-md-5">
                    {mattsAwards.map((award, index) => {
                        const { alt, src, txt, link } = award;
                        return (
                            <PicAndDescriptionSec
                                parentSecStyles="picAndImageSecInList mattsAward"
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