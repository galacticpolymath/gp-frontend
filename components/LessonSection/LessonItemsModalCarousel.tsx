import React, { PropsWithChildren } from 'react';

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