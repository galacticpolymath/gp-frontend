/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
import { useEffect, useRef } from "react";
import Arrow from "./Arrow";
import { useInViewport } from "react-in-viewport";

/**
 * The prop 'customDivStyling' must not include the display field.
 * */
const ClickMeArrow = ({ handleElementVisibility, customDivStyling, willTakeOffOfDom, willShowArrow }) => {
    const arrowContainerRef = useRef();
    const { inViewport } = useInViewport(arrowContainerRef);

    useEffect(() => {
        if (handleElementVisibility) {
            handleElementVisibility();
        } else {
            console.error('Did not pass a "handleElementVisibility" function.');
        }
    }, [inViewport]);

    return (
        <div
            ref={arrowContainerRef}
            id='arrow-container'
            style={{ ...customDivStyling, display: willTakeOffOfDom ? 'none' : 'block' }}
            className={`position-absolute ${willShowArrow ? 'fade-in' : 'fade-out'}`}
        >
            <span style={{ transform: 'translateY(11px)', fontSize: 'clamp(17px, 2vw, 18px)' }} className='p-1 d-block fw-bold text-nowrap'>
                CLICK TO SEE MORE!
            </span>
            <Arrow className='down-arrow jump-infinite-animate' />
        </div>

    );
};

export default ClickMeArrow;