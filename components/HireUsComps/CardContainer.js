/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-tag-spacing */
/* eslint-disable curly */
 
/* eslint-disable brace-style */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable prefer-template */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable quotes */
 
 
 
/* eslint-disable react/jsx-indent-props */
/* eslint-disable semi */
 
 
/* eslint-disable react/jsx-max-props-per-line */
 
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */


import { useEffect, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import Image from 'next/image';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BsCircle, BsCircleFill, BsFillPauseCircleFill, BsFillPlayCircleFill } from "react-icons/bs";
import SectionWithBackgroundImg from '../SectionWithBackgroundImg';
import { Parallax } from 'react-parallax';

const CarouselContainer = ({
    headingTxt,
    _userInputs,
    backgroundImgSrc,
    pics,
    autoCarouselHeadingTxtClassNames,
    headerContainerClassNamesDynamic,
    isCardOnly,
    dynamicCssClasses,
    customCardStyles,
    _customBulletPtsSecCss,
    _autoCarouselContainerStyles,
}) => {
    const autoCarouselHeadingTxt = `bolder defaultHeadingCarouselStyles text-center ${autoCarouselHeadingTxtClassNames ?? 'headingCarousel'}`;
    const headerContainerClassNames = `d-flex justify-content-center align-items-center ${headerContainerClassNamesDynamic ?? ""}`
    let cardStyles = `autoCarouselContainerCard ${pics ? 'mt-3 picsCardContainer' : ''}`;
    cardStyles = isCardOnly ? (cardStyles + 'cardOnlyStyles mt-3 fw245') : cardStyles
    let customBulletPtsSecCss = _customBulletPtsSecCss ? `mt-md-0 mb-2 position-absolute ${_customBulletPtsSecCss}` : 'mt-md-0 mb-2 position-absolute'
    let autoCarouselContainerStyles = `autoCarouselContainer ${_autoCarouselContainerStyles}`
    const userInputs = _userInputs?.isTeachersAndStudentsTestimonies ? _userInputs.arr : _userInputs;

    if (customCardStyles) {
        cardStyles += ' ' + customCardStyles
    }

    if (!customCardStyles) {
        cardStyles += ' ' + "pt-1 pb-4 pe-2"
    }

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
                () => setIndex(prevIndex => {
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
            <SectionWithBackgroundImg backgroundImgSrc={backgroundImgSrc} dynamicCssClasses={dynamicCssClasses}>
                <section className={headerContainerClassNames}>
                    <h2 className={autoCarouselHeadingTxt}>{headingTxt}</h2>
                </section>
                <section className="d-flex justify-content-center align-items-center ">
                    <Card className={cardStyles}>
                        <Card.Body className="position-relative cardBodyStyles">
                            {(pics && isCardOnly) &&
                                <div className="w-100 ">
                                    <section className="w-100 d-flex flex-column imgsSecCardContainer flex-sm-row justify-content-center align-items-center">
                                        {
                                            pics.map(({ path, alt }, index) => (
                                                index !== 3 ?
                                                    <div key={index} className="carouselImgContainer position-relative">
                                                        <Image
                                                            src={path}
                                                            alt={alt}
                                                            fill
                                                            sizes="(max-width: 575px) 125px, (max-width: 767px) 130px, 140px"
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                    :
                                                    <div key={index} style={{ width: '250px', height: "125px" }} className='position-relative d-sm-block d-flex justify-content-center align-items-center'>
                                                        <Image
                                                            src={path}
                                                            alt={alt}
                                                            fill
                                                            style={{ width: "100%", objectFit: 'contain' }}
                                                        />
                                                    </div>
                                            )
                                            )
                                        }
                                    </section>
                                </div>
                            }
                            {(isCardOnly && !pics) &&
                                <div className="w-100 d-flex justify-content-center weAssembleSec align-items-center">
                                    <span className="text-dark fst-italic fw200 text-center text-sm-start">
                                        We will assemble a team with skills and subject expertise to connect your work to students through accessible lessons and engaging videos.
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
                                    <section className="position-absolute h-100 start-0 d-flex justify-content-center align-items-center pe-3 pe-md-0 navBtnSec">
                                        <button className="noBtnStyles pb-md-0 pb-5 noColorChangeOnClick btnColorChangeOnHover navBtnLeftCarousel" onClick={() => { handleNavBtnClick(-1) }}>
                                            <IoIosArrowBack className="text-muted arrowNavigationCarousel backBtnCarousel op-5" />
                                        </button>
                                    </section>
                                    <section className="position-absolute h-100 end-0 d-flex justify-content-center align-items-center navBtnSec">
                                        <button className="noBtnStyles pb-md-0 pb-5 noColorChangeOnClick btnColorChangeOnHover navBtnRightCarousel" onClick={() => { handleNavBtnClick(1) }}>
                                            <IoIosArrowForward className="text-muted arrowNavigationCarousel forwardBtnCarousel op-5" />
                                        </button>
                                    </section>
                                    <div className={autoCarouselContainerStyles}>
                                        <div className="autoCarouselSlider" style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}>
                                            {userInputs.map((userInput, index) => {
                                                const { feedback, person, occupation, city, stars, product, institution, location, cssClass, uniqueCssClass, quoteInfo } = userInput;

                                                return (
                                                    <div className={`${cssClass} autoCarouselItem position-relative ${uniqueCssClass ?? ''}`} key={index}>
                                                        <section className="w-100 h-100 d-flex flex-column flex-sm-row justify-content-sm-start justify-content-sm-center  align-items-center justify-content-md-start align-items-md-stretch position-relative">
                                                            {stars &&
                                                                <span className="text-dark fst-italic fw275 productReviewTxt d-none d-sm-inline text-center">
                                                                    {`⭐ ${stars}/5`} stars {<>for '<i>{product}</i>':</>}
                                                                </span>
                                                            }
                                                            <section className='pb-md-0 mb-md-0 me-md-0  d-flex justify-content-center align-items-center w-100'>
                                                                <span className="text-dark fst-italic text-center text-sm-start feedbackTxt fw275 position-relative">
                                                                    "{feedback}"
                                                                    <span className={`'d-none d-sm-flex justify-content-center align-items-center align-items-sm-stretch justify-content-sm-end mt-3 mt-sm-0 quoteInfoTxts position-absolute ${quoteInfo ?? ""}`} >
                                                                        <span className='flex-column d-none d-sm-flex justify-content-center align-items-center align-items-sm-stretch quoteInfoSpan'>
                                                                            <span className="text-wrap text-center text-sm-start text-dark feedBackTxtName fst-italic fw275">- {person}</span>
                                                                            {(!!occupation || !!institution) && <span className="text-wrap text-center text-sm-start text-dark fst-italic fw275">{occupation ?? institution}</span>}
                                                                            {(!!city || !!location) && <span className="text-center text-sm-start text-wrap text-dark fst-italic fw275">{city ?? location}</span>}
                                                                            {!!stars && <span className="text-dark productReviewTxt w-100 text-center text-sm-start fst-italic fw275 d-block d-sm-none">
                                                                                {`⭐ ${stars}/5`} stars {<>for '<i>{product}</i>'</>}
                                                                            </span>}
                                                                        </span>
                                                                    </span>
                                                                </span>
                                                            </section>
                                                            <section className={`d-flex d-sm-none justify-content-center align-items-center align-items-sm-stretch justify-content-sm-end mt-3 mt-sm-0  ${quoteInfo ?? ""}`}>
                                                                <section className='flex-column d-flex justify-content-center  align-items-center align-items-sm-stretch'>
                                                                    <span className="text-wrap text-center text-sm-start text-dark feedBackTxtName fst-italic fw275">- {person}</span>
                                                                    {(!!occupation || !!institution) && <span className="text-wrap text-dark fst-italic fw275 text-center text-sm-start">{occupation ?? institution}</span>}
                                                                    {(!!city || !!location) && <span className="text-wrap text-dark fst-italic fw275 text-center text-sm-start">{city ?? location}</span>}
                                                                    {!!stars && <span className="text-dark w-100 text-center fst-italic fw275 d-block d-sm-none">
                                                                        {`⭐ ${stars}/5`} stars {<>for '<i>{product}</i>'</>}
                                                                    </span>}
                                                                </section>
                                                            </section>
                                                        </section>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            }
                            {(userInputs && !isCardOnly) &&
                                <section className={`d-flex flex-column justify-content-center align-items-center pb-1 mt-4 bottom-0 start-50 end-50 mt-sm-3 ${customBulletPtsSecCss}`}>
                                    <div className="position-relative">
                                        <section className="w-100 d-flex justify-content-center align-items-center">
                                            {BULL_POINT_INDEX_NUMS.map((num, _index) => (
                                                (num === index) ?
                                                    <BsCircleFill
                                                        key={_index}
                                                        className="text-dark ms-1"
                                                    />
                                                    :
                                                    <BsCircle
                                                        className="text-dark ms-1"
                                                        key={_index}
                                                        onClick={() => { handleBulletPtClick(num) }}
                                                    />
                                            ))}
                                        </section>
                                        <section className="d-flex justify-content-center align-items-center mt-1 mt-md-2">
                                            <button className="noBtnStyles" onClick={handlePausePlayBtnClick}>
                                                {isCarouselPaused ? <BsFillPlayCircleFill className="fs-larger" /> : <BsFillPauseCircleFill className="fs-larger" />}
                                            </button>
                                        </section>
                                    </div>
                                </section>
                            }
                        </Card.Body>
                    </Card>
                </section>
            </Parallax>
    )
}

export default CarouselContainer;