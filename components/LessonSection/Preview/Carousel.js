import { Carousel as RRCarousel } from 'react-responsive-carousel';
import PropTypes from 'prop-types';

import Slide from './Slide';
import { customControls } from './utils';

import styles from './index.module.scss';
import { useContext, useEffect, useState } from 'react';
import { LessonsCarouselContext } from '../../../providers/LessonsCarouselProvider';

const Carousel = ({ items }) => {
  const { _lessonItemsIndex } = useContext(LessonsCarouselContext);
  const [lessonItemsIndex, setLessonsItemsIndex] = _lessonItemsIndex;
  const renderItemObj = items[lessonItemsIndex];
  const renderItem = () => <Slide key={lessonItemsIndex} {...renderItemObj} />;

  return items && (
    <RRCarousel
      showStatus={false}
      className={`${styles.Carousel} bg-light-gray rounded p-sm-3 display-flex 
      carouselSelectedLessons flex-column justify-content-center align-items-center
      `}
      renderThumbs={customControls.renderThumbs}
      renderItem={renderItem}
      {...customControls}
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