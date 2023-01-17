/* eslint-disable curly */
/* eslint-disable react/jsx-curly-spacing */
/* eslint-disable brace-style */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable prefer-template */
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
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BsCircle, BsCircleFill, BsFillPauseCircleFill, BsFillPlayCircleFill } from "react-icons/bs";
import Image from 'next/image'
import SectionWithBackgroundImg from '../SectionWithBackgroundImg';
import Button from 'react-bootstrap/Button';
import { Parallax } from 'react-parallax';

const CarouselContainer = ({ headingTxt, userInputs, backgroundImgSrc, pics, autoCarouselHeadingTxtClassNames, headerContainerClassNamesDynamic, isCardOnly }) => {
    const autoCarouselHeadingTxt = `bolder defaultHeadingCarouselStyles text-center ${autoCarouselHeadingTxtClassNames ?? 'headingCarousel'}`;
    const headerContainerClassNames = `d-flex justify-content-center align-items-center ${headerContainerClassNamesDynamic ?? ""}`
    let cardStyles = `autoCarouselContainerCard ${pics ? 'mt-3 picsCardContainer' : ''}`;
    cardStyles = isCardOnly ? (cardStyles + 'cardOnlyStyles mt-3 pt-1 pb-4 pe-2 fw245') : cardStyles
    const timeoutRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [isCarouselPaused, setIsCarouselPaused] = useState(false);
    const BULL_POINT_INDEX_NUMS = userInputs && userInputs.map((_, index) => index);


    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    const handlePausePlayBtnClick = () => {
        setIsCarouselPaused(isCarouselPaused => !isCarouselPaused)
    }

    const handleBulletPtClick = (newIndex) => {
        setIsCarouselPaused(true)
        setIndex(newIndex)
    }

    const handleNavBtnClick = (num) => {
        setIsCarouselPaused(true)
        setIndex(prevIndex => {
            const wasBackBtnPressed = -1 === Math.sign(num);

            if ((prevIndex === 0) && wasBackBtnPressed) return userInputs.length - 1;

            if ((prevIndex === (userInputs.length - 1)) && wasBackBtnPressed) return (prevIndex + num);

            return (prevIndex === (userInputs.length - 1)) ? 0 : (prevIndex + num);
        })
    }

    useEffect(() => {
        if (!isCarouselPaused && !isCardOnly) {
            resetTimeout();
            const targetArr = userInputs ? userInputs : pics;
            timeoutRef.current = setTimeout(
                () =>
                    setIndex(prevIndex => {
                        return (prevIndex === (targetArr.length - 1)) ? 0 : prevIndex + 1;
                    }),
                4000
            );

            return () => {
                resetTimeout();
            };
        }
    }, [index, isCarouselPaused]);

    return (
        isCardOnly ?
            <SectionWithBackgroundImg backgroundImgSrc={backgroundImgSrc}>
                <section className={headerContainerClassNames}>
                    <h2 className={autoCarouselHeadingTxt}>{headingTxt}</h2>
                </section>
                <section className="d-flex justify-content-center align-items-center">
                    <Card className={cardStyles}>
                        <Card.Body className="position-relative cardBodyStyles">
                            {(userInputs && !isCardOnly) &&
                                <>
                                    <section className="position-absolute h-100 start-0 d-flex justify-content-center align-items-center pe-3">
                                        <button className="noBtnStyles pb-3 moveLeft noColorChangeOnClick btnColorChangeOnHover" onClick={() => { handleNavBtnClick(-1) }}>
                                            <IoIosArrowBack className="text-muted arrowNavigationCarousel backBtnCarousel op-5" />
                                        </button>
                                    </section>
                                    <section className="position-absolute h-100 end-0 d-flex justify-content-center align-items-center">
                                        <button className="noBtnStyles pb-3 moveRight noColorChangeOnClick btnColorChangeOnHover" onClick={() => { handleNavBtnClick(1) }}>
                                            <IoIosArrowForward className="text-muted arrowNavigationCarousel forwardBtnCarousel op-5" />
                                        </button>
                                    </section>
                                    <div className="autoCarouselContainer">
                                        <div className="autoCarouselSlider" style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}>
                                            {userInputs.map((userInput, index) => {
                                                const { feedback, person, occupation, city } = userInput;
                                                return (
                                                    <div className="autoCarouselItem position-relative" key={index}>
                                                        <section className="w-100 h-100 d-flex flex-column flex-sm-row justify-content-center align-items-center feedBackSec">
                                                            <section className="pb-sm-5 mb-sm-5 me-sm-3">
                                                                <span className="text-dark fst-italic text-center text-sm-start feedbackTxt fw275">"{feedback}"</span>
                                                            </section>
                                                            <section className="d-flex justify-content-center align-items-center align-items-sm-stretch justify-content-sm-end mt-3 mt-sm-0 feedbackInfoSec">
                                                                <section className='flex-column d-flex justify-content-center justify-content-sm-start align-items-center align-items-sm-stretch'>
                                                                    <span className="text-wrap text-center text-sm-start text-dark feedBackTxtName fst-italic fw275">- {person}</span>
                                                                    <span className="text-wrap text-dark fst-italic fw275">{occupation}</span>
                                                                    {!!city && <span className="text-wrap text-dark fst-italic fw275">{city}</span>}
                                                                </section>
                                                            </section>
                                                        </section>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <section className='d-flex flex-column justify-content-center align-items-center pb-1 mt-4 mt-sm-0'>
                                            <section className="w-100 d-flex justify-content-center align-items-center">
                                                {BULL_POINT_INDEX_NUMS.map((num, index) => (
                                                    (num === index) ? <BsCircleFill className="text-dark ms-1" key={index} /> : <BsCircle key={index} className="text-dark ms-1" onClick={() => { handleBulletPtClick(num) }} />
                                                ))}
                                            </section>
                                            <section className="d-flex justify-content-center align-items-center mt-3">
                                                <button className="noBtnStyles" onClick={handlePausePlayBtnClick}>
                                                    {isCarouselPaused ? <BsFillPlayCircleFill className="fs-larger" /> : <BsFillPauseCircleFill className="fs-larger" />}
                                                </button>
                                            </section>
                                        </section>
                                    </div>
                                </>
                            }
                            {(pics && isCardOnly) &&
                                <div className="w-100">
                                    <section className="w-100 d-flex flex-column flex-sm-row justify-content-center align-items-center">
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
                            {(isCardOnly && !pics) &&
                                <div className="w-100 d-flex justify-content-center align-items-center">
                                    <span className="text-dark fst-italic fw200 fs-large text-center text-sm-start">
                                        For your project, we will assemble a team of contractors with skills and subject expertise to connect your work to students through accessible lessons and engaging videos.
                                    </span>
                                </div>
                            }
                        </Card.Body>
                    </Card>
                </section>
            </SectionWithBackgroundImg>
            :
            <Parallax bgImage={`${backgroundImgSrc}`} className="pt-8 pb-8 img-background-container" strength={145}>
                <section className={headerContainerClassNames}>
                    <h2 className={autoCarouselHeadingTxt}>{headingTxt}</h2>
                </section>
                <section className="d-flex justify-content-center align-items-center">
                    <Card className={cardStyles}>
                        <Card.Body className="position-relative cardBodyStyles">
                            {(userInputs && !isCardOnly) &&
                                <>
                                    <section className="position-absolute h-100 start-0 d-flex justify-content-center align-items-center pe-3">
                                        <button className="noBtnStyles pb-3 moveLeft noColorChangeOnClick btnColorChangeOnHover" onClick={() => { handleNavBtnClick(-1) }}>
                                            <IoIosArrowBack className="text-muted arrowNavigationCarousel backBtnCarousel op-5" />
                                        </button>
                                    </section>
                                    <section className="position-absolute h-100 end-0 d-flex justify-content-center align-items-center">
                                        <button className="noBtnStyles pb-3 moveRight noColorChangeOnClick btnColorChangeOnHover" onClick={() => { handleNavBtnClick(1) }}>
                                            <IoIosArrowForward className="text-muted arrowNavigationCarousel forwardBtnCarousel op-5" />
                                        </button>
                                    </section>
                                    <div className="autoCarouselContainer">
                                        <div className="autoCarouselSlider" style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}>
                                            {userInputs.map((userInput, index) => {
                                                const { feedback, person, occupation, city } = userInput;
                                                return (
                                                    <div className="autoCarouselItem position-relative" key={index}>
                                                        <section className="w-100 h-100 d-flex flex-column flex-sm-row justify-content-center align-items-center feedBackSec">
                                                            <section className="pb-sm-5 mb-sm-5 me-sm-3">
                                                                <span className="text-dark fst-italic text-center text-sm-start feedbackTxt fw275">"{feedback}"</span>
                                                            </section>
                                                            <section className="d-flex justify-content-center align-items-center align-items-sm-stretch justify-content-sm-end mt-3 mt-sm-0 feedbackInfoSec">
                                                                <section className='flex-column d-flex justify-content-center justify-content-sm-start align-items-center align-items-sm-stretch'>
                                                                    <span className="text-wrap text-center text-sm-start text-dark feedBackTxtName fst-italic fw275">- {person}</span>
                                                                    <span className="text-wrap text-dark fst-italic fw275">{occupation}</span>
                                                                    {!!city && <span className="text-wrap text-dark fst-italic fw275">{city}</span>}
                                                                </section>
                                                            </section>
                                                        </section>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <section className='d-flex flex-column justify-content-center align-items-center pb-1 mt-4 mt-sm-0'>
                                            <section className="w-100 d-flex justify-content-center align-items-center">
                                                {BULL_POINT_INDEX_NUMS.map(num => (
                                                    (num === index) ? <BsCircleFill className="text-dark ms-1" /> : <BsCircle className="text-dark ms-1" onClick={() => { handleBulletPtClick(num) }} />
                                                ))}
                                            </section>
                                            <section className="d-flex justify-content-center align-items-center mt-3">
                                                <button className="noBtnStyles" onClick={handlePausePlayBtnClick}>
                                                    {isCarouselPaused ? <BsFillPlayCircleFill className="fs-larger" /> : <BsFillPauseCircleFill className="fs-larger" />}
                                                </button>
                                            </section>
                                        </section>
                                    </div>
                                </>
                            }
                            {(pics && !isCardOnly) &&
                                <div className="w-100">
                                    <section className="w-100 d-flex flex-column flex-sm-row justify-content-center align-items-center">
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
                            {isCardOnly &&
                                <div className="w-100 d-flex justify-content-center align-items-center">
                                    <span className="text-dark fst-italic fw200 fs-large text-center text-sm-start">
                                        For your project, we will assemble a team of contractors with skills and subject expertise to connect your work to students through accessible lessons and engaging videos.
                                    </span>
                                </div>
                            }
                        </Card.Body>
                    </Card>
                </section>
            </Parallax>
    )
}

export default CarouselContainer;