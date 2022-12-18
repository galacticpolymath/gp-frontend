/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable quotes */
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
import Image from 'next/image'
import SectionWithBackgroundImg from '../SectionWithBackgroundImg';

const CarouselContainer = ({ headingTxt, userInputs, backgroundImgSrc, pics, autoCarouselHeadingTxtClassNames, headerContainerClassNamesDynamic }) => {
    const autoCarouselHeadingTxt = `bolder ${autoCarouselHeadingTxtClassNames ?? 'headingCarousel'}`;
    const headerContainerClassNames = `d-flex justify-content-center align-items-center ${headerContainerClassNamesDynamic ?? ""}`
    const cardStyles = `autoCarouselContainerCard ${pics ? 'mt-3' : ''}`;
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
        if (!isCarouselPaused && !pics) {
            resetTimeout();
            const targetArr = userInputs ? userInputs : pics;
            timeoutRef.current = setTimeout(
                () =>
                    setIndex(prevIndex =>
                        (prevIndex === (targetArr.length - 1)) ? 0 : prevIndex + 1
                    ),
                4000
            );

            return () => {
                resetTimeout();
            };
        }
    }, [index, isCarouselPaused]);

    return (
        <SectionWithBackgroundImg backgroundImgSrc={backgroundImgSrc}>
            <section className={headerContainerClassNames}>
                <h2 className={autoCarouselHeadingTxt}>{headingTxt}</h2>
            </section>
            <section className="d-flex justify-content-center align-items-center">
                <Card className={cardStyles}>
                    <Card.Body className="position-relative" onMouseOver={handleOnMouseOver} onMouseLeave={handleOnMouseLeave}>
                        {userInputs &&
                            <div className="autoCarouselContainer">
                                <div className="autoCarouselSlider" style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}>
                                    {userInputs.map((userInput, index) => {
                                        const { feedback, person, occupation, city } = userInput;
                                        return (
                                            <div className="autoCarouselItem position-relative" key={index}>
                                                <section className="w-100 h-100 d-flex justify-content-center align-items-center">
                                                    <section className="pb-5 mb-5 me-3">
                                                        <span className="text-dark fst-italic feedbackTxt">"{feedback}"</span>
                                                    </section>
                                                    <section className="d-flex justify-content-end position-absolute feedbackInfoSec">
                                                        <section className='flex-column d-flex'>
                                                            <span className="text-wrap text-dark feedBackTxtName fst-italic">- {person}</span>
                                                            <span className="text-wrap text-dark fst-italic">{occupation}</span>
                                                            <span className="text-wrap text-dark fst-italic">{city}</span>
                                                        </section>
                                                    </section>
                                                </section>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>}
                        {pics &&
                            <div className="w-100">
                                <section className="w-100 d-flex justify-content-center align-items-center">
                                    {
                                        pics.map(({ path, alt }, index) => {
                                            return (
                                                <div key={index} className="carouselImgContainer position-relative">
                                                    <Image layout="fill" objectFit="contain" src={path} alt={alt} />
                                                </div>
                                            )
                                        })
                                    }
                                </section>
                            </div>
                        }
                    </Card.Body>
                </Card>
            </section>
        </SectionWithBackgroundImg>
    )
}

export default CarouselContainer;