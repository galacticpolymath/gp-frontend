import React from 'react';
import Slider from 'react-slick';
import LessonSlide from './Preview/LessonSlide';

interface IProps {
    items: any,
    currentIndex: number
}

const ImageSlider = ({ items, currentIndex }: IProps) => {
    const settings = {
        dots: true,
    };

    return (
        <div
            className="autoCarouselSlider mt-0"
            style={{ transform: `translate3d(${-currentIndex * 100}%, 0, 0)` }}
        >
            {items.map((item, index) => {
                const url =
                    item.itemCat === "web resource"
                        ? item.externalUrl
                        : item.docUrl;
                return (
                    <LessonSlide
                        mainLink={url}
                        key={index}
                        type="video"
                        iframeStyle={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                );
            })}
        </div>
    );
}


export default ImageSlider;