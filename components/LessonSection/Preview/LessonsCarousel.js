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
import { useState } from 'react';
import LessonSlide from './LessonSlide';
import { getVideoThumb } from './utils';
import Image from 'next/image';
import Dot from '../NavDots/Dot';


const LessonsCarousel = ({ mediaItems }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
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
        });
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
        });
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
        });
    }

    return (
        // put the parent div into its own component
        <div className='shadow rounded p-0 display-flex flex-column justify-content-center autoCarouselContainer'>
            <section className='row mt-0'>
                <section
                    style={{ height: 'fit-content' }}
                    className="col-12 mt-0"
                >
                    <div
                        className="autoCarouselSlider mt-0"
                        style={{ transform: `translate3d(${-currentIndex * 100}%, 0, 0)` }}
                    >
                        {mediaItems?.length && mediaItems.sort((lessonDocumentA, lessonDocumentB) => lessonDocumentA.order - lessonDocumentB.order).map((lessonDocument, index) => {
                            return (
                                <LessonSlide
                                    key={index}
                                    forLsn={lessonDocument.forLsn ?? lessonDocument.forPart}
                                    {...lessonDocument}
                                />
                            );
                        })}
                    </div>
                </section>
            </section>
            <section className="d-flex justify-content-center align-items-center m-0">
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
                    className={`noBtnStyles p-0 ${((mediaItems?.length - 1) === currentIndex) ? 'btn-disabled' : ''}`}
                    disabled={(mediaItems?.length - 1) === currentIndex}>
                    <i className="fs-1 text-black bi-arrow-right-circle-fill lh-1 d-block" />
                </button>
            </section>
            <section className="mt-1">
                <ul className='ps-0 mb-0 d-flex flex-wrap justify-content-center align-items-center' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transitionDuration': '3500ms', transition: 'all .15s ease-in', listStyle: 'none' }}>
                    {controlDots?.length && controlDots.map((item, index) => {
                        const { type, title, mainLink, isVisible, webAppPreviewImg } = item;
                        let src;

                        if ((type === 'video') || ((type === 'web-app') && webAppPreviewImg)) {
                            src = webAppPreviewImg ?? getVideoThumb(mainLink)
                        }

                        return (
                            <li
                                role='button'
                                style={{ transition: "background-color .15s ease-in" }}
                                key={index}
                                onClick={() => handleDotOrThumbNailClick(index)}
                                className={`d-inline-block me-sm-2 p-sm-2 justify-content-center align-items-center position-relative thumbnailLi ${isVisible ? 'itemVisible' : 'itemNotVisible'}`} >
                                <div className='w-100 h-100 d-none d-sm-block'>
                                    {(type === 'video') || ((type === 'web-app') && webAppPreviewImg) ?
                                        <div className="position-relative w-100 h-100">
                                            <Image
                                                src={src}
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
                                </div>
                                <div className='w-100 h-100 d-block d-sm-none'>
                                    <Dot isHighlighted={isVisible} />
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </section>
        </div>
    );
}

export default LessonsCarousel;


