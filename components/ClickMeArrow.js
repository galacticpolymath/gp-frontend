/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
import { useEffect } from "react";
import Arrow from "./Arrow";
import { getPercentageSeen } from "../customHooks/useScrollHandler";

const ClickMeArrow = ({ id, _arrowContainer }) => {
    // { isInView, wasShown }
    const [arrowContainer, setArrowContainer] = _arrowContainer;

    const handleOnScroll = () => {
        const arrowContainerElem = document.getElementById(id);

        if (arrowContainerElem && (getPercentageSeen(arrowContainerElem) > 10) && arrowContainer.wasShown) {
            setArrowContainer({ isInView: true, wasShown: true });
        } else {
            setArrowContainer(state => ({ ...state, isInView: true }));
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleOnScroll);
    }, []);

    return (
        <div
            id={id}
            style={{ bottom: '60px', right: '50px' }}
            className={`position-absolute  ${arrowContainer.isInView ? "fade-in" : "fade-out"}`}
        >
            <span style={{ transform: 'translateY(11px)', fontSize: 'clamp(17px, 2vw, 18px)' }} className='p-1 d-block fw-bold text-nowrap'>
                CLICK TO SEE MORE!
            </span>
            <Arrow className='down-arrow jump-infinite-animate' />
        </div>
    );
};

export default ClickMeArrow;