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
  const { renderArrowNext, renderArrowPrev, ..._customControls } = customControls;
  const [toggleCompRender, setToggleCompRender] = useState(0);

  const handleNextBtn = () => {
    setToggleCompRender(toggleCompRender + 1);
  };

  const _renderArrowNext = () => <button
    disabled={false}
    onClick={handleNextBtn}
    className='btn bg-transparent m-0 p-1'
  >
    <i className="fs-1 text-black bi-arrow-right-circle-fill lh-1 d-block"></i>
  </button>;

  return items && (
    <RRCarousel
      showStatus={false}
      className={`${styles.Carousel} bg-light-gray rounded p-sm-3 display-flex carouselSelectedLessons flex-column justify-content-center align-items-center`}
      renderArrowNext={renderArrowNext}
      renderArrowPrev={renderArrowPrev}
      {..._customControls}
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