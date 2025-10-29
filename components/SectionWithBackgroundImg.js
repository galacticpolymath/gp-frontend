/* eslint-disable semi */
 
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

const SectionWithBackgroundImg = ({ children, backgroundImgSrc, dynamicCssClasses }) => {
    let _classNames = `img-background-container ${!backgroundImgSrc ? 'bg-carousel-color pt-4 pb-4' : 'pt-3 pb-5 parallax'}`;
    const _style = backgroundImgSrc ? { backgroundImage: `url(${backgroundImgSrc})` } : null;

    if(dynamicCssClasses){
        _classNames += ` ${dynamicCssClasses}`
    }

    return (
        <div className={_classNames} style={_style}>
            {children}
        </div>
    )
}

export default SectionWithBackgroundImg;
