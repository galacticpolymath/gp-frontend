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

  const _renderArrowNext = () => <button
    disabled={itemsIndex === (items.length - 1)}
    onClick={handleNextBtn}
    className='btn bg-transparent m-0 p-1'
  >
    <i className="fs-1 text-black bi-arrow-right-circle-fill lh-1 d-block"></i>
  </button>;

  const _renderArrowPrev = () => <button
    onClick={handlePrevBtnClick}
    disabled={itemsIndex === 0}
    className='btn bg-transparent m-0 p-1'
  >
    <i className="fs-1 text-black bi-arrow-left-circle-fill lh-1 d-block"></i>
  </button>;

  const renderItemObj = items[itemsIndex];
  const renderItem = () => <Slide key={itemsIndex} {...renderItemObj} />;
  const { renderArrowNext, ..._customControls } = customControls;

  return items && (
    <RRCarousel
      showStatus={false}
      className={`${styles.Carousel} bg-light-gray rounded p-sm-3 display-flex carouselSelectedLessons flex-column justify-content-center align-items-center`}
      renderArrowNext={renderArrowNext}
      {..._customControls}
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