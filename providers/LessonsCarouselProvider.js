/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { createContext, useState } from "react";

export const LessonsCarouselContext = createContext(null);

export const LessonsCarouselProvider = ({ children }) => {
    const [lessonItemsIndex, setLessonItemsIndex] = useState()
    const _lessonItemsIndex = [lessonItemsIndex, setLessonItemsIndex];

    return (
        <LessonsCarouselContext.Provider value={{ _lessonItemsIndex }}>
            {children}
        </LessonsCarouselContext.Provider>
    )
}