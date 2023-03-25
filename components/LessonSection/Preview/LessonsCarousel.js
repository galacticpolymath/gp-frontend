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


const LessonsCarousel = ({ mediaItems }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <div className={`bg-light-gray rounded p-sm-3 display-flex carouselSelectedLessons flex-column justify-content-center align-items-center ${styles.Carousel}`} >
            <div className="autoCarouselSlider overflow-hidden" style={{ transform: `translate3d(${-currentIndex * 100}%, 0, 0)` }}>
                {mediaItems && mediaItems.sort((lessonDocumentA, lessonDocumentB) => lessonDocumentA.order - lessonDocumentB.order).map((lessonDocument, index) => <LessonSlide key={index} {...lessonDocument} />)}
            </div>
        </div>
    );
}

export default LessonsCarousel;