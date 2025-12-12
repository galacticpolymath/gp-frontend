import React, { PropsWithChildren } from 'react';
import Slider from 'react-slick';
import LessonSlide from './Preview/LessonSlide';
import { getMediaComponent } from './Preview/utils';
import { LESSON_ITEMS_MODAL_BG_COLOR } from './Modals/LessonItemsModal';

interface ImageSliderProps extends PropsWithChildren {
    currentIndex: number
    backgroundColor?: string
}
interface IItemCarousel extends PropsWithChildren {
    backgroundColor?: string;
}

export const CarouselItem: React.FC<IItemCarousel> = ({
    backgroundColor,
    children
}) => {
    return (
        <div style={{ backgroundColor }} className='autoCarouselItem onLessonsPg h-100'>
            <div style={{ backgroundColor }} className='pb-0 w-100'>
                <div style={{ backgroundColor }} className='lesson-items-modal-container'>
                    {children}
                </div>
            </div>
        </div>
    )
}

const ItemsCarousel: React.FC<ImageSliderProps> = ({ currentIndex, backgroundColor, children }) => {
    return (
        <div
            className="autoCarouselSlider mt-0 w-100 h-100"
            style={{ transform: `translate3d(${-currentIndex * 100}%, 0, 0)`, backgroundColor }}
        >
            {children}
        </div>
    );
}


export default ItemsCarousel;