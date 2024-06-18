/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
import { useEffect, useRef } from "react";
import Arrow from "./Arrow";
import throttle from "lodash.throttle";
import { useInViewport } from "react-in-viewport";

const ClickMeArrow = ({ _arrowContainer }) => {
    const [arrowContainer, setArrowContainer] = _arrowContainer;
    const arrowContainerRef = useRef();
    const { inViewport } = useInViewport(arrowContainerRef);

    let timer = null;

    const handleElementVisibility = throttle(() => {
        clearTimeout(timer);

        if (inViewport) {
            setArrowContainer(state => ({ ...state, isInView: true, wasShown: true }));

            timer = setTimeout(() => {
                setArrowContainer(state => ({ ...state, isInView: false }));
            }, 3500);
        }
    }, 100);

    useEffect(() => {
        handleElementVisibility();
    }, [inViewport]);

    return (
        <div
            ref={arrowContainerRef}
            id='arrow-container'
            style={{ zIndex: 1000, bottom: '60px', right: '50px', display: arrowContainer.canTakeOffDom ? 'none' : 'block' }}
            className={`position-absolute ${arrowContainer.isInView ? 'fade-in' : 'fade-out'}`}
        >
            <span style={{ transform: 'translateY(11px)', fontSize: 'clamp(17px, 2vw, 18px)' }} className='p-1 d-block fw-bold text-nowrap'>
                CLICK TO SEE MORE!
            </span>
            <Arrow className='down-arrow jump-infinite-animate' />
        </div>

    );
};

export default ClickMeArrow;