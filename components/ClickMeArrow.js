/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
import { useEffect, useRef } from "react";
import Arrow from "./Arrow";
import { useInViewport } from "react-in-viewport";

const ClickMeArrow = ({
    handleElementVisibility,
    willShowArrow,
    containerStyle = {},
    clickToSeeMoreStyle = { transform: 'translateY(11px)', fontSize: 'clamp(17px, 2vw, 18px)', color: 'black' },
    children = <>CLICK TO SEE MORE!</>,
}) => {
    const arrowContainerRef = useRef();
    const { inViewport } = useInViewport(arrowContainerRef);

    useEffect(() => {
        if (typeof handleElementVisibility === 'function') {
            handleElementVisibility(inViewport);
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
                {children}
            </span>
            <Arrow className='down-arrow jump-infinite-animate' />
        </div>

    );
};

export default ClickMeArrow;