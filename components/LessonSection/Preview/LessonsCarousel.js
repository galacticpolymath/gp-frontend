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
                <Button variant="outline-primary" onClick={handlePrevBtnClick} className="me-3" disabled={currentIndex === 0}><FaArrowLeft /></Button>
                <Button variant="outline-primary" onClick={handleNextBtnClick} className="ms-3" disabled={(mediaItems.length - 1) === currentIndex}><FaArrowRight /></Button>
            </section>
        </div>
    );
}

export default LessonsCarousel;