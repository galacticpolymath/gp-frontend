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

import scientists from '../../../data/HireUsPg/scientists.json'
import PicAndDescriptionSec from './PicAndDescriptionSec';

const ScientistSection = () => (
    <section className="scientistSection">
        <section className="d-block">
            <section className="w-100 d-flex justify-content-center align-items-center justify-content-md-start align-items-md-stretch mt-5 mb-5 mb-md-3 mb-xl-5 ps-md-5 pe-md-5 ms-md-5 me-md-5 pt-md-5">
                <h5 className="scientistHeadingTxt fw200 fst-italic text-dark text-center text-sm-start w-75">
                    Some of the many talented scientists, communicators, educators, and artists we work with:
                </h5>
            </section>
        </section>
        <section className="d-flex justify-content-center align-items-center justify-content-md-start align-items-md-stretch ps-md-5 pe-md-5 ms-md-5 me-md-5 pb-md-5 pb-xl-5">
            <section className="d-flex d-md-block flex-column flex-md-row justify-content-center justify-content-md-start scientistSec">
                {scientists.map((scientist, index) => {
                    const { alt, src, name, description } = scientist;

                    return (
                        <PicAndDescriptionSec
                            key={index}
                            imgPath={src}
                            text={description}
                            name={name}
                            alt={alt}
                            parentSecStyles={`secWithHumanPic scientist d-md-inline-flex`}
                        />
                    )
                })}
            </section>
        </section>
    </section>
)


export default ScientistSection;
