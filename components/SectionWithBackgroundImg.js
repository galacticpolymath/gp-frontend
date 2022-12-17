/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import Image from 'next/image';

const SectionWithBackgroundImg = ({children}) => {
    return (
        <div className="img-background-container position-relative pt-5 pb-5">
            <Image src="/imgs/background/4_north-south_dark-heat-cline_1.png" layout='fill' alt="Galatic_Polymath_background_image" className="negative-z-index" />
            {children}
        </div>
    )
}

export default SectionWithBackgroundImg;
