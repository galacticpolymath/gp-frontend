/* eslint-disable brace-style */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { Carousel as RRCarousel } from 'react-responsive-carousel';
import PropTypes from 'prop-types';

import Slide from './Slide';
import { customControls } from './utils';

import styles from './index.module.scss';
import { useEffect, useState } from 'react';
import RenderArrowNext from './RenderArrowNext';

// how do I access the current picture/file that is being displayed on the ui? 

const Carousel = ({
  items,
}) => {
  const [itemsIndex, setItemsIndex] = useState(0);

  const handleNextBtn = () => {
    // setToggleCompRender(toggleCompRender + 1);
    setItemsIndex(itemsIndex + 1);
  };

  const handlePrevBtnClick = () => {
    setItemsIndex(itemsIndex - 1);
  };

  // BRAIN DUMP:

  // GOAL:
  // when the user clicks on the next button, present next item in the items array 

  const renderItemObj = items[itemsIndex];
  const renderItem = () => <Slide key={itemsIndex} {...renderItemObj} />;
  // const { , ..._customControls } = customControls;

  // CASE: the user clicks on the right arrow button
  
  // BUG:
  // WHAT IS HAPPENING:
  // when the user clicks on the next button, nothing is being shown on the ui 

  // WHAT I WANT:
  // when the user clicks on the right arrow button, have the following to occur:
  // present the next item in the items array
  // update the index of the current item that is being displayed

  // the next item in the items array is shown on the ui
  // the itemsIndex state is increased by one 
  // the user clicks on the right arrow button



  return items && (
    <RRCarousel
      showStatus={false}
      className={`${styles.Carousel} bg-light-gray rounded p-sm-3 display-flex carouselSelectedLessons flex-column justify-content-center align-items-center`}
      renderArrowNext={customControls.renderArrowNext}
      renderArrowPrev={customControls.renderArrowPrev}
      renderThumbs={customControls.renderThumbs}
    // renderArrowNext={customControls.renderArrowNext}
    // renderArrowPrev={renderArrowPrev}
    // renderThumbs={customControls.renderThumbs}
    // onChange={() => { console.log('item was changed'); }}
    >
      {items.sort((a, b) => a.order - b.order).map((item, i) => <Slide key={i} {...item} />)}
    </RRCarousel>
  );
};

Carousel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    order: PropTypes.number,
  })),
};

export default Carousel;