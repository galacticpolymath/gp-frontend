 
 
 
 
 
 
import { createContext, useState } from "react";

export const LessonsCarouselContext = createContext(null);

export const LessonsCarouselProvider = ({ children }) => {
    const [lessonItemsIndex, setLessonItemsIndex] = useState(0)
    const [getNextItemFn, setGetNextItemFn] = useState(null)
    const _lessonItemsIndex = [lessonItemsIndex, setLessonItemsIndex];
    const _showNextItem = [getNextItemFn, setGetNextItemFn];

    return (
        <LessonsCarouselContext.Provider value={{ _lessonItemsIndex, _showNextItem }}>
            {children}
        </LessonsCarouselContext.Provider>
    )
}