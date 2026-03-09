 
 
 
 

import { useEffect, useState } from "react";
import { useContext } from "react";
import { LessonsCarouselContext } from "../../../providers/LessonsCarouselProvider";

const RenderArrowNext = ({ showNextItem, hasNext }) => {
    const { _showNextItem, _lessonItemsIndex } = useContext(LessonsCarouselContext);
    const [, setShowNextItemFn] = _showNextItem;
    const [, setLessonsItemsIndex] = _lessonItemsIndex;
    const [willChangeUI, setWillChangeUI] = useState(false);

    const handleBtnClick = event => {
        setLessonsItemsIndex(lessonsItemsIndex => lessonsItemsIndex + 1);
    };

    return (
        <button
            disabled={!hasNext}
            onClick={handleBtnClick}
            className='btn bg-transparent m-0 p-1'
        >
            <i className="fs-1 text-black bi-arrow-right-circle-fill lh-1 d-block"></i>
        </button>
    );
};

export default RenderArrowNext;