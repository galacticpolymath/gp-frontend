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
import Image from 'next/image';
import { Card } from 'react-bootstrap';
import SectionWithBackgroundImg from '../SectionWithBackgroundImg';

const HireUsTestimoniesSec = () => {
    return (
        <SectionWithBackgroundImg>
            <section className="d-flex justify-content-center align-items-center h-25">
                <h2 className="headingCarousel bolder">What teachers say:</h2>
            </section>
            <section>
                {/* put carousel here */}
            </section>   
        </SectionWithBackgroundImg>
    )
}

export default HireUsTestimoniesSec;