/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
import { useEffect, useRef } from "react";
import Arrow from "./Arrow";
import { useInViewport } from "react-in-viewport";

/**
 * Apart from the display field, the default object for the 'containerStyle' prop is as follows: 
 * { zIndex: 1000, bottom: '60px', right: '50px', display: showElementConditional ? 'none' : 'block' }
 * */
const ClickMeArrow = ({
    handleElementVisibility,
    willShowArrow,
    containerStyle = {},
    clickToSeeMoreStyle = { transform: 'translateY(11px)', fontSize: 'clamp(17px, 2vw, 18px)' },
}) => {
    const arrowContainerRef = useRef();
    const { inViewport } = useInViewport(arrowContainerRef);

    useEffect(() => {
        if (typeof handleElementVisibility === 'function') {
            handleElementVisibility(inViewport);
        } else {
            console.error('Did not pass a "handleElementVisibility" function.');
        }
    }, [inViewport]);

    return (
        <div
            ref={arrowContainerRef}
            id='arrow-container'
            style={containerStyle}
            className={`position-absolute ${willShowArrow ? 'fade-in' : 'fade-out'}`}
        >
            <span style={clickToSeeMoreStyle} className='p-1 d-block fw-bold text-nowrap'>
                CLICK TO SEE MORE!
            </span>
            <Arrow className='down-arrow jump-infinite-animate' />
        </div>

    );
};

export default ClickMeArrow;