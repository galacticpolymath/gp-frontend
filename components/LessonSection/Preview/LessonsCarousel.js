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
import styles from './index.module.scss';
import LessonSlide from './LessonSlide';
import Slide from './Slide';
import { Button } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';


const LessonsCarousel = ({ mediaItems }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const mediaItemsSorted = mediaItems.sort((lessonDocumentA, lessonDocumentB) => lessonDocumentA.order - lessonDocumentB.order)
    const [controlDots, setControlDots] = useState(mediaItemsSorted.map((item, index) => ({ ...item, isOnUI: index === 0 })));

    const handleNextBtnClick = () => {
        console.log('next btn was clicked: ');
        setCurrentIndex(currentIndex + 1);
    }

    const handlePrevBtnClick = () => {
        console.log('next btn was clicked: ');
        setCurrentIndex(currentIndex - 1);
    }

    return (
        <div className={`bg-light-gray rounded p-sm-3 display-flex carouselSelectedLessons flex-column justify-content-center align-items-center ${styles.Carousel}`} >
            <section style={{ height: 'fit-content' }} className="autoCarouselContainer">
                <div className="autoCarouselSlider" style={{ transform: `translate3d(${-currentIndex * 100}%, 0, 0)` }}>
                    {mediaItems && mediaItems.sort((lessonDocumentA, lessonDocumentB) => lessonDocumentA.order - lessonDocumentB.order).map((lessonDocument, index) => <LessonSlide key={index} {...lessonDocument} />)}
                </div>
            </section>
            <section className="border d-flex justify-content-center align-items-center mt-4">
                <button
                    variant="outline-none"
                    onClick={handlePrevBtnClick}
                    className={`noBtnStyles me-2 p-0 ${(0 === currentIndex) ? 'btn-disabled' : ''}`}
                    disabled={currentIndex === 0}
                >
                    <i class="fs-1 text-black bi-arrow-left-circle-fill lh-1 d-block" />
                </button>
                <button
                    onClick={handleNextBtnClick}
                    className={`noBtnStyles ms-2 p-0 ${((mediaItems.length - 1) === currentIndex) ? 'btn-disabled' : ''}`}
                    disabled={(mediaItems.length - 1) === currentIndex}>
                    <i class="fs-1 text-black bi-arrow-right-circle-fill lh-1 d-block" />
                </button>
            </section>
            <section className="border d-flex justify-content-center align-items-center my-4">
                <ul className='ps-0 mb-0 d-flex justify-content-center align-items-center'>
                    {controlDots.map(({ isOnUI }, index) => (<li
                        key={index}
                        className='d-inline-block'
                        role='button'
                        style={{ border: 'none', borderColor: !isOnUI ? 'rgb(190, 190, 190)' : '' }}
                    >
                        {/* show icon for a bullet point */}
                        <i
                            // className={`bi-circle-fill ${(item.isOnUI) ? 'text-primary' : 'text-secondary'}`} 
                            style={{ backgroundColor: isOnUI ? 'rgba(44, 131, 195, 0.6)' : '', height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px',border: '2px solid #bebebe', borderColor: isOnUI ? '#2c83c3' : 'rgb(190, 190, 190)', padding: '4px', opacity: 1 }}
                        />
                    </li>))}
                </ul>
            </section>
        </div>
    );
}

export default LessonsCarousel;