/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import Image from 'next/image';

const SectionWithBackgroundImg = ({ children, backgroundImgSrc }) => {
    return (
        <div className="img-background-container pt-5 pb-5 parallax" style={{ backgroundImage: `url(${backgroundImgSrc})` }}>
            {children}
        </div>
    )
}

export default SectionWithBackgroundImg;
