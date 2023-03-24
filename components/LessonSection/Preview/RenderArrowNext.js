/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable brace-style */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import { useContext } from "react";
import { LessonsCarouselContext } from "../../../providers/LessonsCarouselProvider";

const RenderArrowNext = (clickHandler, hasNext) => {
    const { _lessonItemsIndex } = useContext(LessonsCarouselContext);
    // const [, setLessonItemsIndex] = _lessonItemsIndex;
    console.log('clickHandler: ', clickHandler);
    // GOAL: use a function to update the index of the current item that is being displayed
    // the function is received from the context provider and is called in the clickHandler function 
    // import the function that will update the index of the current item

    const _clickHandler = () => {
        console.log('clickHandler was called');
        clickHandler();
    };

    return (
        <button
            disabled={!hasNext}
            onClick={_clickHandler}
            className='btn bg-transparent m-0 p-1'
        >
            <i className="fs-1 text-black bi-arrow-right-circle-fill lh-1 d-block"></i>
        </button>
    );
};

export default RenderArrowNext;