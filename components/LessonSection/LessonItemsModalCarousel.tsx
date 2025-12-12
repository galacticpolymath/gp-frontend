import React from 'react';
import Slider from 'react-slick';
import LessonSlide from './Preview/LessonSlide';
import { getMediaComponent } from './Preview/utils';
import { LESSON_ITEMS_MODAL_BG_COLOR } from './Modals/LessonItemsModal';

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
            className="autoCarouselSlider mt-0 w-100 h-100"
            style={{ transform: `translate3d(${-currentIndex * 100}%, 0, 0)`, backgroundColor: LESSON_ITEMS_MODAL_BG_COLOR }}
        >                        {items.map((item, index) => {
            const url =
                item.itemCat === "web resource"
                    ? item.externalUrl
                    : item.docUrl;
            const media = getMediaComponent({
                type: 'lesson-item-doc',
                mainLink: url,
                webAppImgAlt: undefined,
                webAppPreviewImg: undefined,
                iframeStyle: {
                    top: 0,
                    left: 0,
                    position: 'static',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                }
            })

            return (
                <div style={{ backgroundColor: LESSON_ITEMS_MODAL_BG_COLOR }} className='autoCarouselItem onLessonsPg h-100'>
                    <div style={{ backgroundColor: LESSON_ITEMS_MODAL_BG_COLOR }} className='pb-0 w-100'>
                        <div style={{ backgroundColor: LESSON_ITEMS_MODAL_BG_COLOR }} className='lesson-items-modal-container'>
                            {media}
                        </div>
                    </div>
                </div>
            );
        })}
        </div>
    );
}


export default ImageSlider;