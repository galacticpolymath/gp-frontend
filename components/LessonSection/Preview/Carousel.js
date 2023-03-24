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
import { useContext, useEffect, useState } from 'react';
import RenderArrowNext from './RenderArrowNext';
import { LessonsCarouselContext } from '../../../providers/LessonsCarouselProvider';

// how do I access the current picture/file that is being displayed on the ui? 




const Carousel = ({
  items,
}) => {
  const { _lessonItemsIndex } = useContext(LessonsCarouselContext);
  const [lessonItemsIndex, setLessonsItemsIndex] = _lessonItemsIndex;


  // BRAIN DUMP:

  // GOAL:
  // when the user clicks on the next button, present next item in the items array 

  const renderItemObj = items[lessonItemsIndex];
  const renderItem = () => <Slide key={lessonItemsIndex} {...renderItemObj} />;



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

  // BRAIN DUMP:
  // when RenderArrowNext is initially rendered, get the clickHandler function and store it into a state 
  // when the user clicks on the right arrow button, display the next item in the items array 
  // show this item onto the ui by getting the next item 


  // CASE: the user clicks on a bullet point 



  // CASE: the user clicks on the left arrow button
  // hi



  // CASE: the user clicks on the right arrow button
  // GOAL: show the next item in the items array



  // CASE: the user clicks on a thumbnail 




  // BRAIN DUMP:
  // check if handleBtnClick will be called whenever the user clicks on either of the nav buttons


  console.log('hey there: ');

  return items && (
    <RRCarousel
      showStatus={false}
      className={`${styles.Carousel} bg-light-gray rounded p-sm-3 display-flex carouselSelectedLessons flex-column justify-content-center align-items-center`}
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