/* eslint-disable no-console */
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
import { useEffect, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';

import AutoCarousel from '../AutoCarousel';
import SectionWithBackgroundImg from '../SectionWithBackgroundImg';

const CarouselContainer = ({ headingTxt, userInputs }) => {
    const [index, setIndex] = useState(0);
    const [isCarouselPaused, setIsCarouselPaused] = useState(false)
    const timeoutRef = useRef(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    const handleOnMouseOver = () => {
        setIsCarouselPaused(true)
    }

    const handleOnMouseLeave = () => {
        setIsCarouselPaused(false)
    }

    useEffect(() => {
        if (!isCarouselPaused) {
            resetTimeout();
            timeoutRef.current = setTimeout(
                () =>
                    setIndex(prevIndex =>
                        (prevIndex === (userInputs.length - 1)) ? 0 : prevIndex + 1
                    ),
                4000
            );

            return () => {
                resetTimeout();
            };
        }
    }, [index, isCarouselPaused]);

    return (
        <SectionWithBackgroundImg>
            <section className="d-flex justify-content-center align-items-center autoCarouselContainerHeading">
                <h2 className="headingCarousel bolder">{headingTxt}</h2>
            </section>
            <section className="d-flex justify-content-center align-items-center">
                <Card className='autoCarouselContainerCard'>
                    <Card.Body className="position-relative" onMouseOver={handleOnMouseOver} onMouseLeave={handleOnMouseLeave}>
                        <div className="autoCarouselContainer">
                            <div className="autoCarouselSlider" style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}>
                                {userInputs.map((userInput, index) => {
                                    const { feedback, name, occupation, city } = userInput;
                                    return (
                                        <div className="autoCarouselItem border" key={index}>
                                            <section>
                                                <section>
                                                    <span className="text-dark feedbackTxt">{feedback}</span>
                                                </section>
                                                <section className="d-flex border justify-content-end">
                                                    <section className='flex-column d-flex'>
                                                        <span className="text-wrap text-dark">-{name}</span>
                                                        <span className="text-wrap text-dark">{occupation}</span>
                                                        <span className="text-wrap text-dark">{city}</span>
                                                    </section>
                                                </section>
                                            </section>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </section>
        </SectionWithBackgroundImg>
    )
}

export default CarouselContainer;