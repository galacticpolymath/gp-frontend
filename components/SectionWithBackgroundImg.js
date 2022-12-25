/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

const SectionWithBackgroundImg = ({ children, backgroundImgSrc }) => {
    const _classNames = `img-background-container ${!backgroundImgSrc ? 'bg-carousel-color pt-4 pb-4' : 'pt-3 pb-5 parallax'}`;
    const _style = backgroundImgSrc ? { backgroundImage: `url(${backgroundImgSrc})` } : null;

    return (
        <div className={_classNames} style={_style}>
            {children}
        </div>
    )
}

export default SectionWithBackgroundImg;
