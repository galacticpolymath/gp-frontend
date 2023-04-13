/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-tag-spacing */
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
import { useMemo, useState } from 'react';
import styles from './index.module.scss';
import LessonSlide from './LessonSlide';
import { customControls, getVideoThumb } from './utils';
import { Button } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Image from 'next/image';
import { useEffect } from 'react';


const LessonsCarousel = ({ mediaItems }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [willApplyStyles, setWillApplyStyles] = useState(false);
    const mediaItemsSorted = mediaItems ? mediaItems.sort((lessonDocumentA, lessonDocumentB) => lessonDocumentA.order - lessonDocumentB.order).map((item, index) => ({ ...item, isVisible: index === 0 })) : []
    const [controlDots, setControlDots] = useState(mediaItemsSorted);

    const handleNextBtnClick = () => {
        const newItemIndexOnUI = currentIndex + 1
        setCurrentIndex(newItemIndexOnUI);
        setControlDots(controlDots => {
            return controlDots.map((item, index) => {
                if (index === newItemIndexOnUI) {
                    return { ...item, isVisible: true }
                }

                return { ...item, isVisible: false }
            })
        })
    }

    const handlePrevBtnClick = () => {
        const newItemIndexOnUI = currentIndex - 1
        setCurrentIndex(newItemIndexOnUI);
        setControlDots(controlDots => {
            return controlDots.map((item, index) => {
                if (index === newItemIndexOnUI) {
                    return { ...item, isVisible: true }
                }

                return { ...item, isVisible: false }
            })
        })
    }

    const handleDotOrThumbNailClick = selectedItemIndex => {
        setCurrentIndex(selectedItemIndex);
        setControlDots(controlDots => {
            return controlDots.map((item, index) => {
                if (index === selectedItemIndex) {
                    return { ...item, isVisible: true }
                }

                return { ...item, isVisible: false }
            })
        })
    }

    useEffect(() => {
        setWillApplyStyles(true);
    }, [])



    return (
        <div className={`bg-light-gray rounded p-sm-3 display-flex carouselSelectedLessons flex-column justify-content-center align-items-center container ${styles.Carousel}`} >
            <section className='row'>
                <section
                    style={{ height: 'fit-content' }}
                    className="autoCarouselContainer col-12"
                >
                    <div
                        className="autoCarouselSlider"
                        style={{ transform: `translate3d(${-currentIndex * 100}%, 0, 0)` }}
                    >
                        {mediaItems && mediaItems.sort((lessonDocumentA, lessonDocumentB) => lessonDocumentA.order - lessonDocumentB.order).map((lessonDocument, index) => <LessonSlide key={index} {...lessonDocument} />)}
                    </div>
                </section>
            </section>
            <section className="d-flex justify-content-center align-items-center mt-1 mt-sm-4">
                <button
                    variant="outline-none"
                    onClick={handlePrevBtnClick}
                    className={`noBtnStyles me-2 p-0 ${(0 === currentIndex) ? 'btn-disabled' : ''}`}
                    disabled={currentIndex === 0}
                >
                    <i className="fs-1 text-black bi-arrow-left-circle-fill lh-1 d-block" />
                </button>
                <button
                    onClick={handleNextBtnClick}
                    className={`noBtnStyles ms-2 p-0 ${((mediaItems?.length - 1) === currentIndex) ? 'btn-disabled' : ''}`}
                    disabled={(mediaItems?.length - 1) === currentIndex}>
                    <i className="fs-1 text-black bi-arrow-right-circle-fill lh-1 d-block" />
                </button>
            </section>
            <section className="mt-3">
                <ul className='ps-0 mb-0 d-flex flex-wrap justify-content-center align-items-center' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transitionDuration': '3500ms', transition: 'all .15s ease-in', listStyle: 'none' }}>
                    {controlDots?.length && controlDots.map((item, index) => {
                        const { type, title, mainLink, isVisible } = item;

                        return (
                            <li
                                role='button'
                                style={{ width: 80, height: 65, backgroundColor: isVisible ? '#f5c1e3' : 'white', transition: "background-color .15s ease-in" }}
                                key={index}
                                onClick={() => handleDotOrThumbNailClick(index)}
                                className='d-none d-sm-inline-block me-2 p-2 justify-content-center align-items-center position-relative'>
                                {(type === 'video') ?
                                    <div className="position-relative w-100 h-100">
                                        <Image
                                            src={getVideoThumb(mainLink)}
                                            alt={title}
                                            fill
                                            sizes="62px"
                                        />
                                    </div>
                                    :
                                    <i
                                        key={index}
                                        className="bi-filetype-pdf fs-2"
                                    />}
                            </li>
                        )
                    })}
                </ul>
            </section>
        </div>
    );
}

export default LessonsCarousel;


