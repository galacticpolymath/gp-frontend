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
import AutoCarousel from '../AutoCarousel';
import SectionWithBackgroundImg from '../SectionWithBackgroundImg';

const CarouselContainer = ({ headingTxt, userInputs }) => {
    return (
        <SectionWithBackgroundImg>
            <section className="d-flex justify-content-center align-items-center h-25">
                <h2 className="headingCarousel bolder">{headingTxt}</h2>
            </section>
            <section className="d-flex justify-content-center align-items-center">
                <AutoCarousel userInputs={userInputs} />
            </section>
        </SectionWithBackgroundImg>
    )
}

export default CarouselContainer;